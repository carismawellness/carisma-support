"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ConstraintHeatmap } from "@/components/funnel/ConstraintHeatmap";
import { BrandFunnelCard } from "@/components/funnel/BrandFunnelCard";
import { CampaignFunnelPanel } from "@/components/funnel/CampaignFunnelPanel";
import { CIChat } from "@/components/ci/CIChat";
import { formatDateRangeLabel } from "@/lib/utils/mock-date-filter";

const BRANDS = ["spa", "aesthetics", "slimming"] as const;

function FunnelContent({
  dateFrom,
  dateTo,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  return (
    <>
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Funnel Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {formatDateRangeLabel(dateFrom, dateTo)} · Full-funnel constraint analysis
        </p>
      </div>

      {/* 1. Constraint Heatmap — conclusion first */}
      <section>
        <ConstraintHeatmap />
      </section>

      {/* 2. Brand Funnel Overview — all 3 brands side by side */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Brand Funnels</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {BRANDS.map((brand) => (
            <BrandFunnelCard key={brand} brand={brand} dateFrom={dateFrom} dateTo={dateTo} />
          ))}
        </div>
      </section>

      {/* 3. Campaign Drill-Down — tabbed by brand */}
      <section>
        <CampaignFunnelPanel />
      </section>

      <CIChat />
    </>
  );
}

export default function FunnelPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <FunnelContent dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />
      )}
    </DashboardShell>
  );
}
