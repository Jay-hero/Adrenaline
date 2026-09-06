import { defaultContent, type SiteContent } from "../app/site-data";
import { publicClient, serverClient } from "./supabase/server";

// Preserve defaults added after an older version of the content was saved.
function mergeDefaults(defaults: unknown, saved: unknown): unknown {
  if (saved === undefined || saved === null) return defaults;
  if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : defaults;
  if (typeof defaults !== "object" || defaults === null) return saved;
  if (typeof saved !== "object" || Array.isArray(saved)) return defaults;
  const result: Record<string, unknown> = { ...saved as Record<string, unknown> };
  for (const [key, value] of Object.entries(defaults)) {
    result[key] = mergeDefaults(value, (saved as Record<string, unknown>)[key]);
  }
  return result;
}
export async function getSiteContent(): Promise<SiteContent> {
  const { data, error } = await publicClient().from("site_content").select("content_json").eq("id", 1).maybeSingle();
  if (error) throw new Error("Сайтын мэдээллийг ачаалж чадсангүй.");
  return mergeDefaults(defaultContent, data?.content_json) as SiteContent;
}
export async function saveSiteContent(content: SiteContent, email: string) {
  const client = await serverClient();
  const { error } = await client.from("site_content").upsert({ id: 1, content_json: content, updated_at: new Date().toISOString(), updated_by: email });
  if (error) throw new Error("Мэдээллийг хадгалж чадсангүй.");
}
