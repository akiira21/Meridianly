import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingFeature {
  label: string;
  value: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  highlighted?: boolean;
  badge?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  ctaHref?: string;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
  badge,
  ctaLabel,
  ctaDisabled = false,
  ctaHref,
}: PricingCardProps) {
  const buttonContent = (
    <button
      disabled={ctaDisabled}
      className={cn(
        "w-full px-5 py-2.5 rounded-full font-body text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed",
        highlighted
          ? "bg-background text-foreground"
          : "bg-foreground text-background"
      )}
    >
      {ctaLabel}
    </button>
  );

  return (
    <div
      className={cn(
        "relative flex flex-col p-6 sm:p-7 rounded-3xl border transition-colors",
        highlighted
          ? "bg-foreground text-background border-foreground"
          : "bg-card border-border hover:border-foreground/20"
      )}
    >
      {badge && (
        <span
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-body font-medium uppercase tracking-wider",
            highlighted ? "bg-background text-foreground" : "bg-foreground text-background"
          )}
        >
          <Sparkles size={10} />
          {badge}
        </span>
      )}

      <div className="mb-6">
        <h3
          className={cn(
            "font-heading text-lg font-medium tracking-tight",
            highlighted ? "text-background" : "text-foreground"
          )}
        >
          {name}
        </h3>
        <p
          className={cn(
            "mt-1 text-sm font-body",
            highlighted ? "text-background/70" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      </div>

      <div className="mb-6">
        <span
          className={cn(
            "font-heading text-4xl font-semibold tracking-tight",
            highlighted ? "text-background" : "text-foreground"
          )}
        >
          {price}
        </span>
        <span
          className={cn(
            "text-sm font-body",
            highlighted ? "text-background/70" : "text-muted-foreground"
          )}
        >
          /month
        </span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-3">
            {feature.included ? (
              <Check
                size={16}
                className={cn(
                  "shrink-0 mt-0.5",
                  highlighted ? "text-background" : "text-green-600"
                )}
              />
            ) : (
              <X size={16} className="shrink-0 mt-0.5 text-muted-foreground/60" />
            )}
            <span
              className={cn(
                "text-sm font-body",
                highlighted
                  ? "text-background/90"
                  : feature.included
                  ? "text-foreground"
                  : "text-muted-foreground/70"
              )}
            >
              {feature.label}: <span className="font-medium">{feature.value}</span>
            </span>
          </li>
        ))}
      </ul>

      {ctaHref && !ctaDisabled ? (
        <Link href={ctaHref} className="block">
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}
    </div>
  );
}
