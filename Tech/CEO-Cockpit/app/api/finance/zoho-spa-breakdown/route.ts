import { NextRequest, NextResponse } from "next/server";
import { ZohoBooksClient } from "@/lib/etl/zoho-client";
import { fetchZohoSpaBreakdown } from "@/lib/etl/zoho-spa-breakdown";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("date_from");
  const dateTo   = searchParams.get("date_to");

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 });
  }

  try {
    const client = new ZohoBooksClient("spa");
    const result = await fetchZohoSpaBreakdown(client, dateFrom, dateTo);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
