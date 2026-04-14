"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface ExecutiveSummaryProps {
  department: string;
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}

export function ExecutiveSummary({
  department,
  dateFrom,
  dateTo,
  brandFilter,
}: ExecutiveSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ci/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate a brief executive summary for the ${department} department from ${dateFrom.toISOString()} to ${dateTo.toISOString()}${brandFilter ? ` for brand: ${brandFilter}` : ""}.`,
        }),
      });
      const data = await res.json();
      setSummary(data.reply || data.message || "No summary available.");
    } catch {
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          Executive Summary
        </CardTitle>
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-gold hover:bg-gold-dark text-white"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Summary"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {summary ? (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Click Generate to create an AI-powered executive summary
          </p>
        )}
      </CardContent>
    </Card>
  );
}
