"use client";

import { useState } from "react";
import { startOfMonth } from "date-fns";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthPicker } from "@/components/brand-standards/MonthPicker";
import { LocationFilter } from "@/components/brand-standards/LocationFilter";
import { StandardTab } from "@/components/brand-standards/StandardTab";
import { TrendChart } from "@/components/brand-standards/TrendChart";
import { CIChat } from "@/components/ci/CIChat";

function BrandStandardsContent() {
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [location, setLocation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("facility");

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Brand Standards</h1>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <LocationFilter selected={location} onChange={setLocation} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-warm-gray">
          <TabsTrigger
            value="facility"
            className="data-[state=active]:bg-gold data-[state=active]:text-white"
          >
            Facility Standards
          </TabsTrigger>
          <TabsTrigger
            value="front_desk"
            className="data-[state=active]:bg-gold data-[state=active]:text-white"
          >
            Front Desk Standards
          </TabsTrigger>
          <TabsTrigger
            value="mystery_guest"
            className="data-[state=active]:bg-gold data-[state=active]:text-white"
          >
            Mystery Guest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facility" className="mt-6 space-y-6">
          <StandardTab standardType="facility" month={month} location={location} />
          <TrendChart standardType="facility" locationFilter={location} />
        </TabsContent>

        <TabsContent value="front_desk" className="mt-6 space-y-6">
          <StandardTab standardType="front_desk" month={month} location={location} />
          <TrendChart standardType="front_desk" locationFilter={location} />
        </TabsContent>

        <TabsContent value="mystery_guest" className="mt-6 space-y-6">
          <StandardTab standardType="mystery_guest" month={month} location={location} />
          <TrendChart standardType="mystery_guest" locationFilter={location} />
        </TabsContent>
      </Tabs>

      <CIChat />
    </>
  );
}

export default function BrandStandardsPage() {
  return (
    <DashboardShell>
      {() => <BrandStandardsContent />}
    </DashboardShell>
  );
}
