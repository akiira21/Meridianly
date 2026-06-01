"use client";

import { ArrowRight } from "lucide-react";

interface HeroImageProps {
  src: string;
  alt: string;
  heading: string;
  description: string;
  variant?: "default" | "gradient" | "centered" | "badge" | "dark" | "compact";
  badge?: string;
  cta?: string;
  aspect?: "landscape" | "banner" | "square" | "mobile";
  onCtaClick?: () => void;
}

export default function HeroImage({
  src,
  alt,
  heading,
  description,
  variant = "default",
  badge,
  cta,
  aspect = "banner",
  onCtaClick,
}: HeroImageProps) {
  const aspectClass = {
    landscape: "aspect-[16/9]",
    banner: "aspect-[21/9]",
    square: "aspect-square",
    mobile: "aspect-[9/16] max-h-[500px]",
  }[aspect];

  const overlayClass = {
    default: "bg-foreground/20",
    gradient: "bg-foreground/0",
    centered: "bg-foreground/30",
    badge: "bg-foreground/20",
    dark: "bg-foreground/50",
    compact: "bg-foreground/40",
  }[variant];

  const textPosition = {
    default: "items-end justify-start pb-8 pl-8",
    gradient: "items-end justify-start pb-8 pl-8",
    centered: "items-center justify-center text-center",
    badge: "items-end justify-start pb-8 pl-8",
    dark: "items-end justify-start pb-8 pl-8",
    compact: "items-end justify-start pb-6 pl-6",
  }[variant];

  const textColor = {
    default: "text-background",
    gradient: "text-background",
    centered: "text-background",
    badge: "text-background",
    dark: "text-background",
    compact: "text-background",
  }[variant];

  const headingSize = {
    default: "text-3xl md:text-4xl",
    gradient: "text-3xl md:text-4xl",
    centered: "text-4xl md:text-5xl",
    badge: "text-2xl md:text-3xl",
    dark: "text-3xl md:text-4xl",
    compact: "text-xl md:text-2xl",
  }[variant];

  const descSize = {
    default: "text-base",
    gradient: "text-base",
    centered: "text-lg",
    badge: "text-sm",
    dark: "text-base",
    compact: "text-sm",
  }[variant];

  const maxWidth = {
    default: "max-w-lg",
    gradient: "max-w-lg",
    centered: "max-w-xl",
    badge: "max-w-md",
    dark: "max-w-lg",
    compact: "max-w-sm",
  }[variant];

  return (
    <div className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden group`}>
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* Gradient for gradient variant */}
      {variant === "gradient" && (
        <div className="absolute inset-0 bg-foreground/60 bg-[
          linear-gradient(to_top,rgba(28,25,23,0.8)_0%,rgba(28,25,23,0.4)_50%,transparent_100%)
        ]" />
      )}

      {/* Content */}
      <div className={`absolute inset-0 flex ${textPosition}`}>
        <div className={`${maxWidth} ${textColor}`}>
          {badge && (
            <span className="inline-block mb-3 px-3 py-1 bg-background/20 backdrop-blur-sm rounded-full font-body text-xs font-medium">
              {badge}
            </span>
          )}
          <h2 className={`font-heading ${headingSize} font-medium tracking-tight leading-tight`}>
            {heading}
          </h2>
          <p className={`mt-2 font-body ${descSize} leading-relaxed opacity-90`}>
            {description}
          </p>
          {cta && (
            <button
              onClick={onCtaClick}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-background text-foreground rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {cta}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
