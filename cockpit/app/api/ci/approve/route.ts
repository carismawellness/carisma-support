import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { alert_id, action } = await request.json();

  if (!alert_id || !["approve", "dismiss"].includes(action)) {
    return NextResponse.json(
      { error: "alert_id and action (approve|dismiss) required" },
      { status: 400 }
    );
  }

  const newStatus = action === "approve" ? "approved" : "dismissed";
  const updates: Record<string, unknown> = { status: newStatus };
  if (action === "approve") {
    updates.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("ci_alerts")
    .update(updates)
    .eq("id", alert_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alert: data });
}
