"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { api, FoodPreset as ApiFoodPreset } from "@/lib/api";
import { Plus, Trash2, ChevronDown, ChevronUp, Search, Utensils } from "lucide-react";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";

interface FoodPreset extends ApiFoodPreset {}

interface FoodLog {
  id: number;
  food_name: string;
  amount_g: number;
  serving_unit: string | null;
  serving_quantity: number | null;
  calculated_calories: number;
  calculated_protein: number;
  calculated_carbs: number;
  calculated_fat: number;
  logged_at: string;
}

interface NutritionSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  entry_count: number;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "grains", label: "Grains" },
  { value: "proteins", label: "Proteins" },
  { value: "vegetables", label: "Vegetables" },
  { value: "snacks", label: "Snacks" },
  { value: "dairy", label: "Dairy" },
  { value: "beverages", label: "Beverages" },
  { value: "fruits", label: "Fruits" },
  { value: "desserts", label: "Desserts" },
  { value: "sides", label: "Sides" },
  { value: "soups", label: "Soups" },
];

const UNIT_LABELS: Record<string, string> = {
  katori: "Katori",
  plate: "Plate",
  bowl: "Bowl",
  glass: "Glass",
  piece: "Piece",
  number: "Number",
  cup: "Cup",
  spoon: "Spoon",
};

