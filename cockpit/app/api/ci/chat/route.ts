import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Anthropic client
// ---------------------------------------------------------------------------

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

// ---------------------------------------------------------------------------
// Brand slug → id mapping (will move to DB lookup in Task 3)
// ---------------------------------------------------------------------------

const BRAND_IDS: Record<string, number> = {
  spa: 1,
  aesthetics: 2,
  slimming: 3,
};

function brandId(slug: string | undefined): number | undefined {
  if (!slug) return undefined;
  return BRAND_IDS[slug.toLowerCase()];
}

// ---------------------------------------------------------------------------
// System prompt — no longer asks for SQL; describes available tools instead
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are Carisma Intelligence (CI), the AI analytics assistant for Carisma Wellness Group.
You have access to the company's business data across three brands (Spa, Aesthetics, Slimming) and five departments (Marketing, Sales/CRM, Finance, HR, Operations).

Use the provided tools to retrieve data before answering. You may call multiple tools in a single turn if needed.

Brand slugs: "spa", "aesthetics", "slimming".

KPI Targets:
- Spa CPL < EUR 8, Aesthetics CPL < EUR 12, Slimming CPL < USD 10
- ROAS > 5.0, Conversion > 25%, HC% < 40%, Utilization > 75%, Speed to Lead < 5 min

