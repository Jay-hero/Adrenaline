import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseKey } from "./config";

export async function serverClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server components rely on proxy.ts for refreshed cookies. */ }
      },
    },
  });
}

export function publicClient() {
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function adminUser() {
  const client = await serverClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user?.email) return null;
  const { data, error } = await client.from("site_admins").select("email").eq("email", user.email.toLowerCase()).maybeSingle();
  return !error && data ? user : null;
}
