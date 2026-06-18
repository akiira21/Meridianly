"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Logo from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import React from "react";

interface PageHeaderProps {
  title: string;
  icon?: React.ReactNode;
  showBack?: boolean;
  children?: React.ReactNode;
}

export default function PageHeader({ title, icon, showBack = true, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <ChevronLeft size={16} />
            </Link>
          )}
          <Logo size="sm" href="/dashboard" />
        </div>
        <div className="flex items-center gap-3">
          {icon && <span className="text-foreground">{icon}</span>}
          <span className="font-heading text-base font-semibold tracking-tight">
            {title}
          </span>
          {children}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
