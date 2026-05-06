"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import {
  lookBookSeed,
  garmentImage,
  type GarmentCategory,
  type Garment,
  type Outfit,
} from "@/lib/seed/love/look-book";
import { cn } from "@/lib/utils";

const TABS = ["Closet", "Outfits", "Plan"] as const;
type Tab = (typeof TABS)[number];
const CATEGORIES: (GarmentCategory | "All")[] = ["All", "Tops", "Bottoms", "Outerwear", "Footwear", "Accessories", "Tailoring"];

const OUTFIT_FILTERS = ["All", "Recent", "Rare", "Formal", "Casual"] as const;
type OutfitFilter = (typeof OUTFIT_FILTERS)[number];

const OUTFIT_SORTS = [
  { value: "newest", label: "Last worn (newest)" },
  { value: "oldest", label: "Last worn (oldest — find the rare ones)" },
  { value: "rating", label: "Rating (high → low)" },
  { value: "name", label: "Name (A-Z)" },
] as const;
type OutfitSort = (typeof OUTFIT_SORTS)[number]["value"];

const FORMAL_KEYWORDS = ["formal", "wedding", "business", "brand"];
const CASUAL_KEYWORDS = ["casual", "brunch", "athleisure", "smart casual"];
const WARM_KEYWORDS = ["casual", "brunch", "beach", "travel"];
const COOL_KEYWORDS = ["business", "formal", "wedding"];

function daysSince(dateStr: string, today: Date): number {
  const d = new Date(dateStr).getTime();
  return Math.floor((today.getTime() - d) / (1000 * 60 * 60 * 24));
}

function matchesOutfitFilter(o: Outfit, filter: OutfitFilter, today: Date): boolean {
  if (filter === "All") return true;
  const occ = o.occasion.toLowerCase();
  if (filter === "Formal") return FORMAL_KEYWORDS.some((k) => occ.includes(k));
  if (filter === "Casual") return CASUAL_KEYWORDS.some((k) => occ.includes(k));
  const days = daysSince(o.lastWorn, today);
  if (filter === "Recent") return days <= 30;
  if (filter === "Rare") return days > 60;
  return true;
}

function sortOutfits(list: Outfit[], sort: OutfitSort): Outfit[] {
  const copy = [...list];
  if (sort === "newest") {
    copy.sort((a, b) => new Date(b.lastWorn).getTime() - new Date(a.lastWorn).getTime());
  } else if (sort === "oldest") {
    copy.sort((a, b) => new Date(a.lastWorn).getTime() - new Date(b.lastWorn).getTime());
  } else if (sort === "rating") {
    copy.sort((a, b) => b.rating - a.rating);
  } else if (sort === "name") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return copy;
}

function pickWeatherOutfits(outfits: Outfit[], tempC: number): Outfit[] {
  const keywords = tempC >= 25 ? WARM_KEYWORDS : COOL_KEYWORDS;
  const matches = outfits.filter((o) => {
    const occ = o.occasion.toLowerCase();
    return keywords.some((k) => occ.includes(k));
  });
  if (matches.length >= 3) {
    return [...matches].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }
  const remaining = outfits.filter((o) => !matches.includes(o));
  const fallback = [...remaining].sort((a, b) => b.rating - a.rating);
  return [...matches, ...fallback].slice(0, 3);
}

function whyOutfit(o: Outfit, tempC: number, today: Date): string {
  const days = daysSince(o.lastWorn, today);
  const occ = o.occasion.toLowerCase();
  const isWarmPick = tempC >= 25 && WARM_KEYWORDS.some((k) => occ.includes(k));
  const isCoolPick = tempC < 25 && COOL_KEYWORDS.some((k) => occ.includes(k));
  if (isWarmPick) return `Why: light ${o.occasion.toLowerCase()} fit for ${tempC}°C`;
  if (isCoolPick) return `Why: ${o.occasion.toLowerCase()} formality suits ${tempC}°C`;
  if (o.rating >= 5) return `Why: ${"★".repeat(o.rating)} rating, last worn ${days}d ago`;
  if (days > 60) return `Why: rare gem — last worn ${days}d ago`;
  return `Why: ${"★".repeat(o.rating)} rating, last worn ${days}d ago`;
}

function suggestedPairCategory(cat: GarmentCategory): string {
  switch (cat) {
    case "Tops": return "tailored bottoms";
    case "Bottoms": return "an oxford shirt";
    case "Outerwear": return "a white tee + chinos";
    case "Footwear": return "denim + a knit";
    case "Accessories": return "your go-to outfit";
    case "Tailoring": return "a crisp shirt + loafers";
    default: return "a staple piece";
  }
}

