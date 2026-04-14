import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    let query = supabase.from("annotations").select("*").order("date", { ascending: true });
    if (page) query = query.eq("page", page);
    if (dateFrom) query = query.gte("date", dateFrom);
    if (dateTo) query = query.lte("date", dateTo);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ annotations: data });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date, page, title, note, color } = await request.json();

    const { data, error } = await supabase.from("annotations").insert({
      user_id: user.id,
      date,
      page,
      title,
      note: note || null,
      color: color || "gold",
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ annotation: data });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await supabase.from("annotations").delete().eq("id", id).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
