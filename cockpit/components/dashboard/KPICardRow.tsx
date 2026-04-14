import { KPICard } from "./KPICard";

export interface KPIData {
  label: string;
  value: string;
  trend?: number;
  target?: string;
  targetValue?: number;
  currentValue?: number;
  href?: string;
}

interface KPICardRowProps {
  kpis: KPIData[];
}

export function KPICardRow({ kpis }: KPICardRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
