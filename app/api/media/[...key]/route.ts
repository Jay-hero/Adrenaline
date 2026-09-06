import { publicClient } from "../../../../lib/supabase/server";
export async function GET(_: Request, c: { params: Promise<{ key: string[] }> }) {
  const key = (await c.params).key.join("/");
  const { data, error } = await publicClient().storage.from("site-media").download(key);
  if (error || !data) return new Response("Not found", { status: 404 });
  return new Response(data, { headers: { "Content-Type": data.type, "Cache-Control": "public,max-age=31536000,immutable", "X-Content-Type-Options": "nosniff" } });
}
