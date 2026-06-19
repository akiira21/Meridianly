import PricingCard, { PricingFeature } from "@/components/pricing-card";
import { useLocalePricing } from "@/lib/use-locale-pricing";

const freeFeatures: PricingFeature[] = [
  { label: "Todos", value: "Unlimited", included: true },
  { label: "Water logging", value: "Unlimited", included: true },
  { label: "Habit tracking", value: "Unlimited", included: true },
  { label: "Workout logging", value: "Unlimited", included: true },
  { label: "Food logging (manual)", value: "Unlimited", included: true },
  { label: "AI requests", value: "5 / day", included: true },
  { label: "Food scans", value: "1 / day", included: true },
  { label: "Notes", value: "Unlimited, 10 MB storage", included: true },
  { label: "File / image uploads", value: "Limited", included: true },
  { label: "Priority queue", value: "—", included: false },
];

const proFeatures: PricingFeature[] = [
  { label: "Todos", value: "Unlimited", included: true },
  { label: "Water logging", value: "Unlimited", included: true },
  { label: "Habit tracking", value: "Unlimited", included: true },
  { label: "Workout logging", value: "Unlimited", included: true },
  { label: "Food logging (manual)", value: "Unlimited", included: true },
  { label: "AI requests", value: "100 / day", included: true },
  { label: "Food scans", value: "12 / day", included: true },
  { label: "Notes", value: "Unlimited, 1 GB+ storage", included: true },
  { label: "File / image uploads", value: "1 GB", included: true },
  { label: "Priority queue", value: "Included", included: true },
];

const maxFeatures: PricingFeature[] = [
  { label: "Todos", value: "Unlimited", included: true },
  { label: "Water logging", value: "Unlimited", included: true },
  { label: "Habit tracking", value: "Unlimited", included: true },
  { label: "Workout logging", value: "Unlimited", included: true },
  { label: "Food logging (manual)", value: "Unlimited", included: true },
  { label: "AI requests", value: "300 / day", included: true },
  { label: "Food scans", value: "25 / day", included: true },
  { label: "Notes", value: "Unlimited, 5 GB storage", included: true },
  { label: "File / image uploads", value: "5 GB", included: true },
  { label: "Priority queue", value: "Included", included: true },
];

export default function PricingSection() {
  const { symbol, prices } = useLocalePricing();

  return (
    <section className="px-6 py-28 md:py-36 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-muted-foreground font-body text-lg leading-relaxed">
            Start free and upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PricingCard
            name="Free"
            price={`${symbol}0`}
            description="Everything you need to get organized."
            features={freeFeatures}
            ctaLabel="Get started"
            ctaHref="/signup"
          />
          <PricingCard
            name="Pro"
            price={`${symbol}${prices.pro}`}
            description="More AI, more scans, more storage."
            features={proFeatures}
            highlighted
            badge="Popular"
            ctaLabel="Coming soon"
            ctaDisabled
          />
          <PricingCard
            name="Max"
            price={`${symbol}${prices.max}`}
            description="Higher limits for power users."
            features={maxFeatures}
            ctaLabel="Coming soon"
            ctaDisabled
          />
        </div>
      </div>
    </section>
  );
}
