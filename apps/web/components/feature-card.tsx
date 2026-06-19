import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="p-7 bg-card border border-border rounded-2xl hover:border-foreground/20 transition-colors">
      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mb-5">
        <Icon size={18} className="text-foreground" />
      </div>
      <h4 className="font-heading text-lg font-medium tracking-tight">
        {title}
      </h4>
      <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed">
        {description}
      </p>
    </div>
  );
}
