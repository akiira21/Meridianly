"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { api, Todo, TodoStats } from "@/lib/api";
import {
  Check,
  Clock,
  Archive,
  Moon,
  Trash2,
  Pause,
  Play,
  Sparkles,
  Send,
  Zap,
  Coffee,
  Flame,
  X,
  ListTodo,
  Inbox,
  Sun,
  Timer,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import NumberStepper from "@/components/ui/number-stepper";
import { motion, AnimatePresence } from "framer-motion";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function TodosPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rehydrated = useAuthStore((state) => state.rehydrated);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("active");
  const [energyFilter, setEnergyFilter] = useState<string | null>(null);
  const [contextFilter, setContextFilter] = useState<string | null>(null);

  // Inline compose area
  const [composeText, setComposeText] = useState("");
  const [composeExpanded, setComposeExpanded] = useState(false);
  const [composeEnergy, setComposeEnergy] = useState<"low" | "medium" | "high">("medium");
  const [composeContext, setComposeContext] = useState<"desk" | "phone" | "errands" | "quick" | "any">("any");
  const [composeMinutes, setComposeMinutes] = useState<number | null>(null);
  const [composeSending, setComposeSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI Modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [planInfo, setPlanInfo] = useState<{ plan: string; ai_requests_used: number; ai_requests_limit: number; ai_requests_remaining: number; ai_requests_reset_at: string | null } | null>(null);

  // Done for day
  const [showDoneForDay, setShowDoneForDay] = useState(false);
  const [doneForDayResult, setDoneForDayResult] = useState<string | null>(null);

  // Focus timer
  const [focusTodo, setFocusTodo] = useState<Todo | null>(null);
  const [focusDuration, setFocusDuration] = useState(25);
  const [focusRemaining, setFocusRemaining] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!rehydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadTodos();
    loadStats();
    loadPlanInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, rehydrated, router, activeFilter, energyFilter, contextFilter]);

  async function loadPlanInfo() {
    try {
      const { data } = await api.getPlanInfo();
      setPlanInfo(data);
    } catch {
      // silently fail
    }
  }

  async function loadTodos() {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (activeFilter && activeFilter !== "all") {
        params.status = activeFilter;
      }
      if (energyFilter) {
        params.energy_level = energyFilter;
      }
      if (contextFilter) {
        params.context = contextFilter;
      }
      const { data } = await api.getTodos(params);
      setTodos(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const { data } = await api.getStats();
      setStats(data);
    } catch {
      // silently fail
    }
  }

  async function handleSubmitTodo() {
    if (!composeText.trim()) return;
    setComposeSending(true);
    try {
      await api.createTodo({
        title: composeText.trim(),
        energy_level: composeEnergy,
        context: composeContext,
        estimated_minutes: composeMinutes,
      });
      setComposeText("");
      setComposeExpanded(false);
      setComposeMinutes(null);
      loadTodos();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create todo");
    } finally {
      setComposeSending(false);
    }
  }

  async function handleToggleStatus(todo: Todo) {
    const newStatus = todo.status === "completed" ? "active" : "completed";
    try {
      await api.updateTodo(todo.id, { status: newStatus });
      loadTodos();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    }
  }

  async function handleDelete(todoId: number) {
    try {
      await api.deleteTodo(todoId);
      loadTodos();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    }
  }

  async function handleSnooze(todoId: number) {
    try {
      await api.snoozeTodo(todoId, "tomorrow");
      loadTodos();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to snooze todo");
    }
  }

  async function handleDoneForDay() {
    try {
      const { data } = await api.doneForDay(true);
      setDoneForDayResult(data.message);
      setShowDoneForDay(false);
      loadTodos();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark day done");
    }
  }

  // Focus timer
  function openFocus(todo: Todo) {
    setFocusTodo(todo);
    setFocusDuration(25);
    setFocusRemaining(25 * 60);
    setFocusRunning(false);
  }

  function closeFocus() {
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }
    setFocusTodo(null);
    setFocusRunning(false);
  }

  function toggleFocusTimer() {
    setFocusRunning((prev) => !prev);
  }

  async function finishFocus() {
    if (!focusTodo) return;
    const actualMinutes = Math.max(1, Math.round((focusDuration * 60 - focusRemaining) / 60));
    try {
      await api.startFocus(focusTodo.id);
      await api.endFocus(focusTodo.id, actualMinutes);
      closeFocus();
      loadTodos();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save focus time");
    }
  }

  useEffect(() => {
    if (focusRunning) {
      focusIntervalRef.current = setInterval(() => {
        setFocusRemaining((prev) => {
          if (prev <= 1) {
            finishFocus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }
    return () => {
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRunning]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  async function handleAI() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      await api.generateTodos(aiPrompt);
      setAiPrompt("");
      setShowAIModal(false);
      loadTodos();
      loadStats();
      loadPlanInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI failed to generate todos");
    } finally {
      setAiLoading(false);
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [composeText]);

  const energyConfig = {
    low: { label: "Low", color: "text-amber-600", bg: "bg-amber-500/10", icon: Coffee },
    medium: { label: "Medium", color: "text-blue-600", bg: "bg-blue-500/10", icon: Zap },
    high: { label: "High", color: "text-rose-600", bg: "bg-rose-500/10", icon: Flame },
  };

  const contextConfig = {
    desk: { label: "Desk", short: "D" },
    phone: { label: "Phone", short: "P" },
    errands: { label: "Errands", short: "E" },
    quick: { label: "Quick", short: "Q" },
    any: { label: "Any", short: "A" },
  };

  const filterTabs = [
    { key: "all", label: "All", icon: Inbox },
    { key: "active", label: "Active", icon: Play },
    { key: "completed", label: "Done", icon: Check },
    { key: "snoozed", label: "Snoozed", icon: Pause },
    { key: "parking_lot", label: "Parking", icon: Archive },
  ];

  if (!rehydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-gentle-pulse text-sm text-muted-foreground font-body">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Todos" icon={<ListTodo size={18} />}>
        <button
          onClick={() => setShowAIModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full font-body text-xs font-medium hover:bg-muted/80 transition-colors"
        >
          <Sparkles size={13} />
          AI
          {planInfo && planInfo.ai_requests_remaining <= 5 && (
            <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
          )}
        </button>
        <button
          onClick={() => setShowDoneForDay(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full font-body text-xs font-medium hover:bg-muted/80 transition-colors"
        >
          <Moon size={13} />
          <span className="hidden sm:inline">Done for day</span>
        </button>
      </PageHeader>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Stats Row */}
        <AnimatePresence>
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 flex-wrap"
            >
              {[
                { icon: Check, label: "done", value: stats.completed_today, color: "text-green-600" },
                { icon: Play, label: "active", value: stats.active, color: "text-blue-600" },
                { icon: Pause, label: "snoozed", value: stats.snoozed, color: "text-amber-600" },
                { icon: Archive, label: "parking", value: stats.parking_lot, color: "text-purple-600" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-full"
                >
                  <stat.icon size={12} className={stat.color} />
                  <span className="font-body text-xs font-medium">{stat.value}</span>
                  <span className="text-xs text-muted-foreground font-body">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compose Area - Big inline text area */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-4 sm:p-5 focus-within:border-foreground/20 transition-colors"
        >
          <textarea
            ref={textareaRef}
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            onFocus={() => setComposeExpanded(true)}
            placeholder="What do you need to do?"
            rows={composeExpanded ? 2 : 1}
            className="w-full bg-transparent font-body text-base text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitTodo();
              }
            }}
          />
          <AnimatePresence>
            {(composeExpanded || composeText) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between mt-3 pt-3 border-t border-border overflow-hidden"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Energy selector */}
                  <div className="flex items-center gap-1">
                    {(["low", "medium", "high"] as const).map((e) => {
                      const cfg = energyConfig[e];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={e}
                          onClick={() => setComposeEnergy(e)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-body text-[11px] font-medium transition-colors ${
                            composeEnergy === e
                              ? `${cfg.bg} ${cfg.color}`
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon size={12} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Context selector */}
                  <div className="flex items-center gap-1">
                    {(["desk", "phone", "errands", "quick", "any"] as const).map((c) => {
                      const cfg = contextConfig[c];
                      return (
                        <button
                          key={c}
                          onClick={() => setComposeContext(c)}
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-body text-[10px] font-medium transition-colors ${
                            composeContext === c
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                          title={cfg.label}
                        >
                          {cfg.short}
                        </button>
                      );
                    })}
                  </div>
                  {/* Minutes */}
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <NumberStepper
                      value={composeMinutes}
                      onChange={setComposeMinutes}
                      min={0}
                      step={5}
                      placeholder="min"
                      unit="m"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmitTodo}
                  disabled={composeSending || !composeText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-full font-body text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {composeSending ? (
                    <span className="animate-gentle-pulse">Adding...</span>
                  ) : (
                    <>
                      <Send size={12} />
                      Add
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Done for Day Result */}
        <AnimatePresence>
          {doneForDayResult && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="p-4 bg-muted/50 border border-border rounded-2xl text-center"
            >
              <Sun size={20} className="mx-auto mb-1 text-amber-500" />
              <p className="font-body text-sm text-foreground">{doneForDayResult}</p>
              <button
                onClick={() => setDoneForDayResult(null)}
                className="mt-1 text-xs text-muted-foreground hover:text-foreground font-body"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-destructive font-body text-center py-2"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-body text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? "text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-foreground rounded-xl"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={13} />
                  {tab.label}
                </span>
              </button>
            );
          })}
          <div className="h-5 w-px bg-border mx-1" />
          {["low", "medium", "high"].map((e) => (
            <button
              key={e}
              onClick={() => setEnergyFilter(energyFilter === e ? null : e)}
              className={`px-3 py-2 rounded-xl font-body text-xs font-medium transition-colors shrink-0 ${
                energyFilter === e
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
          {(energyFilter || contextFilter) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => { setEnergyFilter(null); setContextFilter(null); }}
              className="px-2 py-2 text-xs text-muted-foreground hover:text-foreground font-body"
            >
              <X size={14} />
            </motion.button>
          )}
        </div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground font-body text-center py-8"
            >
              <span className="animate-gentle-pulse">Loading todos...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {!loading && todos.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center py-16"
            >
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ListTodo size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-body mb-1">
                No todos here.
              </p>
              <p className="text-xs text-muted-foreground font-body">
                Write something above or use the AI assistant.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Todo List */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          <AnimatePresence>
            {todos.map((todo) => {
              const eCfg = energyConfig[todo.energy_level];
              const cCfg = contextConfig[todo.context];
              const EIcon = eCfg.icon;
              return (
                <motion.div
                  key={todo.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={`group flex items-start gap-3 p-4 bg-card border border-border rounded-2xl hover:border-foreground/20 transition-colors ${
                    todo.status === "completed" ? "opacity-50" : ""
                  }`}
                >
                  <button
                    onClick={() => handleToggleStatus(todo)}
                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      todo.status === "completed"
                        ? "bg-foreground border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {todo.status === "completed" && <Check size={12} className="text-background" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-body text-sm ${todo.status === "completed" ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                        {todo.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-body text-[10px] font-medium ${eCfg.bg} ${eCfg.color}`}>
                        <EIcon size={10} />
                        {eCfg.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-body">
                        {cCfg.label}
                      </span>
                      {todo.estimated_minutes && (
                        <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
                          <Clock size={10} />
                          {todo.estimated_minutes}m
                          {todo.actual_minutes && ` / ${todo.actual_minutes}m`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {todo.status !== "completed" && (
                      <>
                        <button
                          onClick={() => openFocus(todo)}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors"
                          title="Focus"
                        >
                          <Timer size={13} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleSnooze(todo.id)}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors"
                          title="Snooze"
                        >
                          <Pause size={13} className="text-muted-foreground" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} className="text-destructive" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* AI Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAIModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-foreground" />
                  <h2 className="font-heading text-base font-medium tracking-tight">AI Assistant</h2>
                </div>
                <button onClick={() => setShowAIModal(false)} className="p-1.5 rounded-full hover:bg-muted">
                  <X size={16} />
                </button>
              </div>
              {planInfo && (
                <div className="flex items-center justify-between mb-4 px-3 py-2 bg-muted rounded-xl">
                  <span className="font-body text-xs text-muted-foreground">
                    Plan: <span className="font-medium text-foreground capitalize">{planInfo.plan}</span>
                  </span>
                  <span className="font-body text-xs text-muted-foreground">
                    {planInfo.ai_requests_remaining} / {planInfo.ai_requests_limit} remaining
                  </span>
                </div>
              )}
              <p className="text-sm text-muted-foreground font-body mb-4">
                Describe your tasks and the AI will create them with the right energy level and context.
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="I need to finish my homework, prepare for the meeting, and buy groceries..."
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
                autoFocus
              />
              <button
                onClick={handleAI}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {aiLoading ? (
                  <span className="animate-gentle-pulse">Generating...</span>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Todos
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done for Day Modal */}
      <AnimatePresence>
        {showDoneForDay && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDoneForDay(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-lg text-center"
            >
              <Moon size={28} className="mx-auto mb-3 text-foreground" />
              <h2 className="font-heading text-lg font-medium tracking-tight mb-1">Done for the day?</h2>
              <p className="text-sm text-muted-foreground font-body mb-6">
                Mark your day as complete. Unfinished tasks will be snoozed to tomorrow.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDoneForDay(false)}
                  className="flex-1 px-4 py-2.5 bg-background text-foreground border border-border rounded-full font-body text-sm font-medium hover:bg-muted transition-colors"
                >
                  Not yet
                </button>
                <button
                  onClick={handleDoneForDay}
                  className="flex-1 px-4 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Yes, I&apos;m done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Timer Modal */}
      <AnimatePresence>
        {focusTodo && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeFocus}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-lg text-center"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Timer size={18} className="text-foreground" />
                  <h2 className="font-heading text-base font-medium tracking-tight">Focus</h2>
                </div>
                <button
                  onClick={closeFocus}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground font-body mb-6 truncate px-2">
                {focusTodo.title}
              </p>
              <div className="text-6xl font-heading font-medium tracking-tight tabular-nums mb-8">
                {formatTime(focusRemaining)}
              </div>
              {!focusRunning && focusRemaining === focusDuration * 60 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[15, 25, 45].map((min) => (
                    <button
                      key={min}
                      onClick={() => {
                        setFocusDuration(min);
                        setFocusRemaining(min * 60);
                      }}
                      className={`px-3 py-1.5 rounded-full font-body text-xs font-medium transition-colors ${
                        focusDuration === min
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFocusTimer}
                  className="flex-1 px-4 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  {focusRunning ? "Pause" : focusRemaining === focusDuration * 60 ? "Start" : "Resume"}
                </button>
                <button
                  onClick={finishFocus}
                  className="flex-1 px-4 py-2.5 bg-background text-foreground border border-border rounded-full font-body text-sm font-medium hover:bg-muted transition-colors"
                >
                  Finish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
