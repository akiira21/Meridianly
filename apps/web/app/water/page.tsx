"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { api, WaterIntake, WaterDailySummary } from "@/lib/api";
import { Droplets, Plus, Trash2, History } from "lucide-react";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import NumberStepper from "@/components/ui/number-stepper";
import WaterBentoCard from "@/components/ui/water-bento-card";

const QUICK_AMOUNTS = [150, 250, 330, 500];

export default function WaterPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rehydrated = useAuthStore((state) => state.rehydrated);

  const [summary, setSummary] = useState<WaterDailySummary | null>(null);
  const [intakes, setIntakes] = useState<WaterIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rehydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadToday();
  }, [isAuthenticated, rehydrated, router]);

  async function loadToday() {
    try {
      setLoading(true);
      const { data } = await api.getWaterToday();
      setSummary(data.summary);
      setIntakes(data.intakes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load water data");
    } finally {
      setLoading(false);
    }
  }

  async function logWater(amount_ml: number) {
    try {
      await api.logWater(amount_ml);
      loadToday();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log water");
    }
  }

  async function deleteIntake(id: number) {
    try {
      await api.deleteWaterIntake(id);
      loadToday();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete intake");
    }
  }

  function handleCustomAdd() {
    if (customAmount && customAmount > 0) {
      logWater(customAmount);
      setCustomAmount(null);
    }
  }

  if (!rehydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-gentle-pulse text-sm text-muted-foreground font-body">
          Loading...
        </div>
      </div>
    );
  }

  const percentage = summary?.percentage ?? 0;
  const consumed = summary?.consumed_ml ?? 0;
  const goal = summary?.goal_ml ?? 2500;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Water" icon={<Droplets size={18} className="text-blue-500" />} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        {error && (
          <div className="text-sm text-destructive font-body text-center py-2">
            {error}
          </div>
        )}

        {/* Water Bento */}
        <WaterBentoCard
          percentage={percentage}
          consumed_ml={consumed}
          goal_ml={goal}
          remaining_ml={summary?.remaining_ml}
        />

        {/* Quick Add */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h2 className="font-heading text-base font-medium tracking-tight mb-4">
            Quick add
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => logWater(amount)}
                className="flex flex-col cursor-pointer items-center gap-2 p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
              >
                <Plus size={16} className="text-blue-500" />
                <span className="font-body text-xs font-medium">{amount}ml</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <NumberStepper
              value={customAmount}
              onChange={setCustomAmount}
              min={0}
              step={50}
              placeholder="0"
              unit="ml"
            />
            <button
              onClick={handleCustomAdd}
              disabled={!customAmount || customAmount <= 0}
              className="px-4 py-2 cursor-pointer bg-foreground text-background rounded-full font-body text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Today's History */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <History size={16} className="text-muted-foreground" />
            <h2 className="font-heading text-base font-medium tracking-tight">
              Today
            </h2>
          </div>
          {loading ? (
            <div className="text-sm text-muted-foreground font-body text-center py-8">
              <span className="animate-gentle-pulse">Loading...</span>
            </div>
          ) : intakes.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-6">
              No water logged yet today.
            </p>
          ) : (
            <div className="space-y-2">
              {intakes.map((intake) => (
                <div
                  key={intake.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Droplets size={14} className="text-blue-500" />
                    <span className="font-body text-sm font-medium">
                      {intake.amount_ml} ml
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-body">
                      {new Date(intake.logged_at + "Z").toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => deleteIntake(intake.id)}
                      className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                      aria-label="Delete intake"
                    >
                      <Trash2 size={13} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
