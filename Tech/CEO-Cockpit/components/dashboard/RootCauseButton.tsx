"use client";

import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RootCauseButtonProps {
  metric: string;
  currentValue: number;
  target: number;
  department: string;
}

export function RootCauseButton({ metric, currentValue, target, department }: RootCauseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  // Only show the button if the metric is significantly off-target (>10%)
  const deviation = Math.abs((currentValue - target) / target) * 100;
  // Determine if the direction is bad
  // For some metrics lower is better (HC%, CPL, STL), for others higher is better
  // We'll just show the button if deviation > 10%
  if (deviation < 10) return null;

  async function investigate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ci/root-cause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric, currentValue, target, department }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={investigate}
        disabled={loading}
        className="inline-flex items-center gap-1 text-[10px] text-gold hover:text-gold-dark transition-colors mt-1"
        title="Investigate root cause"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        Why?
      </button>

      {analysis && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setAnalysis(null)}>
          <div className="bg-white dark:bg-[#162535] rounded-2xl shadow-2xl w-[550px] max-h-[70vh] overflow-hidden border border-warm-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-warm-border">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gold" />
                <h3 className="text-sm font-semibold text-charcoal">Root Cause Analysis: {metric}</h3>
              </div>
              <button onClick={() => setAnalysis(null)} className="text-text-secondary hover:text-charcoal">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[55vh]">
              <div className="prose prose-sm max-w-none text-charcoal whitespace-pre-wrap">
                {analysis}
              </div>
            </div>
            <div className="flex items-center justify-end px-5 py-3 border-t border-warm-border">
              <Button variant="ghost" size="sm" onClick={() => setAnalysis(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
