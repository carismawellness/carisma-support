"use client";

import { useState } from "react";
import { subDays } from "date-fns";

export function useDateRange() {
  const [from, setFrom] = useState(() => subDays(new Date(), 30));
  const [to, setTo] = useState(() => new Date());

  function setRange(newFrom: Date, newTo: Date) {
    setFrom(newFrom);
    setTo(newTo);
  }

  return { from, to, setRange };
}