export default function FoodPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rehydrated = useAuthStore((state) => state.rehydrated);

  const [presets, setPresets] = useState<FoodPreset[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [summary, setSummary] = useState<NutritionSummary>({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    entry_count: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<FoodPreset | null>(null);
  const [amountG, setAmountG] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [unitQuantity, setUnitQuantity] = useState<number>(1);

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState(0);
  const [customProtein, setCustomProtein] = useState(0);
  const [customCarbs, setCustomCarbs] = useState(0);
  const [customFat, setCustomFat] = useState(0);

  useEffect(() => {
    if (rehydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, rehydrated, router]);

  const loadData = useCallback(async () => {
    try {
      const cat = selectedCategory === "all" ? undefined : selectedCategory;
      const [presetsRes, todayRes] = await Promise.all([
        api.getFoodPresets(cat),
        api.getFoodToday(),
      ]);
      setPresets(presetsRes.data.items);
      setLogs(todayRes.data.logs);
      setSummary(todayRes.data.summary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const filteredPresets = presets.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePresetSelect = (preset: FoodPreset) => {
    setSelectedPreset(preset);
    const units = preset.serving_units ? Object.keys(preset.serving_units) : [];
    setSelectedUnit(units.length > 0 ? units[0] : null);
    setUnitQuantity(1);
    setAmountG(100);
    setShowCustomForm(false);
  };

  const getEffectiveAmount = (preset: FoodPreset, unit: string | null, qty: number, grams: number): number => {
    if (unit && preset.serving_units && preset.serving_units[unit]) {
      return preset.serving_units[unit] * qty;
    }
    return grams;
  };

  const calculateMacros = (preset: FoodPreset, amount: number) => {
    const ratio = amount / 100;
    return {
      calories: Math.round(preset.calories_per_100g * ratio * 10) / 10,
      protein: Math.round(preset.protein_per_100g * ratio * 10) / 10,
      carbs: Math.round(preset.carbs_per_100g * ratio * 10) / 10,
      fat: Math.round(preset.fat_per_100g * ratio * 10) / 10,
    };
  };

  const effectiveAmount = selectedPreset
    ? getEffectiveAmount(selectedPreset, selectedUnit, unitQuantity, amountG)
    : amountG;

  const handleLogPreset = async () => {
    if (!selectedPreset) return;
    const macros = calculateMacros(selectedPreset, effectiveAmount);
    try {
      await api.logFood({
        food_preset_id: selectedPreset.id,
        food_name: selectedPreset.name,
        amount_g: Math.round(effectiveAmount),
        serving_unit: selectedUnit,
        serving_quantity: selectedUnit ? unitQuantity : null,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      });
      setSelectedPreset(null);
      setAmountG(100);
      setSelectedUnit(null);
      setUnitQuantity(1);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log food");
    }
  };

  const handleLogCustom = async () => {
    if (!customName.trim()) return;
    try {
      await api.logFood({
        food_preset_id: null,
        food_name: customName.trim(),
        amount_g: amountG,
        calories: customCalories,
        protein: customProtein,
        carbs: customCarbs,
        fat: customFat,
      });
      setCustomName("");
      setCustomCalories(0);
      setCustomProtein(0);
      setCustomCarbs(0);
      setCustomFat(0);
      setShowCustomForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log food");
    }
  };

  const handleDeleteLog = async (id: number) => {
    try {
      await api.deleteFoodLog(id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const formatLogLabel = (log: FoodLog) => {
    if (log.serving_unit && log.serving_quantity) {
      return `${log.serving_quantity} ${UNIT_LABELS[log.serving_unit] || log.serving_unit} (~${log.amount_g}g)`;
    }
    return `${log.amount_g}g`;
  };

  if (!rehydrated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Food" icon={<Utensils size={18} />} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 w-full">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl sm:text-3xl font-medium tracking-tight">
            Food Tracker
          </h1>
        </div>

        {error && (
          <div className="text-sm text-destructive font-body text-center">{error}</div>
        )}

        {/* Summary Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground font-body">Calories</p>
            <p className="text-xl font-heading font-medium">{Math.round(summary.total_calories)}</p>
            <p className="text-xs text-muted-foreground font-body">kcal</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground font-body">Protein</p>
            <p className="text-xl font-heading font-medium">{Math.round(summary.total_protein)}g</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground font-body">Carbs</p>
            <p className="text-xl font-heading font-medium">{Math.round(summary.total_carbs)}g</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground font-body">Fat</p>
            <p className="text-xl font-heading font-medium">{Math.round(summary.total_fat)}g</p>
          </div>
        </div>

        {/* Today's Log */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
          <h2 className="font-heading text-lg font-medium mb-3">Today&apos;s Log</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-4">
              No food logged today. Add your first meal below.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-background rounded-xl border border-border"
                >
                  <div>
                    <p className="text-sm font-medium font-body">{log.food_name}</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {formatLogLabel(log)} &middot; {Math.round(log.calculated_calories)} kcal
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Food Section */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="font-heading text-lg font-medium">Add Food</h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground border border-border hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Preset Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  selectedPreset?.id === preset.id
                    ? "border-foreground bg-foreground/5"
                    : "border-border bg-background hover:border-foreground/20"
                }`}
              >
                <p className="text-sm font-medium font-body truncate">{preset.name}</p>
                <p className="text-xs text-muted-foreground font-body">
                  {preset.calories_per_100g} kcal/100g
                </p>
              </button>
            ))}
          </div>

          {/* Selected Preset Form */}
          {selectedPreset && !showCustomForm && (
            <div className="p-4 bg-background border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium font-body">{selectedPreset.name}</p>
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              {selectedPreset.serving_units && Object.keys(selectedPreset.serving_units).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-sm font-body text-muted-foreground">Unit</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(selectedPreset.serving_units).map((unit) => (
                        <button
                          key={unit}
                          onClick={() => {
                            setSelectedUnit(unit);
                            setUnitQuantity(1);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
                            selectedUnit === unit
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {UNIT_LABELS[unit] || unit}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedUnit(null);
                          setAmountG(100);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
                          selectedUnit === null
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Grams
                      </button>
                    </div>
                  </div>

                  {selectedUnit ? (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-body text-muted-foreground">Quantity</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setUnitQuantity((q) => Math.max(0.25, q - 0.25))}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-body hover:bg-muted/80"
                        >
                          -
                        </button>
                        <span className="text-sm font-body w-12 text-center">
                          {unitQuantity % 1 === 0 ? unitQuantity : unitQuantity.toFixed(2)}
                        </span>
                        <button
                          onClick={() => setUnitQuantity((q) => q + 0.25)}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-body hover:bg-muted/80"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground font-body">
                        ~{Math.round(getEffectiveAmount(selectedPreset, selectedUnit, unitQuantity, amountG))}g
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-body text-muted-foreground">Amount (g)</label>
                      <input
                        type="number"
                        min={1}
                        max={5000}
                        value={amountG}
                        onChange={(e) => setAmountG(Number(e.target.value))}
                        className="w-24 px-3 py-2 bg-background border border-border rounded-xl font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>
              )}

              {(!selectedPreset.serving_units || Object.keys(selectedPreset.serving_units).length === 0) && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-body text-muted-foreground">Amount (g)</label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={amountG}
                    onChange={(e) => setAmountG(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-background border border-border rounded-xl font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              {(() => {
                const m = calculateMacros(selectedPreset, effectiveAmount);
                return (
                  <div className="flex gap-3 text-xs text-muted-foreground font-body">
                    <span>{m.calories} kcal</span>
                    <span>P: {m.protein}g</span>
                    <span>C: {m.carbs}g</span>
                    <span>F: {m.fat}g</span>
                  </div>
                );
              })()}
              <button
                onClick={handleLogPreset}
                className="w-full px-4 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Add to Log
              </button>
            </div>
          )}

          {/* Custom Food Toggle */}
          <button
            onClick={() => {
              setShowCustomForm(!showCustomForm);
              setSelectedPreset(null);
            }}
            className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={16} />
            {showCustomForm ? "Hide custom entry" : "Add custom food"}
            {showCustomForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Custom Form */}
          {showCustomForm && (
            <div className="p-4 bg-background border border-border rounded-xl space-y-3">
              <input
                type="text"
                placeholder="Food name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">Amount (g)</label>
                  <input
                    type="number"
                    min={1}
                    value={amountG}
                    onChange={(e) => setAmountG(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">Calories</label>
                  <input
                    type="number"
                    min={0}
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">Fat (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <button
                onClick={handleLogCustom}
                disabled={!customName.trim()}
                className="w-full px-4 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Custom Food
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
