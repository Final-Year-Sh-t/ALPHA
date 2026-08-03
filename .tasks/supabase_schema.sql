-- ==========================================
-- SUPABASE COMPLETE POSTGRES SCHEMA
-- Project: verifyidv3 (Vite + React + Supabase)
-- Target: Supabase Postgres Engine
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.staff_role AS ENUM ('verifier', 'registrar', 'security', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.verification_status AS ENUM ('active', 'inactive', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES DEFINITION

-- Institutions Table (Tenant Organization)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#0F172A',
    secondary_color TEXT DEFAULT '#3B82F6',
    welcome_text TEXT DEFAULT 'Welcome to Official Document & ID Verification System',
    allow_public_verification BOOLEAN DEFAULT true,
    require_photo BOOLEAN DEFAULT false,
    enforce_expiry BOOLEAN DEFAULT true,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User Roles Table (Multi-tenant RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'user',
    staff_type public.staff_role,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT user_roles_user_inst_role_key UNIQUE (user_id, institution_id, role)
);

-- Index Records Table (Core ID / Document Records)
CREATE TABLE IF NOT EXISTS public.index_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    index_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    organization TEXT NOT NULL,
    photo_url TEXT,
    status public.verification_status NOT NULL DEFAULT 'active',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Verification Logs Table (Audit & Analytics Timeline)
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    index_number TEXT NOT NULL,
    verification_result BOOLEAN NOT NULL,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. AUTOMATED UPDATED_AT TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_index_records_updated_at
BEFORE UPDATE ON public.index_records
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. AUTOMATED PROFILE CREATION ON USER SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. HELPER FUNCTIONS & RPCs FOR APP LOGIC

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(_user_id, 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get primary institution for user
CREATE OR REPLACE FUNCTION public.get_user_institution(_user_id UUID)
RETURNS UUID AS $$
DECLARE
    inst_id UUID;
BEGIN
    SELECT institution_id INTO inst_id
    FROM public.user_roles
    WHERE user_id = _user_id AND is_active = true AND institution_id IS NOT NULL
    LIMIT 1;
    
    RETURN inst_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get all institutions user belongs to
CREATE OR REPLACE FUNCTION public.get_user_institutions(_user_id UUID)
RETURNS TABLE (
    institution_id UUID,
    institution_name TEXT,
    institution_slug TEXT,
    is_active BOOLEAN,
    role public.app_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id AS institution_id,
        i.name AS institution_name,
        i.slug AS institution_slug,
        ur.is_active,
        ur.role
    FROM public.user_roles ur
    JOIN public.institutions i ON i.id = ur.institution_id
    WHERE ur.user_id = _user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Switch active institution
CREATE OR REPLACE FUNCTION public.switch_active_institution(_institution_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_roles
    SET is_active = (institution_id = _institution_id)
    WHERE user_id = (SELECT auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create institution for current user
CREATE OR REPLACE FUNCTION public.create_institution_for_current_user(_name TEXT)
RETURNS UUID AS $$
DECLARE
    new_inst_id UUID;
    base_slug TEXT;
    final_slug TEXT;
BEGIN
    base_slug := lower(regexp_replace(_name, '[^a-zA-Z0-9]', '-', 'g'));
    final_slug := base_slug || '-' || substring(gen_random_uuid()::text, 1, 6);

    INSERT INTO public.institutions (name, slug)
    VALUES (_name, final_slug)
    RETURNING id INTO new_inst_id;

    INSERT INTO public.user_roles (user_id, institution_id, role, is_active)
    VALUES ((SELECT auth.uid()), new_inst_id, 'admin', true);

    UPDATE public.profiles
    SET institution_id = new_inst_id
    WHERE user_id = (SELECT auth.uid());

    RETURN new_inst_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. PERFORMANCE & SEARCH INDEXES

-- Foreign key indexes (Supabase Performance Best Practice: query-missing-indexes)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON public.profiles(institution_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_institution_id ON public.user_roles(institution_id);

CREATE INDEX IF NOT EXISTS idx_index_records_institution_id ON public.index_records(institution_id);
CREATE INDEX IF NOT EXISTS idx_index_records_created_by ON public.index_records(created_by);

CREATE INDEX IF NOT EXISTS idx_verification_logs_institution_id ON public.verification_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_verified_by ON public.verification_logs(verified_by);

-- UI Search & Filter Indexes
CREATE INDEX IF NOT EXISTS idx_index_records_search ON public.index_records(institution_id, index_number);
CREATE INDEX IF NOT EXISTS idx_index_records_full_name ON public.index_records(full_name);
CREATE INDEX IF NOT EXISTS idx_index_records_status ON public.index_records(status);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON public.verification_logs(created_at DESC);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.index_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Institutions Policies
CREATE POLICY "Institutions are readable by everyone if public or member" ON public.institutions
    FOR SELECT USING (
        allow_public_verification = true OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.institutions.id
        ) OR
        public.is_super_admin((SELECT auth.uid()))
    );

CREATE POLICY "Super admins and institution admins can update institution settings" ON public.institutions
    FOR UPDATE USING (
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.institutions.id
              AND role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create institutions" ON public.institutions
    FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Profiles Policies
CREATE POLICY "Users can view their own profile or profiles in same institution" ON public.profiles
    FOR SELECT USING (
        user_id = (SELECT auth.uid()) OR
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur1
            JOIN public.user_roles ur2 ON ur1.institution_id = ur2.institution_id
            WHERE ur1.user_id = (SELECT auth.uid()) AND ur2.user_id = public.profiles.user_id
        )
    );

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- User Roles Policies
CREATE POLICY "Users can view their own roles or admins can view institution roles" ON public.user_roles
    FOR SELECT USING (
        user_id = (SELECT auth.uid()) OR
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.user_roles.institution_id
              AND role = 'admin'
        )
    );

CREATE POLICY "Super admins and institution admins can manage user roles" ON public.user_roles
    FOR ALL USING (
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.user_roles.institution_id
              AND role = 'admin'
        )
    );

-- Index Records Policies
CREATE POLICY "Index records are publicly searchable if institution enables public verification" ON public.index_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.institutions
            WHERE id = public.index_records.institution_id
              AND allow_public_verification = true
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.index_records.institution_id
        ) OR
        public.is_super_admin((SELECT auth.uid()))
    );

CREATE POLICY "Institution staff can insert index records" ON public.index_records
    FOR INSERT WITH CHECK (
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.index_records.institution_id
        )
    );

CREATE POLICY "Institution admins can update index records" ON public.index_records
    FOR UPDATE USING (
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.index_records.institution_id
              AND role = 'admin'
        )
    );

CREATE POLICY "Institution admins can delete index records" ON public.index_records
    FOR DELETE USING (
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.index_records.institution_id
              AND role = 'admin'
        )
    );

-- Verification Logs Policies
CREATE POLICY "Public verification logs can be created by anyone verifying" ON public.verification_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Institution members can view verification logs for their institution" ON public.verification_logs
    FOR SELECT USING (
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.verification_logs.institution_id
        )
    );

CREATE POLICY "Institution admins can delete verification logs" ON public.verification_logs
    FOR DELETE USING (
        public.is_super_admin((SELECT auth.uid())) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid())
              AND institution_id = public.verification_logs.institution_id
              AND role = 'admin'
        )
    );

-- 9. STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public)
VALUES ('institution-logos', 'institution-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access for Institution Logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'institution-logos');

CREATE POLICY "Authenticated Users can Upload Institution Logos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'institution-logos' AND (SELECT auth.uid()) IS NOT NULL);
