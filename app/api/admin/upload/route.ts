import { NextResponse } from "next/server";
import { adminUser, serverClient } from "../../../../lib/supabase/server";
export async function POST(r: Request) {
  if (!await adminUser()) return NextResponse.json({ error: "Админы эрхгүй." }, { status: 403 });
  const f = (await r.formData()).get("file");
  const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  if (!(f instanceof File) || !types[f.type] || f.size > 4e6) return NextResponse.json({ error: "4MB-аас бага JPG, PNG, WebP эсвэл GIF зураг сонгоно уу." }, { status: 400 });
  const key = `coaches/${crypto.randomUUID()}.${types[f.type]}`;
  const client = await serverClient();
  const { error } = await client.storage.from("site-media").upload(key, await f.arrayBuffer(), { contentType: f.type });
  if (error) return NextResponse.json({ error: "Зураг хадгалж чадсангүй." }, { status: 500 });
  return NextResponse.json({ url: client.storage.from("site-media").getPublicUrl(key).data.publicUrl });
}
