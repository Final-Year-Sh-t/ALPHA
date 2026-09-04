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
      <section className="py-20 md:py-28 relative overflow-hidden bg-[#f6f9fc]">
        <div className="container max-w-[1200px] mx-auto px-4 sm:px-6 relative">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-slate-800 font-display">
              Everything You Need
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              A complete solution for identity verification with powerful admin tools.
            </p>
          </div>

          {/* Feature Cards List (Z-Pattern Layout) */}
          <div className="space-y-16 md:space-y-24">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;
              return (
                <div
                  key={feature.title}
                  className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20"
                >
                  {/* Orb Column */}
                  <div
                    className={`flex justify-center ${
                      isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Background Soft Radial Glow */}
                      <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-cyan-200/40 blur-3xl pointer-events-none" />

                      {/* Outer Border Ring */}
                      <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-full border border-blue-200/80 bg-blue-50/40 flex items-center justify-center">
                        {/* Orbiting Green Dot Top-Right */}
                        <div className="absolute top-2 right-4 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
                        
                        {/* Orbiting Blue Dot Bottom-Left */}
                        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />

                        {/* Main Gradient Icon Sphere */}
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[#3b52f6] via-[#2563eb] to-[#6336f7] flex items-center justify-center shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-transform duration-300">
                          <Icon className="w-16 h-16 md:w-20 md:h-20 text-white" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Column */}
                  <div
                    className={`text-left ${
                      isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div className="max-w-md mx-auto lg:mx-0">
                      {/* Step Number Badge */}
                      <div className="text-4xl md:text-5xl font-bold text-[#bde0fe] mb-2 tracking-tight">
                        {feature.number}
                      </div>

                      {/* Feature Title */}
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 font-display">
                        {feature.title}
                      </h3>

                      {/* Feature Description */}
                      <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-4">
                        {feature.description}
                      </p>

                      {/* Decorative Line */}
                      <div className="h-[3px] w-14 bg-gradient-to-r from-blue-600 to-teal-400 rounded-full" />
                    </div>
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