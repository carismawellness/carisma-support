"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface UseKPIDataOptions {
  table: string;
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
  dateColumn?: string;
  brandColumn?: string;
}

export function useKPIData<T = Record<string, unknown>>({
  table,
  dateFrom,
  dateTo,
  brandFilter,
  dateColumn = "date",
  brandColumn = "brand_id",
}: UseKPIDataOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      let query = supabase
        .from(table)
        .select("*")
        .gte(dateColumn, format(dateFrom, "yyyy-MM-dd"))
        .lte(dateColumn, format(dateTo, "yyyy-MM-dd"))
        .order(dateColumn, { ascending: true });

      if (brandFilter) {
        const brandIds: Record<string, number> = {
          spa: 1,
          aesthetics: 2,
          slimming: 3,
        };
        const brandId = brandIds[brandFilter];
        if (brandId) {
          query = query.eq(brandColumn, brandId);
        }
      }

      const { data: result, error: err } = await query;

      if (err) {
        setError(err.message);
        setData([]);
      } else {
        setData((result as T[]) || []);
      }

      setLoading(false);
    }

    fetchData();
  }, [table, dateFrom, dateTo, brandFilter, dateColumn, brandColumn]);

  return { data, loading, error };
}
