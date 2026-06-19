"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import Navbar from "@/components/navbar";
import FeatureCard from "@/components/feature-card";
import MarketingFooter from "@/components/marketing-footer";
import BentoGrid from "@/components/ui/bento-grid";
import {
  Droplets,
  Check,
  Bell,
  Calendar,
  Star,
  Zap,
  Target,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Droplets,
    title: "Water Tracker",
    description: "Track daily hydration with simple check-ins and gentle reminders.",
  },
  {
    icon: Check,
    title: "Todos",
    description: "Organize tasks by priority. Done is better than perfect.",
  },
  {
    icon: Bell,
    title: "Reminders",
    description: "Never miss what matters. Time-based and repeat alerts.",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Plan your week with a clean calendar view that stays out of your way.",
  },
  {
    icon: Star,
    title: "Notes",
    description: "Quick thoughts, saved instantly. Pin what matters most.",
  },
  {
    icon: Zap,
    title: "Food Scan",
    description: "Snap a photo, identify food, and get calorie info instantly.",
  },
];

const bentoItems = [
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
];

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative px-6 pt-24 pb-28 md:pt-32 md:pb-36 overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-muted/60 to-transparent rounded-full blur-3xl"
              style={{ width: 600, height: 600 }}
            />
          </div>
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted font-body text-xs text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Now in early access
            </span>
            <h1 className="font-heading text-5xl md:text-7xl font-medium tracking-tight max-w-4xl leading-[1.1]">
              Stay organized, hydrated, and focused
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground font-body leading-relaxed max-w-2xl">
              A calm space for your todos, reminders, events, and mindful
              moments. Everything you need, nothing you don&apos;t.
            </p>
            <div className="mt-10 flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    Open dashboard
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/todos"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-muted text-foreground rounded-full font-body text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    View todos
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    Get started
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-muted text-foreground rounded-full font-body text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-28 md:py-36 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-16 md:mb-20">
              <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
                Everything in one place
              </h2>
              <p className="mt-4 text-muted-foreground font-body text-lg leading-relaxed">
                Six simple modules designed to help you stay on top of your day
                without the overwhelm.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Logged-in user dashboard preview */}
        {isAuthenticated && (
          <section className="px-6 py-28 md:py-36 border-t border-border bg-muted/30">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-5">
                Welcome back
              </h2>
              <p className="text-muted-foreground font-body text-lg mb-10">
                Continue where you left off. Your todos and stats are waiting.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  <Check size={16} />
                  Open dashboard
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Bento preview */}
        <section className="px-6 py-28 md:py-36 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-16 md:mb-20">
              <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
                Designed for clarity
              </h2>
              <p className="mt-4 text-muted-foreground font-body text-lg leading-relaxed">
                A calm, minimal interface that respects your attention.
              </p>
            </div>
            <BentoGrid variant="2-2" items={bentoItems} />
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-28 md:py-36 border-t border-border">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
              Ready to find your center?
            </h2>
            <p className="mt-5 text-muted-foreground font-body text-lg">
              Join thousands of people who use Meridianly to stay calm and
              productive.
            </p>
            <div className="mt-10">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Open dashboard
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Create free account
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
