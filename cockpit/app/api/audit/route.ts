import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, page, details } = await request.json();

    await supabase.from("audit_log").insert({
      user_id: user.id,
      action,
      page,
      details: details || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ logs: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
