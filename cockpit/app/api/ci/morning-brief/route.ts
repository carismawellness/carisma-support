import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/* ------------------------------------------------------------------ */
/* POST /api/ci/morning-brief                                          */
/* Generates a quick morning brief for the CEO dashboard.              */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    // ---- Auth: cron secret -------------------------------------------
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret =
      process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!cronSecret || cronSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pull yesterday's alerts
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split("T")[0];

    const { data: alerts } = await serviceSupabase
      .from("ci_alerts")
      .select("*")
      .gte("created_at", yDate)
      .order("severity", { ascending: true });

    const BRIEF_PROMPT = `You are Carisma Intelligence (CI). Generate a 3-sentence morning brief for the CEO.
Cover: (1) biggest win yesterday, (2) biggest risk, (3) one recommended action.

Yesterday's alerts:
${JSON.stringify(alerts || [], null, 2)}

If no alerts, say "All metrics within targets. No action needed."`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      messages: [{ role: "user", content: BRIEF_PROMPT }],
    });

    const brief = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    return NextResponse.json({ ok: true, brief });
  } catch (err) {
    console.error("[ci/morning-brief] error:", err);
    return NextResponse.json(
      { error: "Morning brief failed" },
      { status: 500 },
    );
  }
}
