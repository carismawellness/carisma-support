"use client";

import { brands } from "@/lib/constants/brands";
import { cn } from "@/lib/utils";

interface BrandFilterProps {
  selected: string | null;
  onChange: (brand: string | null) => void;
}

export function BrandFilter({ selected, onChange }: BrandFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-warm-gray rounded-lg p-1">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          selected === null
            ? "bg-gold text-white shadow-sm"
            : "text-text-secondary hover:text-charcoal"
        )}
      >
        All
      </button>
      {brands.map((brand) => (
        <button
          key={brand.slug}
          onClick={() => onChange(brand.slug)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            selected === brand.slug
              ? "bg-gold text-white shadow-sm"
              : "text-text-secondary hover:text-charcoal"
          )}
        >
          {brand.label}
        </button>
      ))}
    </div>
  );
}
