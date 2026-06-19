"use client";

import { useSyncExternalStore } from "react";

interface LocalePricing {
  currency: "USD" | "INR";
  symbol: string;
  prices: {
    pro: number;
    max: number;
  };
}

function isIndianLocale(): boolean {
  if (typeof window === "undefined") return false;

  const locale = navigator.language || "";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    locale.toLowerCase().includes("-in") ||
    locale.toLowerCase() === "hi" ||
    timezone === "Asia/Kolkata"
  );
}

function getPricing(isIndia: boolean): LocalePricing {
  if (isIndia) {
    return {
      currency: "INR",
      symbol: "₹",
      prices: { pro: 199, max: 399 },
    };
  }

  return {
    currency: "USD",
    symbol: "$",
    prices: { pro: 5, max: 12 },
  };
}

export function useLocalePricing(): LocalePricing {
  const isIndia = useSyncExternalStore(
    () => () => {},
    () => isIndianLocale(),
    () => false
  );

  return getPricing(isIndia);
}
