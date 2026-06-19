"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/auth-store";
import { getDicebearUrl } from "@/lib/avatar";
import UserAvatar from "@/components/user-avatar";
import LogoutButton from "@/components/logout-button";

export default function UserMenu() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl =
    user?.avatar_url || (user?.username ? getDicebearUrl(user.username) : null);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 hover:bg-muted rounded-full pl-1 pr-3 py-1 transition-colors"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <UserAvatar src={avatarUrl} name={user?.name || user?.username || "User"} size="sm" />
        <span className="hidden sm:inline text-sm font-body font-medium">
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
            <LogoutButton
              onLogout={() => setDropdownOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-destructive hover:bg-destructive/10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
