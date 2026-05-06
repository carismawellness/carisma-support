import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PILLARS } from "@/lib/pillars";
import { ArrowUpRight } from "lucide-react";
import { whoopSeed } from "@/lib/seed/health/whoop";
import { personalCapitalSeed } from "@/lib/seed/wealth/personal-capital";
import { innerCircleSeed } from "@/lib/seed/love/inner-circle";

type Headline = { metric: string; value: string; trend: string };

function getPillarHeadlines(): Record<string, Headline> {
  const recoveryToday = whoopSeed.today.recovery;
  const avg30 = Math.round(
    whoopSeed.last30Days.reduce((sum, d) => sum + d.recovery, 0) / whoopSeed.last30Days.length
  );

  const touchedLast30 = innerCircleSeed.filter((c) => c.lastContactDays <= 30).length;
  const overdueCount = innerCircleSeed.filter((c) => c.lastContactDays > c.cadenceDays).length;

  return {
    health: {
      metric: "Recovery (today)",
      value: `${recoveryToday}%`,
      trend: `30d avg ${avg30}%`,
    },
    wealth: {
      metric: "Years of Freedom",
      value: `${personalCapitalSeed.yearsOfFreedom} yrs`,
      trend: "▲ 0.4 vs YE 2025",
    },
    love: {
      metric: "Touched in last 30d",
      value: `${touchedLast30} of ${innerCircleSeed.length}`,
      trend: `${overdueCount} owed a touch`,
    },
  };
}

function getHealthDecision(recovery: number): string {
  if (recovery >= 67) return `Recovery ${recovery}% — green light for planned strength session`;
  if (recovery >= 34) return `Recovery ${recovery}% — swap planned strength for zone 2 cardio`;
  return `Recovery ${recovery}% — rest day, prioritise sleep tonight`;
}

function getMostOverdueContact() {
  return [...innerCircleSeed]
    .map((c) => ({ ...c, ratio: c.lastContactDays / c.cadenceDays }))
    .sort((a, b) => b.ratio - a.ratio)[0];
}

const PILLAR_DOT: Record<string, string> = {
  health: "bg-emerald-500",
  wealth: "bg-slate-600",
  love: "bg-pink-500",
};

export default function HomePage() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const headlines = getPillarHeadlines();
  const recoveryToday = whoopSeed.today.recovery;
  const healthDecision = getHealthDecision(recoveryToday);
  const overdue = getMostOverdueContact();
  const loveNudge = `${overdue.name} overdue ${overdue.lastContactDays}d (target every ${overdue.cadenceDays}d) — book a call`;
  const wealthNudge = `Personal capital up 0.4 yrs of freedom (now ${personalCapitalSeed.yearsOfFreedom}yrs) — keep current burn`;

  const nudges: { pillarId: string; text: string }[] = [
    { pillarId: "health", text: healthDecision },
    { pillarId: "wealth", text: wealthNudge },
    { pillarId: "love", text: loveNudge },
  ];

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Today</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          One number per pillar
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PILLARS.map((p) => {
          const head = headlines[p.id];
          return (
            <Link key={p.id} href={`/${p.id}`} className="group">
              <Card className={`p-6 border-2 ${p.borderClass} ${p.bgClass} transition-shadow hover:shadow-md`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className={`text-sm font-medium uppercase tracking-wider ${p.colorClass}`}>
                      {p.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.tagline}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{head.metric}</div>
                  <div className="text-3xl font-bold text-foreground">{head.value}</div>
                  <div className="text-xs text-muted-foreground">{head.trend}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  {p.modules.length} modules
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          One decision today
        </h2>
        <Card className="p-6">
          <p className="text-base">{healthDecision}.</p>
          <p className="text-xs text-muted-foreground mt-2">
            Based on Health · WHOOP Live · last 7 days
          </p>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Three nudges
        </h2>
        <Card className="divide-y divide-border p-0 overflow-hidden">
          {nudges.map((n) => {
            const pillar = PILLARS.find((p) => p.id === n.pillarId)!;
            return (
              <Link
                key={n.pillarId}
                href={`/${pillar.id}`}
                className="flex items-center gap-3 px-4 sm:px-6 py-4 group hover:bg-accent/40 transition-colors"
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${PILLAR_DOT[n.pillarId]}`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${pillar.colorClass}`}>
                  {pillar.name}
                </span>
                <span className="text-sm flex-1 truncate">{n.text}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            );
          })}
        </Card>
      </div>
    </>
  );
}
