import { NextRequest, NextResponse } from "next/server";
import { ZohoBooksClient } from "@/lib/etl/zoho-client";
import { loadHqCoaMap, runHqEbitdaMonth } from "@/lib/etl/hq-ebitda";
import { ETLLogger } from "@/lib/etl/etl-logger";

// GET — diagnostic: checks tag discovery and returns raw Zoho tag data
export async function GET() {
  try {
    const client = new ZohoBooksClient("spa");
    const list = await client.get("settings/tags", {}).catch((e: unknown) => ({ error: String(e) })) as Record<string, unknown>;
    const groups = ((list.reporting_tags ?? list.tags ?? []) as Array<{ tag_id: string; tag_options?: string }>);
    const group  = groups.find(t => (t.tag_options ?? "").split(",").map(s => s.trim().toLowerCase()).includes("hq"));
    let detail: unknown = null;
    if (group) {
      detail = await client.get(`settings/tags/${group.tag_id}`, {}).catch((e: unknown) => ({ error: String(e) }));
    }
    // Step 3: test P&L filter with HQ option ID
    let plTest: unknown = null;
    const hqOptionId = (detail as { reporting_tag?: { tag_options?: Array<{ tag_option_id: string; tag_option_name: string }> } })
      ?.reporting_tag?.tag_options?.find(o => o.tag_option_name.toLowerCase() === "hq")?.tag_option_id ?? null;
    if (hqOptionId) {
      const now = new Date();
      const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, "0");
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      plTest = await client.get("reports/profitandloss", {
        from_date: `${y}-${m}-01`, to_date: `${y}-${m}-${last}`,
        cash_based: "false", tag_id: hqOptionId, tag_option_id: hqOptionId,
      }).catch((e: unknown) => ({ error: String(e) }));
    }
    return NextResponse.json({ hq_option_id: hqOptionId, hq_group: group ?? null, detail, pl_test: plTest });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

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

  const logger = new ETLLogger("zoho_hq_ebitda");
  await logger.start();
  const log: string[] = [];
  let totalRows = 0;

  try {
    // HQ accounts live in the SPA Zoho org (same org as Carisma Spas)
    const client = new ZohoBooksClient("spa");

    log.push("Loading HQ CoA mapping…");
    let coaMap: Record<string, string> = {};
    try {
      coaMap = await loadHqCoaMap();
      log.push(`Loaded ${Object.keys(coaMap).length} SPA accounts with EBITDA lines.`);
    } catch (e) {
      log.push(`Warning: failed to load CoA (${e}) — will use section-based fallback.`);
    }

    const fromD = new Date(dateFrom);
    const toD   = new Date(dateTo);
    let d = new Date(fromD.getFullYear(), fromD.getMonth(), 1);
    while (d <= toD) {
      const y = d.getFullYear(), m = d.getMonth() + 1;
      const isFirst = y === fromD.getFullYear() && m === fromD.getMonth() + 1;
      const isLast  = y === toD  .getFullYear() && m === toD  .getMonth() + 1;
      const result = await runHqEbitdaMonth(client, y, m, {
        force,
        coaMap,
        fromDateOverride: isFirst ? dateFrom : undefined,
        toDateOverride:   isLast  ? dateTo   : undefined,
      });
      totalRows += result.rowsUpserted;
      log.push(...result.log);
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }

    await logger.complete(totalRows);
    log.push(`Done — ${totalRows} rows upserted.`);
    return NextResponse.json({ status: "ok", rows_upserted: totalRows, log: log.join("\n") });
  } catch (e) {
    const msg = String(e);
    await logger.fail(msg);
    return NextResponse.json({ error: msg, log: log.join("\n") }, { status: 500 });
  }
}
