"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import Logo from "@/components/logo";
import { motion, AnimatePresence } from "framer-motion";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

export default function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mounted = useMounted();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl = user?.avatar_url || (user?.username ? getDicebearUrl(user.username) : null);

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
              <Link
                href="/todos"
                className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Todos
              </Link>
              <Link
                href="/water"
                className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Water
              </Link>
              <Link
                href="/notes"
                className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Notes
              </Link>
              <Link
                href="/food"
                className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Food
              </Link>
            </>
          )}
          <div className="h-4 w-px bg-border" />
          <ModeToggle />
          {mounted && isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:bg-muted rounded-full pl-1 pr-3 py-1 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-muted overflow-hidden border border-border">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={14} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-body font-medium">
                  {user?.name || user?.username || "User"}
                </span>
                <motion.div
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg overflow-hidden py-1"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-foreground hover:bg-muted transition-colors"
                    >
                      <User size={15} />
                      Profile
                    </Link>
                    <div className="mx-3 my-1 h-px bg-border" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={18} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
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
                  <Link
                    href="/todos"
                    className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Todos
                  </Link>
                  <Link
                    href="/water"
                    className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Water
                  </Link>
                  <Link
                    href="/notes"
                    className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Notes
                  </Link>
                  <Link
                    href="/food"
                    className="block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Food
                  </Link>
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
