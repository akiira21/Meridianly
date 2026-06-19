"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-20 h-20",
};

const iconSizes = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 32,
};

export default function UserAvatar({
  src,
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-muted overflow-hidden border border-border flex items-center justify-center shrink-0",
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || "avatar"} className="w-full h-full object-cover" />
      ) : (
        <User size={iconSizes[size]} className="text-muted-foreground" />
      )}
    </div>
  );
}
