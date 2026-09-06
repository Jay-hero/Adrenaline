// Publishable credentials identify the project; access is enforced by RLS.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nfyxpdoqdstrepcgetdn.supabase.co";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_0TrVQO3A0jkQnFw2bxMdHg_bMqNo5Jm";