export default function LookBookPage() {
  const s = lookBookSeed;
  const [tab, setTab] = useState<Tab>("Closet");
  const [filter, setFilter] = useState<GarmentCategory | "All">("All");
  const [outfitFilter, setOutfitFilter] = useState<OutfitFilter>("All");
  const [outfitSort, setOutfitSort] = useState<OutfitSort>("newest");

  const today = useMemo(() => new Date(), []);

  const totalGarments = s.garments.length;
  const outfitsCount = s.outfits.length;
  const avgCpw = +(s.garments.reduce((sum, g) => sum + g.costPerWear, 0) / totalGarments).toFixed(2);
  const underused = s.garments.filter((g) => g.wornInLast90 < 2).length;

  const worstCpwGarments: Garment[] = useMemo(
    () => [...s.garments].sort((a, b) => b.costPerWear - a.costPerWear).slice(0, 3),
    [s.garments]
  );
  const worst = worstCpwGarments[0];

  const filteredGarments = useMemo(
    () => (filter === "All" ? s.garments : s.garments.filter((g) => g.category === filter)),
    [filter, s.garments]
  );

  const filteredOutfits = useMemo(() => {
    const matched = s.outfits.filter((o) => matchesOutfitFilter(o, outfitFilter, today));
    return sortOutfits(matched, outfitSort);
  }, [s.outfits, outfitFilter, outfitSort, today]);

  const weatherOutfits = useMemo(
    () => pickWeatherOutfits(s.outfits, s.weather.tempC),
    [s.outfits, s.weather.tempC]
  );

  const decision =
    tab === "Closet" && worst
      ? `Worst CPW: ${worst.name} at €${worst.costPerWear.toFixed(0)}/wear — pair with ${suggestedPairCategory(worst.category)} this week.`
      : "Underused: linen blazer not worn in 87 days — try with white shirt + chinos this week";

  return (
    <ModuleShell pillarId="love" moduleSlug="look-book" decision={decision}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Garments" value={totalGarments} />
        <StatCard label="Outfits saved" value={outfitsCount} />
        <StatCard label="Avg cost-per-wear" value={`€${avgCpw}`} />
        <StatCard label="Underused (<2 in 90d)" value={underused} status="amber" />
      </div>

      <div className="border-b border-border flex gap-1 overflow-x-auto -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm border-b-2 -mb-px transition-colors min-h-[44px]",
              t === tab ? "border-pink-600 text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Closet" && (
        <>
          <Card className="p-3 bg-muted/30">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Cost-per-wear watch</p>
            <div className="flex gap-3 overflow-x-auto -mx-1 px-1">
              {worstCpwGarments.map((g) => (
                <div key={g.id} className="flex items-center gap-2 shrink-0 min-w-[200px]">
                  <div className="relative w-10 h-[54px] bg-muted rounded overflow-hidden shrink-0">
                    <Image src={garmentImage(g.id, 40, 54)} alt={g.name} fill className="object-cover" sizes="40px" unoptimized />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{g.brand}</p>
                    <p className="text-[11px] text-muted-foreground">€{g.costPerWear.toFixed(0)}/wear · worn {g.wornInLast90} in 90d</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border transition-colors",
                  filter === c ? "bg-pink-50 border-pink-300 text-pink-700" : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredGarments.map((g) => (
              <Card key={g.id} className="overflow-hidden p-0">
                <div className="relative w-full aspect-[3/4] bg-muted">
                  <Image src={garmentImage(g.id)} alt={g.name} fill className="object-cover" sizes="200px" unoptimized />
                </div>
                <div className="p-2 space-y-0.5">
                  <p className="text-xs font-medium truncate">{g.name}</p>
                  <p className="text-[10px] text-muted-foreground">{g.brand} · {g.color}</p>
                  <p className="text-[10px] text-muted-foreground">F{g.formality} · {g.season} · €{g.costPerWear}/wear</p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "Outfits" && (
        <>
          <div className="flex gap-2 flex-wrap items-center">
            {OUTFIT_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setOutfitFilter(f)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border transition-colors",
                  outfitFilter === f ? "bg-pink-50 border-pink-300 text-pink-700" : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {f}
              </button>
            ))}
            <select
              value={outfitSort}
              onChange={(e) => setOutfitSort(e.target.value as OutfitSort)}
              className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:bg-accent bg-transparent ml-auto"
              aria-label="Sort outfits"
            >
              {OUTFIT_SORTS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {filteredOutfits.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">No outfits match — try a different filter.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOutfits.map((o) => (
                <Card key={o.id} className="p-3">
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {o.garmentIds.slice(0, 4).map((gid) => (
                      <div key={gid} className="relative aspect-square bg-muted rounded overflow-hidden">
                        <Image src={garmentImage(gid, 150, 150)} alt={gid} fill className="object-cover" sizes="100px" unoptimized />
                      </div>
                    ))}
                  </div>
                  <p className="font-medium text-sm">{o.name}</p>
                  <p className="text-[11px] text-muted-foreground">{o.occasion} · {"★".repeat(o.rating)} · last worn {o.lastWorn}</p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "Plan" && (
        <div className="space-y-4">
          <Card className="p-4 bg-pink-50 border-pink-200">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Today · {s.weather.source}</p>
            <p className="text-2xl font-bold">{s.weather.tempC}°C · {s.weather.condition}</p>
          </Card>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Suggested for {s.weather.tempC}°C</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {weatherOutfits.map((o) => (
              <Card key={o.id} className="p-3">
                <div className="grid grid-cols-2 gap-1 mb-3">
                  {o.garmentIds.slice(0, 4).map((gid) => (
                    <div key={gid} className="relative aspect-square bg-muted rounded overflow-hidden">
                      <Image src={garmentImage(gid, 150, 150)} alt={gid} fill className="object-cover" sizes="100px" unoptimized />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium">{o.name}</p>
                <p className="text-[11px] text-muted-foreground">{o.occasion}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{whyOutfit(o, s.weather.tempC, today)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </ModuleShell>
  );
}
