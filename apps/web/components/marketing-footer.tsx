"use client";

import Link from "next/link";
import Logo from "@/components/logo";
import { useAuthStore } from "@/lib/auth-store";

export default function MarketingFooter() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <footer className="px-6 py-20 md:py-28 border-t border-border bg-muted/30 min-h-[50vh] flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-20">
          <div className="lg:col-span-2">
            <Logo size="md" href="/" />
            <p className="mt-6 text-muted-foreground font-body max-w-sm leading-relaxed">
              A calm space for your todos, reminders, events, and mindful moments.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <a
                href="https://x.com/arundotspace"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border hover:border-foreground/20 transition-colors"
                aria-label="Twitter"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com/akiira21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border hover:border-foreground/20 transition-colors"
                aria-label="GitHub"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm font-medium tracking-tight mb-5">
              Product
            </h4>
            <ul className="space-y-4 font-body text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/todos" className="hover:text-foreground transition-colors">Todos</Link></li>
              <li><Link href="/water" className="hover:text-foreground transition-colors">Water</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-medium tracking-tight mb-5">
              Company
            </h4>
            <ul className="space-y-4 font-body text-sm text-muted-foreground">
              {isAuthenticated ? (
                <>
                  <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                  <li><Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
                  <li><Link href="/signup" className="hover:text-foreground transition-colors">Get started</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} Meridianly. Built with care.
          </p>
          <p className="text-xs text-muted-foreground font-body">
            Next.js · Tailwind CSS · Radix UI
          </p>
        </div>
      </div>
    </footer>
  );
}
