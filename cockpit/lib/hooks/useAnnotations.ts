"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";

interface Annotation {
  id: number;
  date: string;
  page: string;
  title: string;
  note: string | null;
  color: string;
  created_at: string;
}

export function useAnnotations(page: string, dateFrom: Date, dateTo: Date) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnnotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        dateFrom: format(dateFrom, "yyyy-MM-dd"),
        dateTo: format(dateTo, "yyyy-MM-dd"),
      });
      const res = await fetch(`/api/annotations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAnnotations(data.annotations || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo]);

  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  async function addAnnotation(date: string, title: string, note?: string) {
    try {
      const res = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, page, title, note }),
      });
      if (res.ok) {
        await fetchAnnotations(); // Refresh
      }
    } catch {
      // Silent fail
    }
  }

  async function removeAnnotation(id: number) {
    try {
      await fetch(`/api/annotations?id=${id}`, { method: "DELETE" });
      await fetchAnnotations();
    } catch {
      // Silent fail
    }
  }

  return { annotations, loading, addAnnotation, removeAnnotation };
}
