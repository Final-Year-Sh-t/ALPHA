# Supabase Setup & Implementation Plan

> **Note on Project Framework**: Upon reviewing `package.json` and `vite.config.ts`, this project is configured as a **Vite + React (TypeScript)** application rather than Next.js. The environment variable handling and client initialization below adapt to this existing Vite architecture (`import.meta.env.VITE_*`), while also noting standard Next.js conventions if migration is planned.

---

## 1. Dependencies

### Current Status
- **`@supabase/supabase-js`** (`^2.89.0`) is **already installed** in `package.json` under `dependencies`.

### Recommended Action
- No additional package installations are strictly required to start using Supabase.
- If re-installing or updating in the execution phase, the command to run is:
  ```bash
  npm install @supabase/supabase-js
  # or using bun
  bun add @supabase/supabase-js
  ```

---

## 2. Environment Variables

Create or update `.env.local` in the project root directory (`d:\verify\verifyidv3\.env.local`). 

### Required Keys for Vite (Existing Setup):
```env
# Supabase Project URL
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anon / Publishable API Key
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key

# Optional: Project ID reference
VITE_SUPABASE_PROJECT_ID=your-project-ref
```

*(Note: If migrating to Next.js in the future, the corresponding keys would be `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.)*

---

## 3. Client Setup

The codebase currently contains a pre-configured Supabase client structure under `src/integrations/supabase/client.ts`.

### File Location: `src/integrations/supabase/client.ts`

### Exact Code Structure:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Usage Pattern:
In any component or hook, import the existing client instance:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

---

## 4. Verification & Testing

To verify the connection without breaking existing UI or logic:

1. **Check Environment Variable Resolution**:
   Confirm Vite reads `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` without returning `undefined`.

2. **Session / Auth Ping Test**:
   Execute a lightweight session fetch in a non-disruptive script or browser console:
   ```typescript
   const { data, error } = await supabase.auth.getSession();
   if (error) {
     console.error("Supabase connection error:", error.message);
   } else {
     console.log("Supabase connection successful. Active session:", data.session);
   }
   ```

3. **Database Ping Test**:
   Run a head request against an existing table schema:
   ```typescript
   const { error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
   if (!error) console.log("Database reachable!");
   ```
