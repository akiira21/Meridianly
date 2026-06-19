import { LucideIcon } from "lucide-react";

interface SnapshotItemProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

export default function SnapshotItem({
  icon: Icon,
  value,
  label,
}: SnapshotItemProps) {
  return (
    <div className="text-center p-3 bg-muted/50 rounded-xl">
      <Icon size={16} className="mx-auto mb-2 text-muted-foreground" />
      <div className="font-heading text-xl font-medium tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground font-body mt-0.5">{label}</div>
    </div>
  );
}
