"use client";

import { useEffect } from "react";
import { useNotifications, updateSettings } from "@/lib/notifications";

export default function NotificationProvider() {
  const { getSettings } = useNotifications();

  useEffect(() => {
    // Initialize notification settings on mount
    getSettings();
  }, [getSettings]);

  return null;
}