Always be specific with numbers. Reference targets when relevant. Be concise but thorough.`;

// ---------------------------------------------------------------------------
// Tool definitions (Anthropic tool-use JSON schema)
// ---------------------------------------------------------------------------

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "query_revenue",
    description:
      "Query revenue data by brand, location, and/or week from the sales_weekly table.",
    input_schema: {
      type: "object" as const,
      properties: {
        brand_slug: {
          type: "string",
          enum: ["spa", "aesthetics", "slimming"],
          description: "Filter by brand slug. Omit for all brands.",
        },
        location_id: {
          type: "number",
          description: "Filter by location ID. Omit for all locations.",
        },
        date_from: {
          type: "string",
          description: "Start date inclusive (YYYY-MM-DD).",
        },
        date_to: {
          type: "string",
          description: "End date inclusive (YYYY-MM-DD).",
        },
        group_by: {
          type: "string",
          enum: ["week", "location", "brand"],
          description: "How to group the results. Default: week.",
        },
      },
      required: ["date_from", "date_to"],
    },
  },
  {
    name: "query_marketing",
    description:
      "Query marketing spend, CPL, and ROAS from the marketing_daily table.",
    input_schema: {
      type: "object" as const,
      properties: {
        brand_slug: {
          type: "string",
          enum: ["spa", "aesthetics", "slimming"],
          description: "Filter by brand slug. Omit for all brands.",
        },
        platform: {
          type: "string",
          description:
            "Filter by ad platform (e.g. meta, google). Omit for all.",
        },
        date_from: {
          type: "string",
          description: "Start date inclusive (YYYY-MM-DD).",
        },
        date_to: {
          type: "string",
          description: "End date inclusive (YYYY-MM-DD).",
        },
      },
      required: ["date_from", "date_to"],
    },
  },
  {
    name: "query_crm",
    description:
      "Query CRM data — speed to lead, conversion rate, calls — from crm_daily.",
    input_schema: {
      type: "object" as const,
      properties: {
        brand_slug: {
          type: "string",
          enum: ["spa", "aesthetics", "slimming"],
          description: "Filter by brand slug. Omit for all brands.",
        },
        date_from: {
          type: "string",
          description: "Start date inclusive (YYYY-MM-DD).",
        },
        date_to: {
          type: "string",
          description: "End date inclusive (YYYY-MM-DD).",
        },
      },
      required: ["date_from", "date_to"],
    },
  },
  {
    name: "query_hr",
    description:
      "Query HR data — HC%, utilization, headcount — from hr_weekly.",
    input_schema: {
      type: "object" as const,
      properties: {
        brand_slug: {
          type: "string",
          enum: ["spa", "aesthetics", "slimming"],
          description: "Filter by brand slug. Omit for all brands.",
        },
        location_id: {
          type: "number",
          description: "Filter by location ID. Omit for all locations.",
        },
        date_from: {
          type: "string",
          description: "Start date inclusive (YYYY-MM-DD).",
        },
        date_to: {
          type: "string",
          description: "End date inclusive (YYYY-MM-DD).",
        },
      },
      required: ["date_from", "date_to"],
    },
  },
  {
    name: "query_operations",
    description:
      "Query operations data — Google reviews, complaints — from operations_weekly.",
    input_schema: {
      type: "object" as const,
      properties: {
        location_id: {
          type: "number",
          description: "Filter by location ID. Omit for all locations.",
        },
        date_from: {
          type: "string",
          description: "Start date inclusive (YYYY-MM-DD).",
        },
        date_to: {
          type: "string",
          description: "End date inclusive (YYYY-MM-DD).",
        },
      },
      required: ["date_from", "date_to"],
    },
  },
  {
    name: "query_finance",
    description:
      "Query finance data — EBITDA, budget vs actual — from ebitda_monthly and budget_vs_actual.",
    input_schema: {
      type: "object" as const,
      properties: {
        brand_slug: {
          type: "string",
          enum: ["spa", "aesthetics", "slimming"],
          description: "Filter by brand slug. Omit for all brands.",
        },
        date_from: {
          type: "string",
          description: "Start month inclusive (YYYY-MM-DD, day is ignored).",
        },
        date_to: {
          type: "string",
          description: "End month inclusive (YYYY-MM-DD, day is ignored).",
        },
      },
      required: ["date_from", "date_to"],
    },
  },
  {
    name: "get_targets",
    description: "Load all KPI targets from the kpi_targets table.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_alerts",
    description: "Retrieve recent CI alerts from the ci_alerts table.",
    input_schema: {
      type: "object" as const,
      properties: {
        days: {
          type: "number",
          description: "Look-back window in days. Default 7.",
        },
        severity: {
          type: "string",
          enum: ["info", "warning", "critical"],
          description: "Filter by severity. Omit for all.",
        },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Tool executors — each runs a parameterized Supabase query (RLS-enforced)
// ---------------------------------------------------------------------------

interface ToolInput {
  brand_slug?: string;
  location_id?: number;
  date_from?: string;
  date_to?: string;
  group_by?: string;
  platform?: string;
  days?: number;
  severity?: string;
}

async function executeTool(
  name: string,
  input: ToolInput,
  supabase: SupabaseClient
): Promise<{ data: unknown; error: string | null }> {
  try {
    switch (name) {
      case "query_revenue":
        return await queryRevenue(input, supabase);
      case "query_marketing":
        return await queryMarketing(input, supabase);
      case "query_crm":
        return await queryCrm(input, supabase);
      case "query_hr":
        return await queryHr(input, supabase);
      case "query_operations":
        return await queryOperations(input, supabase);
      case "query_finance":
        return await queryFinance(input, supabase);
      case "get_targets":
        return await getTargets(supabase);
      case "get_alerts":
        return await getAlerts(input, supabase);
      default:
        return { data: null, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Tool execution failed",
    };
  }
}

async function queryRevenue(input: ToolInput, supabase: SupabaseClient) {
  let query = supabase
    .from("sales_weekly")
    .select(
      "week_start, location_id, brand_id, revenue_ex_vat, retail_pct, addon_pct, hotel_capture_pct"
    )
    .gte("week_start", input.date_from!)
    .lte("week_start", input.date_to!)
    .order("week_start", { ascending: true });

  const bid = brandId(input.brand_slug);
  if (bid) query = query.eq("brand_id", bid);
  if (input.location_id) query = query.eq("location_id", input.location_id);

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

async function queryMarketing(input: ToolInput, supabase: SupabaseClient) {
  let query = supabase
    .from("marketing_daily")
    .select("date, brand_id, platform, spend, leads, cpl, roas, ctr_pct")
    .gte("date", input.date_from!)
    .lte("date", input.date_to!)
    .order("date", { ascending: true });

  const bid = brandId(input.brand_slug);
  if (bid) query = query.eq("brand_id", bid);
  if (input.platform) query = query.eq("platform", input.platform);

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

async function queryCrm(input: ToolInput, supabase: SupabaseClient) {
  let query = supabase
    .from("crm_daily")
    .select(
      "date, brand_id, total_leads, leads_meta, leads_crm, speed_to_lead_median_min, conversion_rate_pct, total_calls, outbound_calls, appointments_booked"
    )
    .gte("date", input.date_from!)
    .lte("date", input.date_to!)
    .order("date", { ascending: true });

  const bid = brandId(input.brand_slug);
  if (bid) query = query.eq("brand_id", bid);

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

async function queryHr(input: ToolInput, supabase: SupabaseClient) {
  let query = supabase
    .from("hr_weekly")
    .select(
      "week_start, location_id, brand_id, hc_pct, utilization_pct, headcount"
    )
    .gte("week_start", input.date_from!)
    .lte("week_start", input.date_to!)
    .order("week_start", { ascending: true });

  const bid = brandId(input.brand_slug);
  if (bid) query = query.eq("brand_id", bid);
  if (input.location_id) query = query.eq("location_id", input.location_id);

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

async function queryOperations(input: ToolInput, supabase: SupabaseClient) {
  let query = supabase
    .from("operations_weekly")
    .select(
      "week_start, location_id, brand_id, google_reviews_avg, complaints_count"
    )
    .gte("week_start", input.date_from!)
    .lte("week_start", input.date_to!)
    .order("week_start", { ascending: true });

  if (input.location_id) query = query.eq("location_id", input.location_id);

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

async function queryFinance(input: ToolInput, supabase: SupabaseClient) {
  const bid = brandId(input.brand_slug);

  // EBITDA monthly
  let ebitdaQuery = supabase
    .from("ebitda_monthly")
    .select("month, brand_id, revenue, ebitda, ebitda_margin_pct")
    .gte("month", input.date_from!)
    .lte("month", input.date_to!)
    .order("month", { ascending: true });
  if (bid) ebitdaQuery = ebitdaQuery.eq("brand_id", bid);

  // Budget vs actual
  let budgetQuery = supabase
    .from("budget_vs_actual")
    .select("month, brand_id, department, budgeted, actual, variance_pct")
    .gte("month", input.date_from!)
    .lte("month", input.date_to!)
    .order("month", { ascending: true });
  if (bid) budgetQuery = budgetQuery.eq("brand_id", bid);

  const [ebitdaResult, budgetResult] = await Promise.all([
    ebitdaQuery,
    budgetQuery,
  ]);

  const error =
    ebitdaResult.error?.message ?? budgetResult.error?.message ?? null;
  return {
    data: { ebitda: ebitdaResult.data, budget_vs_actual: budgetResult.data },
    error,
  };
}

async function getTargets(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("kpi_targets")
    .select("*");
  return { data, error: error?.message ?? null };
}

async function getAlerts(input: ToolInput, supabase: SupabaseClient) {
  const days = input.days ?? 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  let query = supabase
    .from("ci_alerts")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (input.severity) query = query.eq("severity", input.severity);

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Conversation history helpers
// ---------------------------------------------------------------------------

async function loadHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<Anthropic.Messages.MessageParam[]> {
  const { data } = await supabase
    .from("ci_chat_history")
    .select("role, message")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!data || data.length === 0) return [];

  // Reverse so oldest-first
  const rows = data.reverse();
  return rows.map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.message,
  }));
}

async function saveMessage(
  supabase: SupabaseClient,
  userId: string,
  role: "user" | "assistant",
  message: string
) {
  await supabase.from("ci_chat_history").insert({
    user_id: userId,
    role,
    message,
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user via session cookie
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();

    // 2. Save user message & load conversation history in parallel
    const [, history] = await Promise.all([
      saveMessage(supabase, user.id, "user", message),
      loadHistory(supabase, user.id),
    ]);

    // 3. Build messages array: history + current user message
    const messages: Anthropic.Messages.MessageParam[] = [
      ...history,
      { role: "user", content: message },
    ];

    // 4. First Anthropic call — LLM decides which tools to call
    const anthropic = getAnthropicClient();
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    // 5. Tool-use loop: keep calling tools until the model emits end_turn
    const MAX_TOOL_ROUNDS = 5;
    let round = 0;

    while (response.stop_reason === "tool_use" && round < MAX_TOOL_ROUNDS) {
      round++;

      // Collect tool-use blocks from the response
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
      );

      // Execute each tool call in parallel
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const result = await executeTool(
            block.name,
            block.input as ToolInput,
            supabase
          );
          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: result.error
              ? JSON.stringify({ error: result.error })
              : JSON.stringify(result.data),
            is_error: !!result.error,
          };
        })
      );

      // Send tool results back to the model
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      });
    }

    // 6. Extract final text response
    const finalResponse = response.content
      .filter((c): c is Anthropic.Messages.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    // 7. Save assistant response
    await saveMessage(supabase, user.id, "assistant", finalResponse);

    return NextResponse.json({ message: finalResponse });
  } catch {
    return NextResponse.json(
      { error: "CI Chat failed" },
      { status: 500 }
    );
  }
}
