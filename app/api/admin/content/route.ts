import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "../../../../lib/content";
import { adminUser } from "../../../../lib/supabase/server";
import type { CmsBlock, SiteContent } from "../../../site-data";
import { normalizeDesign } from "../../../../lib/design";
import { blockAlignments, blockTones, blockWidths } from "../../../../lib/cms-layout";

const blockTypes = new Set(["heading", "text", "image", "cta"]);
const widths = new Set<string>(blockWidths);
const alignments = new Set<string>(blockAlignments);
const tones = new Set<string>(blockTones);

function validBlock(block: CmsBlock) {
  return Boolean(
    block &&
      typeof block.id === "string" &&
      blockTypes.has(block.type) &&
      (block.hidden === undefined || typeof block.hidden === "boolean") &&
      (block.deleted === undefined || typeof block.deleted === "boolean") &&
      (block.width === undefined || widths.has(block.width)) &&
      (block.align === undefined || alignments.has(block.align)) &&
      (block.tone === undefined || tones.has(block.tone)),
  );
}
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
    if (c.design !== undefined && (typeof c.design !== 'object' || c.design === null || Array.isArray(c.design))) return NextResponse.json({error:'Харагдах байдлын мэдээлэл буруу.'},{status:400});
    if (
      c.pages.some(
        (page) =>
          typeof page.id !== "string" ||
          typeof page.slug !== "string" ||
          !Array.isArray(page.blocks) ||
          page.blocks.some((block) => !validBlock(block)) ||
          (page.deleted !== undefined && typeof page.deleted !== "boolean"),
      )
    )
      return NextResponse.json({ error: "Хуудас эсвэл секцийн мэдээлэл буруу." }, { status: 400 });
    const activeSlugs = c.pages.filter((page) => !page.deleted).map((page) => page.slug);
    if (activeSlugs.some((slug) => !slug) || new Set(activeSlugs).size !== activeSlugs.length)
      return NextResponse.json(
        { error: "Хуудас бүр давхцахгүй URL slug-тэй байх ёстой." },
        { status: 400 },
      );
    await saveSiteContent({ ...c, design: normalizeDesign(c.design) }, user.email!);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Мэдээллийг хадгалж чадсангүй." }, { status: 400 }); }
}
