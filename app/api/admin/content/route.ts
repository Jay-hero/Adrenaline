import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "../../../../lib/content";
import { adminUser } from "../../../../lib/supabase/server";
import type { SiteContent } from "../../../site-data";
export async function GET() {
  if (!await adminUser()) return NextResponse.json({ error: "Админы эрхгүй." }, { status: 403 });
  return NextResponse.json(await getSiteContent(), { headers: { "Cache-Control": "private, no-store" } });
}
export async function PUT(r: Request) {
  const user = await adminUser();
  if (!user) return NextResponse.json({ error: "Админы эрхгүй." }, { status: 403 });
  try {
    const c = await r.json() as SiteContent;
    if (!c?.home || !c.siteInfo || !Array.isArray(c.membershipPlans) || !Array.isArray(c.coaches) || !Array.isArray(c.schedule) || !Array.isArray(c.pages)) return NextResponse.json({ error: "Мэдээлэл буруу." }, { status: 400 });
    await saveSiteContent(c, user.email!);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Мэдээллийг хадгалж чадсангүй." }, { status: 400 }); }
}
