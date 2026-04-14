"use client";

import { useState } from "react";
import { Mail, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MorningBriefButton() {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<{ subject: string; body: string } | null>(null);

  async function generateBrief() {
    setLoading(true);
    try {
      const res = await fetch("/api/ci/morning-brief", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setBrief({ subject: data.subject, body: data.body });
    } catch {
      // Silent fail — user sees button return to idle state
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={generateBrief}
        disabled={loading}
        className="text-xs text-text-secondary hover:text-gold gap-1"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Mail className="h-3 w-3" />
        )}
        Morning Brief
      </Button>

      {brief && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
          onClick={() => setBrief(null)}
        >
          <div
            className="bg-white dark:bg-[#162535] rounded-2xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden border border-warm-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-warm-border">
              <div>
                <h3 className="text-sm font-semibold text-charcoal">
                  Morning Brief Preview
                </h3>
                <p className="text-xs text-text-secondary">{brief.subject}</p>
              </div>
              <button
                onClick={() => setBrief(null)}
                className="text-text-secondary hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div
                dangerouslySetInnerHTML={{ __html: brief.body }}
                className="prose prose-sm max-w-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-warm-border">
              <Button variant="ghost" size="sm" onClick={() => setBrief(null)}>
                Close
              </Button>
              <Button
                size="sm"
                className="bg-gold hover:bg-gold-dark text-white"
                onClick={() => {
                  navigator.clipboard.writeText(
                    brief.body.replace(/<[^>]*>/g, "")
                  );
                  setBrief(null);
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
