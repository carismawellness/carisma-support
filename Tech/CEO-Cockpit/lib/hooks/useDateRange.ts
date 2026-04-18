"use client";

import { useState } from "react";
import { startOfYear } from "date-fns";

export function useDateRange() {
  const [from, setFrom] = useState(() => startOfYear(new Date()));
  const [to, setTo] = useState(() => new Date());

  function setRange(newFrom: Date, newTo: Date) {
    setFrom(newFrom);
    setTo(newTo);
  }

  return { from, to, setRange };
}
