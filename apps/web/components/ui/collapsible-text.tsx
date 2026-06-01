"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export default function CollapsibleText({
  text,
  maxLength = 120,
  className = "",
}: CollapsibleTextProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const displayText =
    shouldTruncate && !expanded ? text.slice(0, maxLength).trimEnd() + "..." : text;

  return (
    <div className={className}>
      <p className="font-body text-sm leading-relaxed text-muted-foreground">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 inline-flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{expanded ? "Show less" : "Show more"}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
}
