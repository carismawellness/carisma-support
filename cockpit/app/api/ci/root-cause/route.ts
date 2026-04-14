import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 503 });
    }

    const { metric, currentValue, target, department } = await request.json();

    // Gather context data from multiple tables
    const supabase = getServiceSupabase();
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];

    const [sales, crm, marketing, hr, ops] = await Promise.all([
      supabase.from("sales_weekly").select("*").gte("week_start", twoWeeksAgo).order("week_start"),
      supabase.from("crm_daily").select("*").gte("date", twoWeeksAgo).order("date"),
      supabase.from("marketing_daily").select("*").gte("date", twoWeeksAgo).order("date"),
      supabase.from("hr_weekly").select("*").gte("week_start", twoWeeksAgo).order("week_start"),
      supabase.from("operations_weekly").select("*").gte("week_start", twoWeeksAgo).order("week_start"),
    ]);

    const contextData = {
      sales: sales.data || [],
      crm: crm.data || [],
      marketing: marketing.data || [],
      hr: hr.data || [],
      operations: ops.data || [],
    };

    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are an expert business analyst for Carisma Wellness Group (3 brands: Spa, Aesthetics, Slimming; 10 locations).

When a KPI is off-target, you investigate root causes by analyzing cross-departmental data. Present your analysis as a causal chain:

Format:
1. **Observation**: State the problem metric and its deviation
2. **Primary Factor** (X% contribution): The biggest driver, with specific data
3. **Secondary Factor** (if any): Supporting cause
4. **Root Cause**: The underlying reason
5. **Recommendation**: One specific, actionable step

Rules:
- Be specific: name locations, brands, dates, exact numbers
- Attribution: quantify how much each factor contributes
- Look for correlations across departments (e.g., HR understaffing → lower utilization → lower revenue)
- Keep it under 200 words
- Don't speculate without data support`,
      messages: [{
        role: "user",
        content: `Investigate why "${metric}" is off-target.\n\nCurrent value: ${currentValue}\nTarget: ${target}\nDepartment: ${department}\n\nCross-departmental data (last 2 weeks):\n${JSON.stringify(contextData, null, 2)}`
      }],
    });

    const analysis = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
