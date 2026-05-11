/**
 * Food Stack — daily checklist sourced from Mert's "Food Stack" tab in the
 * Health Google Sheet (1IGQ9oqzLsktK7re5u8tmZwiKlu2iAG2KMA43Vk9tRkI).
 * Last sync: 2026-05-11.
 *
 * Title is "Food Stack" but the sheet is actually the user's full "Perfect
 * Day" — food + supplements + exercise + recovery + self-care + peptides
 * + sleep hygiene. The cockpit mirrors that structure: numeric KPIs on top,
 * time-blocked checklist below.
 */

export interface KPITarget {
  id: string;
  label: string;
  unit: string;
  target: number;
  /** True for "stay below" targets (Sodium, Sugar). */
  inverse?: boolean;
  /** Whether the user manually enters a number (true) or just sees a reference (false). */
  manual: boolean;
}

export interface FoodItem {
  id: string;
  label: string;
  detail?: string;
}

export interface TimeBlock {
  id: string;
  time: string;
  title: string;
  items: FoodItem[];
}

/** Primary KPIs the user actually enters (top numeric tiles). */
export const foodStackPrimaryKPIs: KPITarget[] = [
  { id: "kcal", label: "Calories", unit: "kcal", target: 2000, manual: true },
  { id: "protein", label: "Protein", unit: "g", target: 150, manual: true },
  { id: "fiber", label: "Fiber", unit: "g", target: 35, manual: true },
  { id: "water", label: "Water", unit: "L", target: 1.5, manual: true },
];

/** Secondary KPIs shown as reference (informational, no input row). */
export const foodStackSecondaryKPIs: KPITarget[] = [
  { id: "potassium", label: "Potassium", unit: "mg", target: 4000, manual: false },
  { id: "sodium", label: "Sodium", unit: "mg", target: 1000, inverse: true, manual: false },
  { id: "sugar", label: "Sugar", unit: "g", target: 30, inverse: true, manual: false },
];

/** Time-blocked checklist — mirrors the Food Stack tab top-to-bottom. */
export const foodStackBlocks: TimeBlock[] = [
  {
    id: "am-self-care",
    time: "8:30",
    title: "AM · Self care",
    items: [
      { id: "vit-c", label: "Vit C" },
      { id: "caffeine", label: "Caffeine" },
      { id: "teeth-am", label: "Teeth" },
      { id: "eye-am", label: "Eye" },
      { id: "spf", label: "SPF" },
      { id: "hair-am", label: "Hair" },
      { id: "posture-fascia", label: "Posture + Fascia + Eye w/ sunlight" },
    ],
  },
  {
    id: "lunch",
    time: "12:00",
    title: "Lunch",
    items: [
      { id: "superbowl", label: "Superbowl (1 portion)" },
      { id: "sulforaphane", label: "Sulforaphane 30 mg" },
      { id: "omega-3", label: "Omega-3 (EPA+DHA)", detail: "1–2 g with lunch" },
    ],
  },
  {
    id: "preworkout",
    time: "16:00",
    title: "Pre-workout snack",
    items: [
      { id: "whey-creatine", label: "Whey isolate 50 g + Creatine monohydrate 5 g" },
      { id: "coconut-water", label: "Coconut water" },
      { id: "glycine", label: "Glycine 3 g" },
    ],
  },
  {
    id: "exercise",
    time: "17:30",
    title: "Exercise",
    items: [
      { id: "lifting", label: "Weight lifting", detail: "2 supersets · 3 sets × 10 rep max" },
      { id: "cardio", label: "Cardio", detail: "30 min · 13 incline · 6 speed" },
    ],
  },
  {
    id: "recovery",
    time: "18:30",
    title: "Recovery",
    items: [
      { id: "sauna", label: "Sauna 15 min" },
      { id: "cold-shower", label: "Cold shower 1 min" },
    ],
  },
  {
    id: "dinner",
    time: "19:30",
    title: "Dinner",
    items: [
      { id: "main-meal", label: "Salmon + sweet potatoes + veggies", detail: "200 g each" },
      { id: "walnuts", label: "Walnuts (unsalted)" },
      { id: "cucumber-salsa", label: "Cucumbers + salsa dip", detail: "0 salt, 0 sugar" },
      { id: "yogurt", label: "Greek yogurt 0% + berries / banana / kefir" },
    ],
  },
  {
    id: "pm-self-care",
    time: "19:30",
    title: "PM · Self care",
    items: [
      { id: "cleanse", label: "Cleanse" },
      { id: "tone", label: "Tone" },
      { id: "tretinoin", label: "Tretinoin 0.25%" },
      { id: "eye-retinol", label: "Under-eye retinol" },
      { id: "teeth-pm", label: "Teeth" },
      { id: "moisturizer", label: "Moisturizer" },
      { id: "headband", label: "Headbands" },
    ],
  },
  {
    id: "pm-supplements",
    time: "23:00",
    title: "PM · Supplements",
    items: [
      { id: "magnesium", label: "Magnesium glycinate 400 mg" },
      { id: "vitd-k2", label: "Vitamin D + K2 combo" },
    ],
  },
  {
    id: "peptides",
    time: "24:00",
    title: "Peptides",
    items: [
      { id: "retatrutide", label: "Retatrutide 1 mg", detail: "1× per week" },
      { id: "dsip", label: "DSIP" },
    ],
  },
  {
    id: "sleep",
    time: "Sleep",
    title: "Sleep hygiene",
    items: [
      { id: "consistent-bedtime", label: "Same bedtime ± 30 min" },
      { id: "dark-room", label: "Dark room" },
      { id: "cool-room", label: "Cool room (18–20 °C)" },
      { id: "no-screens", label: "No screens 1 h before bed" },
    ],
  },
];

/** Convenience: flat list of all checklist items (for total count). */
export const foodStackAllItems: FoodItem[] = foodStackBlocks.flatMap((b) => b.items);
