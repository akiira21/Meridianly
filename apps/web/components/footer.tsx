"use client";

import Logo from "@/components/logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-md mt-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <Logo size="xs" href="/dashboard" />
        <p className="text-xs text-muted-foreground font-body">
          &copy; {year} Meridianly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
