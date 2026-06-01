"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = React.useCallback(() => {
    if (!buttonRef.current || !mounted) {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }

    const next = resolvedTheme === "dark" ? "light" : "dark";
    const rect = buttonRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const maxRadius = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y)
    );

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.left = `${x}px`;
    overlay.style.top = `${y}px`;
    overlay.style.width = "1px";
    overlay.style.height = "1px";
    overlay.style.borderRadius = "50%";
    overlay.style.backgroundColor = next === "dark" ? "#0a0a0a" : "#fafaf8";
    overlay.style.transform = "translate(-50%, -50%) scale(0)";
    overlay.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
    overlay.style.zIndex = "9999";
    overlay.style.pointerEvents = "none";

    document.body.appendChild(overlay);
    overlay.getBoundingClientRect();

    overlay.style.transform = `translate(-50%, -50%) scale(${maxRadius * 2.5})`;

    // Switch theme right when overlay covers everything (~250-300ms into animation)
    setTimeout(() => {
      setTheme(next);

      // Fade overlay out instantly - colors are already correct underneath
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.2s ease";

      setTimeout(() => {
        overlay.remove();
      }, 200);
    }, 300);
  }, [resolvedTheme, setTheme, mounted]);

  if (!mounted) {
    return (
      <button
        ref={buttonRef}
        className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-muted hover:bg-foreground hover:text-background transition-colors"
        aria-label="Toggle theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[18px] h-[18px]"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 3l0 18" />
          <path d="M12 9l4.65 -4.65" />
          <path d="M12 14.3l7.37 -7.37" />
          <path d="M12 19.6l8.85 -8.85" />
        </svg>
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-muted hover:bg-foreground hover:text-background transition-colors"
      aria-label="Toggle theme"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[18px] h-[18px]"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 3l0 18" />
        <path d="M12 9l4.65 -4.65" />
        <path d="M12 14.3l7.37 -7.37" />
        <path d="M12 19.6l8.85 -8.85" />
      </svg>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
