import { KPICard } from "./KPICard";
import { FreshnessIndicator } from "./FreshnessIndicator";

export interface KPIData {
  label: string;
  value: string;
  trend?: number;
  trendMoM?: number;
  target?: string;
  targetValue?: number;
  currentValue?: number;
  sparkline?: number[];
  lowerIsBetter?: boolean;
}

interface KPICardRowProps {
  kpis: KPIData[];
  lastUpdated?: Date | null;
}

export function KPICardRow({ kpis, lastUpdated }: KPICardRowProps) {
  return (
    <div>
      {lastUpdated !== undefined && (
        <div className="flex justify-end mb-1">
          <FreshnessIndicator lastUpdated={lastUpdated} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>
    </div>
  );
}
