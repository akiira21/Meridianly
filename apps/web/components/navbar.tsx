"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { Droplets, Menu, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { ModeToggle } from "@/components/mode-toggle";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useMounted();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Droplets size={16} className="text-background" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Meridian
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/design"
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Design
          </Link>
          <div className="h-4 w-px bg-border" />
          <ModeToggle />
          {mounted && isAuthenticated ? (
            <button
              onClick={logout}
              className="px-4 py-2 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Log out
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-body font-medium text-foreground hover:underline"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-foreground hover:text-background transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border px-6 py-4 space-y-3 bg-background">
          <Link
            href="/"
            className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/design"
            className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Design
          </Link>
          <div className="pt-2 border-t border-border">
            <ModeToggle />
          </div>
          {mounted && isAuthenticated ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="w-full px-4 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Log out
            </button>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className="block text-center text-sm font-body font-medium text-foreground hover:underline"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="block text-center px-4 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
