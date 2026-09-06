"use server";
import { redirect } from "next/navigation";
import { serverClient, adminUser } from "../../lib/supabase/server";

export async function login(_: { error: string }, form: FormData) {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const client = await serverClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { error: "Имэйл эсвэл нууц үг буруу байна." };
  if (!await adminUser()) {
    await client.auth.signOut();
    return { error: "Админы эрхгүй байна." };
  }
  redirect("/admin");
}

export async function logout() {
  const client = await serverClient();
  await client.auth.signOut();
  redirect("/");
}
