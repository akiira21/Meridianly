import { LucideIcon } from "lucide-react";

interface BentoItem {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

interface BentoGridProps {
  items: BentoItem[];
  variant?: "3-1" | "1-3" | "2-2" | "1-1-1";
}

export default function BentoGrid({ items, variant = "2-2" }: BentoGridProps) {
  if (variant === "3-1") {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        {items.slice(0, 3).map((item, i) => (
          <BentoCard key={i} item={item} compact />
        ))}
        {items[3] && (
          <BentoCard item={items[3]} className="md:col-span-1" />
        )}
      </div>
    );
  }

  if (variant === "1-3") {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        {items[0] && (
          <BentoCard item={items[0]} className="md:col-span-1" />
        )}
        {items.slice(1, 4).map((item, i) => (
          <BentoCard key={i} item={item} compact />
        ))}
      </div>
    );
  }

  if (variant === "2-2") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.slice(0, 4).map((item, i) => (
          <BentoCard key={i} item={item} />
        ))}
      </div>
    );
  }

  // 1-1-1 single row
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.slice(0, 3).map((item, i) => (
        <BentoCard key={i} item={item} compact />
      ))}
    </div>
  );
}

function BentoCard({
  item,
  compact = false,
  className = "",
}: {
  item: BentoItem;
  compact?: boolean;
  className?: string;
}) {
  const Icon = item.icon;
  return (
    <div
      className={`group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-colors ${
        compact ? "p-5" : "p-6"
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon size={16} className="text-foreground" />
        </div>
        <div className="min-w-0">
          <h4 className="font-heading text-sm font-medium tracking-tight">
            {item.title}
          </h4>
          <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}
