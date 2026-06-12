"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import Navbar from "@/components/navbar";
import BentoGrid from "@/components/ui/bento-grid";
import {
  Droplets,
  Check,
  Bell,
  Calendar,
  Star,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pt-16 pb-20 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full font-body text-xs font-medium text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Free personal life manager
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-medium tracking-tight max-w-3xl">
              Stay organized, hydrated, and focused
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground font-body leading-relaxed max-w-xl">
              A calm space for your todos, reminders, events, and mindful
              moments. Everything you need, nothing you don&apos;t.
            </p>
            <div className="mt-10 flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/todos"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Go to your todos
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Get started
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">
                Everything in one place
              </h2>
              <p className="mt-3 text-muted-foreground font-body max-w-lg mx-auto">
                Six simple modules designed to help you stay on top of your day
                without the overwhelm.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Droplets}
                title="Water Tracker"
                description="Track daily hydration with simple check-ins and gentle reminders."
              />
              <FeatureCard
                icon={Check}
                title="Todos"
                description="Organize tasks by priority. Done is better than perfect."
              />
              <FeatureCard
                icon={Bell}
                title="Reminders"
                description="Never miss what matters. Time-based and repeat alerts."
              />
              <FeatureCard
                icon={Calendar}
                title="Events"
                description="Plan your week with a clean calendar view that stays out of your way."
              />
              <FeatureCard
                icon={Star}
                title="Notes"
                description="Quick thoughts, saved instantly. Pin what matters most."
              />
              <FeatureCard
                icon={Zap}
                title="Food Scan"
                description="Snap a photo, identify food, and get calorie info instantly."
              />
            </div>
          </div>
        </section>

        {/* Logged-in user dashboard preview */}
        {isAuthenticated && (
          <section className="px-6 py-20 border-t border-border bg-muted/30">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight mb-4">
                Welcome back
              </h2>
              <p className="text-muted-foreground font-body mb-8">
                Continue where you left off. Your todos and stats are waiting.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/todos"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  <Check size={16} />
                  View todos
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Bento preview */}
        <section className="px-6 py-20 border-t border-border bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">
                Designed for clarity
              </h2>
              <p className="mt-3 text-muted-foreground font-body max-w-md mx-auto">
                A calm, minimal interface that respects your attention.
              </p>
            </div>
            <BentoGrid
              variant="2-2"
              items={[
                {
                  icon: Target,
                  title: "Daily Goals",
                  description: "Set and achieve your personal targets every single day.",
                },
                {
                  icon: BarChart3,
                  title: "Insights",
                  description: "See patterns in your productivity and wellness over time.",
                },
                {
                  icon: Zap,
                  title: "Focus",
                  description: "Deep work timer with ambient sounds to stay in the zone.",
                },
                {
                  icon: Star,
                  title: "Quick Notes",
                  description: "Capture ideas instantly without switching apps.",
                },
              ]}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">
              Ready to find your center?
            </h2>
            <p className="mt-3 text-muted-foreground font-body">
              Join thousands of people who use Meridian to stay calm and
              productive.
            </p>
            <div className="mt-8">
              {isAuthenticated ? (
                <Link
                  href="/todos"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Go to your todos
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Create free account
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
              <Droplets size={12} className="text-background" />
            </div>
            <span className="font-heading text-sm font-medium tracking-tight">
              Meridian
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            Built with Next.js, Tailwind CSS, and Radix UI.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl hover:border-foreground/20 transition-colors">
      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mb-4">
        <Icon size={18} className="text-foreground" />
      </div>
      <h4 className="font-heading text-lg font-medium tracking-tight">
        {title}
      </h4>
      <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed">
        {description}
      </p>
    </div>
  );
}
