"use client";

import { useEffect, useRef, useCallback } from "react";
import { api } from "./api";

export interface NotificationSettings {
  enabled: boolean;
  waterReminders: boolean;
  mealReminders: boolean;
  aiInsightReminders: boolean;
  lastWaterIntakeTime: string | null;
  lastWaterReminderTime: string | null;
  lastMealReminderDate: string | null;
  lastAiInsightNotifiedAt: string | null;
}

const STORAGE_KEY = "meridianly-notifications";

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  waterReminders: true,
  mealReminders: true,
  aiInsightReminders: true,
  lastWaterIntakeTime: null,
  lastWaterReminderTime: null,
  lastMealReminderDate: null,
  lastAiInsightNotifiedAt: null,
};

function loadSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: NotificationSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("denied" as NotificationPermission);
  }
  if (Notification.permission === "granted") {
    return Promise.resolve("granted");
  }
  return Notification.requestPermission();
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        icon: "/logo.svg",
        badge: "/logo.svg",
        ...options,
      });
    } catch {
      // ignore
    }
  }
}

export function useNotifications() {
  const settingsRef = useRef<NotificationSettings>(loadSettings());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateSettings = useCallback((partial: Partial<NotificationSettings>) => {
    settingsRef.current = { ...settingsRef.current, ...partial };
    saveSettings(settingsRef.current);
  }, []);

  const getSettings = useCallback(() => {
    return { ...settingsRef.current };
  }, []);

  const checkWaterReminders = useCallback(async () => {
    const settings = settingsRef.current;
    if (!settings.enabled || !settings.waterReminders) return;

    const now = new Date();
    const lastReminder = settings.lastWaterReminderTime
      ? new Date(settings.lastWaterReminderTime)
      : null;

    // Don't remind more than once every 30 minutes
    if (lastReminder && now.getTime() - lastReminder.getTime() < 30 * 60 * 1000) {
      return;
    }

    try {
      const { data } = await api.getWaterToday();
      const lastIntake = data.intakes.length > 0
        ? new Date(data.intakes[data.intakes.length - 1].logged_at)
        : null;

      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // If no water in the last 2 hours
      if (!lastIntake || lastIntake < twoHoursAgo) {
        sendNotification("Stay Hydrated! 💧", {
          body: "It's been a while since your last drink. Take a sip of water!",
          tag: "water-reminder",
          requireInteraction: false,
        });
        updateSettings({ lastWaterReminderTime: now.toISOString() });
      }
    } catch {
      // silently fail
    }
  }, [updateSettings]);

  const checkMealReminders = useCallback(() => {
    const settings = settingsRef.current;
    if (!settings.enabled || !settings.mealReminders) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (settings.lastMealReminderDate === todayStr) return;

    const hour = now.getHours();
    const minute = now.getMinutes();

    let meal: string | null = null;
    let body = "";

    // Breakfast: 8:00-9:00
    if (hour === 8) {
      meal = "Good Morning! 🍳";
      body = "Don't forget to log your breakfast.";
    }
    // Lunch: 12:30-13:30
    else if (hour === 12 && minute >= 30) {
      meal = "Lunch Time! 🍽️";
      body = "Remember to log your lunch.";
    }
    // Dinner: 19:00-20:00
    else if (hour === 19) {
      meal = "Dinner Time! 🍲";
      body = "Don't forget to log your dinner.";
    }

    if (meal) {
      sendNotification(meal, {
        body,
        tag: "meal-reminder",
        requireInteraction: false,
      });
      updateSettings({ lastMealReminderDate: todayStr });
    }
  }, [updateSettings]);

  const checkAiInsightReminders = useCallback(async () => {
    const settings = settingsRef.current;
    if (!settings.enabled || !settings.aiInsightReminders) return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Trigger windows: 8:00-8:05, 12:30-12:35, 20:00-20:05
    let targetType: string | null = null;
    let titlePrefix = "";

    if (hour === 8 && minute <= 5) {
      targetType = "morning";
      titlePrefix = "Good Morning ☀️";
    } else if (hour === 12 && minute >= 30 && minute <= 35) {
      targetType = "noon";
      titlePrefix = "Mid-Day Check 🌤️";
    } else if (hour === 20 && minute <= 5) {
      targetType = "night";
      titlePrefix = "Wind Down 🌙";
    }

    if (!targetType) return;

    // Avoid duplicate notifications within the same window
    const lastNotified = settings.lastAiInsightNotifiedAt
      ? new Date(settings.lastAiInsightNotifiedAt)
      : null;
    if (lastNotified && now.getTime() - lastNotified.getTime() < 10 * 60 * 1000) {
      return;
    }

    try {
      const { data } = await api.getDailyInsights();
      const insight = data.insights.find((i) => i.insight_type === targetType);
      if (insight) {
        sendNotification(`${titlePrefix} — ${insight.title}`, {
          body: insight.message,
          tag: `ai-insight-${targetType}`,
          requireInteraction: false,
        });
        updateSettings({ lastAiInsightNotifiedAt: now.toISOString() });
      }
    } catch {
      // silently fail
    }
  }, [updateSettings]);

  useEffect(() => {
    // Check every minute
    intervalRef.current = setInterval(() => {
      const settings = settingsRef.current;
      if (!settings.enabled) return;

      checkWaterReminders();
      checkMealReminders();
      checkAiInsightReminders();
    }, 60 * 1000);

    // Also check immediately if enabled
    if (settingsRef.current.enabled) {
      checkWaterReminders();
      checkMealReminders();
      checkAiInsightReminders();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkWaterReminders, checkMealReminders, checkAiInsightReminders]);

  return {
    getSettings,
    updateSettings,
    requestNotificationPermission,
    sendNotification,
  };
}
