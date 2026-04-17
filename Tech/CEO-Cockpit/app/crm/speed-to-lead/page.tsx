"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SpeedToLeadSection } from "@/components/crm/SpeedToLeadSection";
import { CIChat } from "@/components/ci/CIChat";

export default function SpeedToLeadPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <SpeedToLeadSection
            dateFrom={dateFrom}
            dateTo={dateTo}
            brandFilter={brandFilter}
          />
          <CIChat />
        </>
      )}
    </DashboardShell>
  );
}
