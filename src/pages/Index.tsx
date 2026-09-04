import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Shield, Search, Lock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const features = [
  {
    number: '01',
    icon: Search,
    title: 'Instant Verification',
    description: 'Verify identity credentials in seconds with our streamlined lookup system.',
  },
  {
    number: '02',
    icon: Lock,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with end-to-end encryption and role-based access control.',
  },
  {
    number: '03',
    icon: Users,
    title: 'Admin Dashboard',
    description: 'Comprehensive management tools for administrators to oversee all verifications.',
  },
];


export default function Index() {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(220_90%_50%/0.15),transparent_50%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              <span>Trusted Identity Verification</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Digital Identity{' '}
              <span className="text-gradient">Verification</span>{' '}
              Made Simple
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Securely verify identities using identification numbers. Fast, reliable, and compliant with the highest security standards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {user ? (
                <Link to="/verify">
                  <Button size="lg" className="gradient-primary border-0 gap-2 w-full sm:w-auto">
                    Start Verifying
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="gradient-primary border-0 gap-2 w-full sm:w-auto">
                      Register Institution
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-slate-50/50">
        {/* Base Diagonal Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        {/* Top-Right Glowing Blur Sphere */}
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        {/* Bottom-Left Glowing Blur Sphere */}
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 relative">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
            <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              A complete solution for identity verification with powerful admin tools.
            </p>
          </div>
          {/* Feature Cards List (Z-Pattern Layout) */}
          <div className="space-y-12 md:space-y-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;
              return (
                <div
                  key={feature.title}
                  className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  } animate-slide-up`}
                  style={{ animationDelay: `${0.2 * index}s` }}
                >
                  {/* Layered Graphic Icon Orb Side */}
                  <div className="flex-1 flex justify-center relative">
                    <div className="relative">
                      {/* 1. Outer Glow Aura */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 blur-2xl scale-150 animate-pulse" />
                      {/* 2. Middle Rotating Border Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 scale-125 animate-[spin_20s_linear_infinite]" />
                      {/* 3. Main Gradient Icon Sphere */}
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-500">
                        <Icon className="w-16 h-16 md:w-20 md:h-20 text-white" strokeWidth={1.5} />
                      </div>
                      {/* 4. Orbiting Floating Dots */}
                      <div className="absolute -top-3 -right-3 w-3 h-3 rounded-full bg-emerald-500 animate-bounce" />
                      <div className="absolute -bottom-3 -left-3 w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>
                  {/* Text Content Side */}
                  <div className="flex-1 text-center lg:text-left">
                    {/* Step Number Watermark Badge */}
                    <div className="inline-block mb-2">
                      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-blue-600 to-emerald-500 bg-clip-text text-transparent opacity-20">
                        {feature.number}
                      </span>
                    </div>
                    {/* Feature Title */}
                    <h3 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    {/* Feature Description */}
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                      {feature.description}
                    </p>
                    {/* Decorative Gradient Line */}
                    <div className="mt-4 h-1 w-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full mx-auto lg:mx-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-secondary/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to verify any identity.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            {[
              { step: '01', title: 'Sign In', description: 'Create an account or sign in to access the verification portal.' },
              { step: '02', title: 'Enter Identification Number', description: 'Input the unique identification number you want to verify.' },
              { step: '03', title: 'Get Results', description: 'Instantly receive verified identity information including name, photo, and organization.' },
            ].map((item, index) => (
              <div
                key={item.step}
                className="flex gap-6 items-start mb-8 last:mb-0 animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center font-display text-xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="font-display text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center rounded-3xl gradient-hero p-12">
            <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Join thousands of organizations using VerifyID for secure identity verification.
            </p>
            {user ? (
              <Link to="/verify">
                <Button size="lg" className="gradient-accent border-0 gap-2">
                  Go to Verification
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" className="gradient-accent border-0 gap-2">
                  Register Your Institution
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}