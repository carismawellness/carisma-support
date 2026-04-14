import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const SUMMARY_PROMPT = `You are the AI analyst for Carisma Wellness Group's CEO dashboard. Given the following KPI data snapshot, write a 3-5 sentence executive summary.

Rules:
- Lead with the most important insight (good or bad)
- Reference specific numbers and % changes
- Compare against targets where available (Spa CPL <€8, Aes CPL <€12, Slim CPL <$10, ROAS >5.0, Conversion >25%, HC% <40%, Utilization >75%, Speed to Lead <5min)
- Flag any metric that's significantly off-target (>10% deviation)
- End with one actionable recommendation
- Be concise, authoritative, and specific
- Do NOT use bullet points — write flowing prose
- Format numbers with € for currency`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 503 }
      );
    }

    const authSupabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { page, dateFrom, dateTo, brandFilter, kpiSnapshot } =
      await request.json();

    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: SUMMARY_PROMPT,
      messages: [
        {
          role: "user",
          content: `Dashboard: ${page}\nDate range: ${dateFrom} to ${dateTo}\nBrand filter: ${brandFilter || "All brands"}\n\nKPI Data:\n${JSON.stringify(kpiSnapshot, null, 2)}`,
        },
      ],
    });

    const summary = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json(
      { error: "Summary generation failed" },
      { status: 500 }
    );
  }
}
