import { NextRequest, NextResponse } from "next/server";
import { runLapisRevenue } from "@/lib/etl/lapis-revenue";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let dateFrom: string, dateTo: string, force = false;
  try {
    const body = await req.json();
    dateFrom = body.date_from;
    dateTo   = body.date_to;
    force    = body.force === true;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 });
  }

  try {
    const result = await runLapisRevenue(dateFrom, dateTo, force);
    return NextResponse.json({ status: "ok", rows_upserted: result.rowsUpserted, log: result.log.join("\n") });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
