"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { getDicebearUrl } from "@/lib/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import Logo from "@/components/logo";
import UserMenu from "@/components/user-menu";
import UserAvatar from "@/components/user-avatar";
import LogoutButton from "@/components/logout-button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/todos", label: "Todos" },
  { href: "/water", label: "Water" },
  { href: "/notes", label: "Notes" },
  { href: "/food", label: "Food" },
];

export default function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useMounted();

  const avatarUrl =
    user?.avatar_url || (user?.username ? getDicebearUrl(user.username) : null);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size="md" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          {mounted && isAuthenticated && (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}
          <div className="h-4 w-px bg-border" />
          <ModeToggle />
          {mounted && isAuthenticated ? (
            <UserMenu />
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
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X size={18} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {mounted && isAuthenticated && (
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <UserAvatar
                    src={avatarUrl}
                    name={user?.name || user?.username || "User"}
                    size="md"
                  />
                  <div>
                    <p className="font-body text-sm font-medium">
                      {user?.name || user?.username || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">{user?.email}</p>
                  </div>
                </div>
              )}
              <Link
                href="/"
                className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              {mounted && isAuthenticated && (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/profile"
                    className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-border">
                <ModeToggle />
              </div>
              {mounted && isAuthenticated ? (
                <LogoutButton
                  onLogout={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80"
                  showIcon={false}
                />
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
