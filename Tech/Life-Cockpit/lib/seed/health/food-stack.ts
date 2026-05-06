/**
 * Food Stack — daily checklist of foods/macros to hit every day.
 *
 * Phase 1 placeholder — replace with content from the user's "Food Stack" tab
 * in the Health Google Sheet once Google Workspace MCP is re-authenticated.
 *
 * Categories chosen to mirror evidence-based longevity / performance food
 * stacks (Attia, Bryan Johnson Blueprint, Mediterranean baseline). Items are
 * grouped so the checklist reads like a well-formed plate, not a random list.
 */

export type FoodCategory = "Protein" | "Greens" | "Fruit" | "Healthy Fats" | "Fermented" | "Hydration" | "Macros";

export interface FoodItem {
  id: string;
  label: string;
  detail?: string;
  category: FoodCategory;
  /** Optional numeric target — when present, item is "hit" only if value reached. */
  target?: { unit: string; value: number };
}

export const foodStackSeed: FoodItem[] = [
  // --- Macros (numeric targets) ---
  { id: "protein", label: "Protein", detail: "1.6–2.2 g/kg lean mass", category: "Macros", target: { unit: "g", value: 165 } },
  { id: "fiber", label: "Fiber", detail: "Whole-food sources only", category: "Macros", target: { unit: "g", value: 40 } },
  { id: "eating-window", label: "Eating window ≤ 10h", detail: "First → last bite", category: "Macros" },

  // --- Protein anchors ---
  { id: "fatty-fish", label: "Fatty fish OR pasture eggs", detail: "Salmon, sardines, mackerel — or 3 eggs", category: "Protein" },
  { id: "lean-protein", label: "Lean protein (lunch + dinner)", detail: "Chicken, turkey, tofu, tempeh, lean beef", category: "Protein" },

  // --- Greens & cruciferous ---
  { id: "leafy-greens", label: "2 servings leafy greens", detail: "Spinach, kale, rocket — 1 raw + 1 cooked", category: "Greens" },
  { id: "cruciferous", label: "1 serving cruciferous", detail: "Broccoli, cauliflower, brussels sprouts", category: "Greens" },
  { id: "alliums", label: "Garlic OR onion (cooked)", detail: "Crush, rest 10 min, then cook", category: "Greens" },

  // --- Fruit ---
  { id: "berries", label: "1 cup berries", detail: "Blueberries, raspberries, blackberries", category: "Fruit" },
  { id: "citrus-or-kiwi", label: "1 citrus OR 1 kiwi", detail: "Vit C + flavonoids", category: "Fruit" },

  // --- Fats ---
  { id: "evoo", label: "2 tbsp EVOO", detail: "Cold over salad / drizzle", category: "Healthy Fats" },
  { id: "nuts-seeds", label: "30 g nuts/seeds", detail: "Walnuts, almonds, chia, flax", category: "Healthy Fats" },
  { id: "avocado", label: "½ avocado (optional)", detail: "Mono-unsaturated fat boost", category: "Healthy Fats" },

  // --- Fermented ---
  { id: "fermented", label: "1 fermented item", detail: "Kefir, yogurt, sauerkraut, kimchi", category: "Fermented" },

  // --- Hydration ---
  { id: "water", label: "Water", detail: "30 ml / kg bodyweight", category: "Hydration", target: { unit: "L", value: 2.5 } },
  { id: "matcha-or-greentea", label: "Matcha OR green tea", detail: "1 cup before noon", category: "Hydration" },
  { id: "no-alcohol", label: "Zero alcohol", detail: "Default; flag exceptions", category: "Hydration" },
];

export const foodStackCategories: FoodCategory[] = [
  "Macros",
  "Protein",
  "Greens",
  "Fruit",
  "Healthy Fats",
  "Fermented",
  "Hydration",
];
