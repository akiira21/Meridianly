"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { api, TodoStats, WaterDailySummary } from "@/lib/api";
import {
  Check,
  Droplets,
  ListTodo,
  Sparkles,
  Zap,
  FileText,
  Utensils,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import UserMenu from "@/components/user-menu";
import AppleBento from "@/components/ui/apple-bento";
import WaterBentoCard from "@/components/ui/water-bento-card";
import SnapshotItem from "@/components/dashboard/snapshot-item";

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const rehydrated = useAuthStore((state) => state.rehydrated);

  const [stats, setStats] = useState<TodoStats | null>(null);
  const [water, setWater] = useState<WaterDailySummary | null>(null);
  const [notesCount, setNotesCount] = useState(0);
  const [foodSummary, setFoodSummary] = useState<{ total_calories: number; entry_count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rehydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [statsRes, waterRes, notesRes, foodRes] = await Promise.allSettled([
          api.getStats(),
          api.getWaterToday(),
          api.getNotes(),
          api.getFoodToday(),
        ]);

        if (cancelled) return;

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        if (waterRes.status === "fulfilled") setWater(waterRes.value.data.summary);
        if (notesRes.status === "fulfilled") setNotesCount(notesRes.value.data.total);
        if (foodRes.status === "fulfilled") setFoodSummary(foodRes.value.data.summary);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, rehydrated, router]);

  if (!rehydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-gentle-pulse text-sm text-muted-foreground font-body">
          Loading...
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.username || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Dashboard" icon={<Sparkles size={18} />} showBack={false}>
        <UserMenu />
      </PageHeader>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1 w-full">
        {error && (
          <div className="text-sm text-destructive font-body text-center py-2">
            {error}
          </div>
        )}

        {/* Welcome */}
        <div className="text-center sm:text-left">
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            Hey, {displayName}
          </h1>
          <p className="mt-2 text-muted-foreground font-body">
            Here&apos;s everything you need for today.
          </p>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground font-body text-center py-12">
            <span className="animate-gentle-pulse">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Bento Actions */}
            <div className="max-w-3xl">
              <AppleBento
                items={[
                  {
                    size: "large",
                    variant: "custom",
                    title: "Water",
                    href: "/water",
                    children: (
                      <WaterBentoCard
                        percentage={water?.percentage ?? 0}
                        consumed_ml={water?.consumed_ml ?? 0}
                        goal_ml={water?.goal_ml ?? 2500}
                        remaining_ml={water?.remaining_ml}
                        className="h-full"
                      />
                    ),
                  },
                  {
                    size: "tall",
                    variant: "text",
                    icon: ListTodo,
                    title: "Todos",
                    description: `${stats?.active ?? 0} active, ${stats?.completed_today ?? 0} done today`,
                    href: "/todos",
                  },
                  // {
                  //   size: "small",
                  //   variant: "text",
                  //   icon: Sparkles,
                  //   title: "AI",
                  //   description: planInfo
                  //     ? `${planInfo.ai_requests_remaining} / ${planInfo.ai_requests_limit} left`
                  //     : "Generate todos",
                  //   href: "/todos",
                  // },
                  {
                    size: "small",
                    variant: "text",
                    icon: FileText,
                    title: "Notes",
                    description: `${notesCount} saved`,
                    href: "/notes",
                  },
                  {
                    size: "small",
                    variant: "text",
                    icon: Utensils,
                    title: "Food",
                    description: foodSummary
                      ? `${Math.round(foodSummary.total_calories)} kcal`
                      : "Track meals",
                    href: "/food",
                  },
                ]}
              />
            </div>

            {/* Daily Snapshot */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
              <h2 className="font-heading text-base font-medium tracking-tight mb-5">
                Daily snapshot
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SnapshotItem
                  icon={Check}
                  value={stats?.completed_today ?? 0}
                  label="Done today"
                />
                <SnapshotItem
                  icon={Zap}
                  value={stats?.active ?? 0}
                  label="Active"
                />
                <SnapshotItem
                  icon={Droplets}
                  value={`${water?.percentage ?? 0}%`}
                  label="Hydration"
                />
                <SnapshotItem
                  icon={FileText}
                  value={notesCount}
                  label="Notes"
                />
                <SnapshotItem
                  icon={Utensils}
                  value={foodSummary ? `${Math.round(foodSummary.total_calories)}` : 0}
                  label="Calories"
                />
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

