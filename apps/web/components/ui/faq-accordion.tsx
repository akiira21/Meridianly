"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="">
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-body text-sm font-medium text-foreground pr-4">
                {item.question}
              </span>
              <span
                className={`shrink-0 w-5 h-5 inline-flex items-center justify-center rounded-full border border-border transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                <Plus size={12} className="text-muted-foreground" />
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="px-6 pb-4">
                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
