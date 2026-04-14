import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

export async function POST(request: NextRequest) {
  try {
    // Auth: allow cron calls with service-role secret, or authenticated users
    const cronSecret = request.headers.get("x-cron-secret");
    if (cronSecret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const authSupabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authSupabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 503 }
      );
    }

    const supabase = getServiceSupabase();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    // Gather data in parallel
    const [mkt, crm, alerts, sales] = await Promise.all([
      supabase
        .from("marketing_daily")
        .select("*")
        .gte("date", weekAgo)
        .lte("date", yesterday),
      supabase
        .from("crm_daily")
        .select("*")
        .gte("date", weekAgo)
        .lte("date", yesterday),
      supabase
        .from("ci_alerts")
        .select("*")
        .gte("created_at", weekAgo)
        .order("severity"),
      supabase
        .from("sales_weekly")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(30),
    ]);

    const snapshot = {
      marketing: mkt.data || [],
      crm: crm.data || [],
      alerts: alerts.data || [],
      sales: sales.data || [],
    };

    // Generate the brief with AI
    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are composing a CEO morning brief email for Carisma Wellness Group. Write a professional, scannable email body in HTML format.

Structure:
1. Opening: "Good morning, Mert. Here's your Carisma Intelligence brief for [date]."
2. Key Numbers: 3-4 most important metrics in a simple HTML table
3. Wins: 1-2 positive highlights
4. Attention Needed: 1-2 items requiring action
5. Sign-off: "\u2014 Carisma Intelligence"

Style: Clean HTML with inline styles. Use gold (#B8943E) for headers. Keep it under 300 words. Be specific with numbers. If the data arrays are empty, note that no data was available for the period and suggest checking data pipelines.`,
      messages: [
        {
          role: "user",
          content: `Generate the morning brief for ${yesterday}.\n\nData:\n${JSON.stringify(snapshot, null, 2)}`,
        },
      ],
    });

    const briefHtml = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    const formattedDate = new Date(yesterday).toLocaleDateString("en-GB", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    return NextResponse.json({
      subject: `Carisma Morning Brief \u2014 ${formattedDate}`,
      body: briefHtml,
      to: "mert@carismawellness.com",
    });
  } catch (err) {
    console.error("Brief generation failed:", err);
    return NextResponse.json({ error: "Brief generation failed" }, { status: 500 });
  }
}
