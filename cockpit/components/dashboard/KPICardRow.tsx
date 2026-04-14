import { KPICard } from "./KPICard";

export interface KPIData {
  label: string;
  value: string;
  trend?: number;
  target?: string;
  targetValue?: number;
  currentValue?: number;
}

interface KPICardRowProps {
  kpis: KPIData[];
}

export function KPICardRow({ kpis }: KPICardRowProps) {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
