"use client";

import { useState } from "react";

export function useBrandFilter() {
  const [brand, setBrand] = useState<string | null>(null);
  return { brand, setBrand };
}
