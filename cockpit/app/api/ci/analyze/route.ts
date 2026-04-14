import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface AlertPayload {
  department: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  metric: string;
  value: number;
  target?: number;
  deviation_pct?: number;
}

// KPI targets — keep in sync with CI chat SYSTEM_PROMPT
const TARGETS: Record<
  string,
  { target: number; direction: "below" | "above"; department: string; label: string }
> = {
  spa_cpl: { target: 8, direction: "below", department: "Marketing", label: "Spa CPL" },
  aes_cpl: { target: 12, direction: "below", department: "Marketing", label: "Aesthetics CPL" },
  slim_cpl: { target: 10, direction: "below", department: "Marketing", label: "Slimming CPL" },
  roas: { target: 5.0, direction: "above", department: "Marketing", label: "ROAS" },
  conversion_rate: { target: 25, direction: "above", department: "Sales", label: "Conversion Rate" },
  hc_pct: { target: 40, direction: "below", department: "HR", label: "HC%" },
  utilization: { target: 75, direction: "above", department: "HR", label: "Utilization" },
  speed_to_lead: { target: 5, direction: "below", department: "Sales", label: "Speed to Lead" },
};

export async function POST(request: NextRequest) {
  try {
    // Auth: allow cron calls with service-role secret, or authenticated users
    const cronSecret = request.headers.get("x-cron-secret");
    if (cronSecret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const authSupabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authSupabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = getServiceSupabase();
    const alerts: AlertPayload[] = [];
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    // ── 1. Marketing CPL by brand (last 7 days) ────────────────────────
    const { data: mktData } = await supabase
      .from("marketing_daily")
      .select("brand_id, spend, leads, cpl, roas")
      .gte("date", weekAgo)
      .lte("date", today);

    if (mktData && mktData.length > 0) {
      const brandAgg: Record<number, { spend: number; leads: number }> = {};
      for (const row of mktData) {
        if (!brandAgg[row.brand_id]) brandAgg[row.brand_id] = { spend: 0, leads: 0 };
        brandAgg[row.brand_id].spend += row.spend || 0;
        brandAgg[row.brand_id].leads += row.leads || 0;
      }

      const brandTargetMap: Record<number, { key: string; target: number }> = {
        1: { key: "spa_cpl", target: TARGETS.spa_cpl.target },
        2: { key: "aes_cpl", target: TARGETS.aes_cpl.target },
        3: { key: "slim_cpl", target: TARGETS.slim_cpl.target },
      };

      for (const [bid, agg] of Object.entries(brandAgg)) {
        const brandId = parseInt(bid);
        const config = brandTargetMap[brandId];
        if (!config || agg.leads === 0) continue;
        const cpl = agg.spend / agg.leads;
        const deviation = ((cpl - config.target) / config.target) * 100;

        if (deviation > 10) {
          alerts.push({
            department: "Marketing",
            severity: deviation > 25 ? "critical" : "warning",
            title: `${TARGETS[config.key].label} above target`,
            description: `${TARGETS[config.key].label} is \u20AC${cpl.toFixed(2)} (target: \u20AC${config.target}). ${deviation.toFixed(0)}% above target over the last 7 days.`,
            metric: config.key,
            value: cpl,
            target: config.target,
            deviation_pct: deviation,
          });
        }
      }

      // ROAS check
      const roasValues = mktData.filter((r) => r.roas != null && r.roas > 0);
      if (roasValues.length > 0) {
        const avgRoas = roasValues.reduce((s, r) => s + (r.roas || 0), 0) / roasValues.length;
        if (avgRoas < TARGETS.roas.target) {
          const deviation = ((TARGETS.roas.target - avgRoas) / TARGETS.roas.target) * 100;
          if (deviation > 10) {
            alerts.push({
              department: "Marketing",
              severity: deviation > 20 ? "critical" : "warning",
              title: "ROAS below target",
              description: `Blended ROAS is ${avgRoas.toFixed(1)}x (target: ${TARGETS.roas.target}x). ${deviation.toFixed(0)}% below target.`,
              metric: "roas",
              value: avgRoas,
              target: TARGETS.roas.target,
              deviation_pct: -deviation,
            });
          }
        }
      }
    }

    // ── 2. CRM metrics (last 7 days) ──────────────────────────────────
    const { data: crmData } = await supabase
      .from("crm_daily")
      .select("speed_to_lead_median_min, conversion_rate_pct")
      .gte("date", weekAgo)
      .lte("date", today);

    if (crmData && crmData.length > 0) {
      const stlValues = crmData.filter((r) => r.speed_to_lead_median_min != null);
      const convValues = crmData.filter((r) => r.conversion_rate_pct != null);

      if (stlValues.length > 0) {
        const avgStl =
          stlValues.reduce((s, r) => s + (r.speed_to_lead_median_min || 0), 0) / stlValues.length;
        const deviation =
          ((avgStl - TARGETS.speed_to_lead.target) / TARGETS.speed_to_lead.target) * 100;
        if (deviation > 10) {
          alerts.push({
            department: "Sales",
            severity: deviation > 30 ? "critical" : "warning",
            title: "Speed to Lead above target",
            description: `Median speed to lead is ${avgStl.toFixed(1)} min (target: ${TARGETS.speed_to_lead.target} min). Leads are waiting ${deviation.toFixed(0)}% longer than target.`,
            metric: "speed_to_lead",
            value: avgStl,
            target: TARGETS.speed_to_lead.target,
            deviation_pct: deviation,
          });
        }
      }

      if (convValues.length > 0) {
        const avgConv =
          convValues.reduce((s, r) => s + (r.conversion_rate_pct || 0), 0) / convValues.length;
        if (avgConv < TARGETS.conversion_rate.target) {
          const deviation =
            ((TARGETS.conversion_rate.target - avgConv) / TARGETS.conversion_rate.target) * 100;
          if (deviation > 10) {
            alerts.push({
              department: "Sales",
              severity: deviation > 20 ? "critical" : "warning",
              title: "Conversion rate below target",
              description: `Conversion rate is ${avgConv.toFixed(1)}% (target: ${TARGETS.conversion_rate.target}%). ${deviation.toFixed(0)}% below target.`,
              metric: "conversion_rate",
              value: avgConv,
              target: TARGETS.conversion_rate.target,
              deviation_pct: -deviation,
            });
          }
        }
      }
    }

    // ── 3. HR metrics (latest weeks) ──────────────────────────────────
    const { data: hrData } = await supabase
      .from("hr_weekly")
      .select("hc_pct, utilization_pct")
      .order("week_start", { ascending: false })
      .limit(20);

    if (hrData && hrData.length > 0) {
      const hcValues = hrData.filter((r) => r.hc_pct != null);
      const utilValues = hrData.filter((r) => r.utilization_pct != null);

      if (hcValues.length > 0) {
        const avgHc = hcValues.reduce((s, r) => s + (r.hc_pct || 0), 0) / hcValues.length;
        if (avgHc > TARGETS.hc_pct.target) {
          const deviation = ((avgHc - TARGETS.hc_pct.target) / TARGETS.hc_pct.target) * 100;
          if (deviation > 5) {
            alerts.push({
              department: "HR",
              severity: deviation > 15 ? "critical" : "warning",
              title: "HC% above threshold",
              description: `Average HC% is ${avgHc.toFixed(1)}% (target: <${TARGETS.hc_pct.target}%). Human cost is ${deviation.toFixed(0)}% above the threshold.`,
              metric: "hc_pct",
              value: avgHc,
              target: TARGETS.hc_pct.target,
              deviation_pct: deviation,
            });
          }
        }
      }

      if (utilValues.length > 0) {
        const avgUtil =
          utilValues.reduce((s, r) => s + (r.utilization_pct || 0), 0) / utilValues.length;
        if (avgUtil < TARGETS.utilization.target) {
          const deviation =
            ((TARGETS.utilization.target - avgUtil) / TARGETS.utilization.target) * 100;
          if (deviation > 5) {
            alerts.push({
              department: "HR",
              severity: deviation > 15 ? "critical" : "warning",
              title: "Utilization below target",
              description: `Average utilization is ${avgUtil.toFixed(1)}% (target: >${TARGETS.utilization.target}%). Therapists are ${deviation.toFixed(0)}% underutilized.`,
              metric: "utilization",
              value: avgUtil,
              target: TARGETS.utilization.target,
              deviation_pct: -deviation,
            });
          }
        }
      }
    }

    // ── 4. Revenue growth (positive alerts / wins) ────────────────────
    const { data: recentSales } = await supabase
      .from("sales_weekly")
      .select("week_start, revenue_ex_vat")
      .order("week_start", { ascending: false })
      .limit(40);

    if (recentSales && recentSales.length > 0) {
      const weekMap = new Map<string, number>();
      for (const row of recentSales) {
        weekMap.set(
          row.week_start,
          (weekMap.get(row.week_start) || 0) + (row.revenue_ex_vat || 0)
        );
      }
      const weeks = Array.from(weekMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
      if (weeks.length >= 2) {
        const [thisWeek, lastWeek] = weeks;
        if (lastWeek[1] > 0) {
          const growth = ((thisWeek[1] - lastWeek[1]) / lastWeek[1]) * 100;
          if (growth > 5) {
            alerts.push({
              department: "Finance",
              severity: "info",
              title: "Revenue growing",
              description: `Total revenue grew ${growth.toFixed(1)}% WoW (\u20AC${thisWeek[1].toLocaleString()} vs \u20AC${lastWeek[1].toLocaleString()}).`,
              metric: "revenue_growth",
              value: growth,
            });
          }
        }
      }
    }

    // ── 5. Insert alerts into ci_alerts table ─────────────────────────
    if (alerts.length > 0) {
      const rows = alerts.map((a) => ({
        department: a.department,
        severity: a.severity,
        title: a.title,
        description: a.description,
        recommendation: a.description,
        status: "pending",
        created_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase.from("ci_alerts").insert(rows);
      if (insertError) {
        console.error("Failed to insert alerts:", insertError);
      }
    }

    return NextResponse.json({
      alerts_generated: alerts.length,
      alerts,
    });
  } catch (err) {
    console.error("Analysis failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
