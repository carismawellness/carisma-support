import { NextResponse } from "next/server";
import { ZohoBooksClient } from "@/lib/etl/zoho-client";

export const maxDuration = 30;

export async function GET() {
  try {
    const client = new ZohoBooksClient("spa");

    // Step 1: fetch all reporting tags
    let tagsData: unknown;
    let tagsError: string | null = null;
    try {
      tagsData = await client.get("settings/tags", {});
    } catch (e) {
      tagsError = String(e);
    }

    // Step 2: if tags found, try a P&L filtered by the HQ tag option ID
    let hqOptionId: string | null = null;
    let plTest: unknown = null;
    let plError: string | null = null;

    if (tagsData) {
      const tags = (tagsData as { tags?: Array<{ tag_id: string; tag_name: string; tag_options?: Array<{ tag_option_id: string; value: string }> }> }).tags ?? [];
      for (const tag of tags) {
        for (const opt of tag.tag_options ?? []) {
          if (opt.value.trim().toLowerCase() === "hq") {
            hqOptionId = opt.tag_option_id;
          }
        }
      }

      if (hqOptionId) {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        try {
          plTest = await client.get("reports/profitandloss", {
            from_date:  `${y}-${m}-01`,
            to_date:    `${y}-${m}-${String(new Date(y, today.getMonth() + 1, 0).getDate()).padStart(2, "0")}`,
            cash_based: "false",
            tag_id:     hqOptionId,
          });
        } catch (e) {
          // also try tag_option_id param name
          try {
            plTest = await client.get("reports/profitandloss", {
              from_date:     `${y}-${m}-01`,
              to_date:       `${y}-${m}-${String(new Date(y, today.getMonth() + 1, 0).getDate()).padStart(2, "0")}`,
              cash_based:    "false",
              tag_option_id: hqOptionId,
            });
          } catch (e2) {
            plError = `tag_id failed: ${e} | tag_option_id failed: ${e2}`;
          }
        }
      }
    }

    return NextResponse.json({
      tags_error:    tagsError,
      tags_raw:      tagsData,
      hq_option_id:  hqOptionId,
      pl_test:       plTest,
      pl_error:      plError,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
