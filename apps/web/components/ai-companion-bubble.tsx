"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Sun, CloudSun, Moon, ChevronRight } from "lucide-react";
import { api, AIInsightItem } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const TYPE_ICONS = {
  morning: Sun,
  noon: CloudSun,
  night: Moon,
};

const TYPE_LABELS = {
  morning: "Morning",
  noon: "Noon",
  night: "Night",
};

const TYPE_GRADIENTS = {
  morning: "from-amber-100 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10",
  noon: "from-sky-100 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/10",
  night: "from-indigo-100 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10",
};

const TYPE_ACCENT = {
  morning: "text-amber-600",
  noon: "text-sky-600",
  night: "text-indigo-600",
};

export default function AICompanionBubble() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [insights, setInsights] = useState<AIInsightItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const enabled = user?.ai_insights_enabled !== false;
  const unreadCount = insights.filter((i) => !i.is_read).length;

  function getCurrentPeriod(): "morning" | "noon" | "night" {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "noon";
    return "night";
  }

  async function loadInsights() {
    if (!isAuthenticated || !enabled) return;
    setLoading(true);
    try {
      const { data } = await api.getDailyInsights();
      setInsights(data.insights);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && enabled) {
      loadInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, enabled]);

  // Auto-refresh insights every 10 minutes so they're ready when notification time hits
  useEffect(() => {
    if (!isAuthenticated || !enabled) return;
    const interval = setInterval(() => {
      loadInsights();
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, enabled]);

  // Auto-expand the current time period's insight when panel opens
  useEffect(() => {
    if (open && insights.length > 0) {
      const current = getCurrentPeriod();
      const currentInsight = insights.find((i) => i.insight_type === current);
      if (currentInsight) {
        setExpandedId(currentInsight.id);
      }
    }
  }, [open, insights]);

  async function handleMarkRead(id: number) {
    try {
      await api.markInsightRead(id);
      setInsights((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_read: true } : i))
      );
    } catch {
      // ignore
    }
  }

  if (!isAuthenticated || !enabled) return null;

  return (
    <>
      {/* Floating Bubble */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-foreground text-background shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="AI Companion"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
        {unreadCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-foreground" />
                  <h3 className="font-heading text-base font-medium tracking-tight">
                    AI Companion
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {loading && (
                <div className="text-sm text-muted-foreground font-body text-center py-6">
                  <span className="animate-gentle-pulse">Generating insights...</span>
                </div>
              )}

              {error && (
                <div className="text-sm text-destructive font-body text-center py-2">
                  {error}
                </div>
              )}

              {!loading && !error && insights.length === 0 && (
                <div className="text-sm text-muted-foreground font-body text-center py-6">
                  No insights yet. Check back later!
                </div>
              )}

              <div className="space-y-3">
                {insights.map((insight) => {
                  const Icon = TYPE_ICONS[insight.insight_type as keyof typeof TYPE_ICONS] || Sun;
                  const isExpanded = expandedId === insight.id;
                  const isCurrentPeriod = insight.insight_type === getCurrentPeriod();
                  return (
                    <motion.div
                      key={insight.id}
                      layout
                      className={`relative p-4 rounded-2xl bg-gradient-to-br ${TYPE_GRADIENTS[insight.insight_type as keyof typeof TYPE_GRADIENTS]} border ${isCurrentPeriod ? "border-foreground/30" : "border-border/50"}`}
                    >
                      {!insight.is_read && (
                        <span className="absolute top-3 right-3 w-2 h-2 bg-destructive rounded-full" />
                      )}
                      {isCurrentPeriod && (
                        <span className="absolute top-3 right-6 px-1.5 py-0.5 bg-foreground text-background text-[9px] font-body font-bold uppercase rounded-full">
                          Now
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setExpandedId(isExpanded ? null : insight.id);
                          if (!insight.is_read) handleMarkRead(insight.id);
                        }}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={16} className={TYPE_ACCENT[insight.insight_type as keyof typeof TYPE_ACCENT]} />
                          <span className={`text-xs font-body font-semibold uppercase tracking-wide ${TYPE_ACCENT[insight.insight_type as keyof typeof TYPE_ACCENT]}`}>
                            {TYPE_LABELS[insight.insight_type as keyof typeof TYPE_LABELS]}
                          </span>
                        </div>
                        <h4 className="font-heading text-sm font-medium mb-1 pr-4">
                          {insight.title}
                        </h4>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-xs text-muted-foreground font-body leading-relaxed mb-2">
                                {insight.message}
                              </p>
                              {insight.tips.length > 0 && (
                                <ul className="space-y-1">
                                  {insight.tips.map((tip, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-1.5 text-xs text-foreground font-body"
                                    >
                                      <ChevronRight size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {!isExpanded && (
                          <p className="text-xs text-muted-foreground font-body line-clamp-2">
                            {insight.message}
                          </p>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
