"use client";

import { brands } from "@/lib/constants/brands";
import { cn } from "@/lib/utils";

interface BrandFilterProps {
  selected: string | null;
  onChange: (brand: string | null) => void;
}

export function BrandFilter({ selected, onChange }: BrandFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          selected === null
            ? "bg-white text-navy shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        All
      </button>
      {brands.map((brand) => (
        <button
          key={brand.slug}
          onClick={() => onChange(brand.slug)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            selected === brand.slug
              ? "bg-white text-navy shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {brand.label}
        </button>
      ))}
    </div>
  );
}
