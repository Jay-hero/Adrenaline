"use server";
import { redirect } from "next/navigation";
import { adminUser, serverClient } from "../../lib/supabase/server";

type Result = { error: string; message: string };
const site = "https://adrenaline-gilt.vercel.app";
const adminEmail = "javkhlanbaataru@gmail.com";
const fail = (error: string): Result => ({ error, message: "" });

export async function register(_: Result, form: FormData): Promise<Result> {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (email !== adminEmail) return fail("Зөвшөөрөгдсөн админы имэйлээ оруулна уу.");
  if (password.length < 12) return fail("Нууц үг хамгийн багадаа 12 тэмдэгт байна.");
  if (password !== form.get("confirm")) return fail("Нууц үгүүд таарахгүй байна.");
  const client = await serverClient();
  const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${site}/auth/callback?next=/admin` } });
  if (error) return fail("Бүртгэж чадсангүй. Түр хүлээгээд дахин оролдоно уу.");
  return { error: "", message: "Имэйлээр ирсэн холбоосоор бүртгэлээ баталгаажуулна уу. Өмнө бүртгүүлсэн бол нууц үг сэргээхийг сонгоно уу." };
}

export async function recover(_: Result, form: FormData): Promise<Result> {
  const email = String(form.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return fail("Имэйлээ зөв оруулна уу.");
  const client = await serverClient();
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${site}/auth/callback?next=/reset-password` });
  if (error) return fail("Хүсэлтийг илгээж чадсангүй. Түр хүлээгээд дахин оролдоно уу.");
  return { error: "", message: "Бүртгэлтэй имэйл бол нууц үг сэргээх холбоос очно. Spam хавтсаа мөн шалгана уу." };
}

export async function changePassword(_: Result, form: FormData): Promise<Result> {
  if (!await adminUser()) return fail("Сэргээх холбоос хүчингүй болсон байна. Дахин холбоос аваарай.");
  const password = String(form.get("password") || "");
  if (password.length < 12) return fail("Нууц үг хамгийн багадаа 12 тэмдэгт байна.");
  if (password !== form.get("confirm")) return fail("Нууц үгүүд таарахгүй байна.");
  const client = await serverClient();
  const { error } = await client.auth.updateUser({ password });
  if (error) return fail("Нууц үгийг шинэчилж чадсангүй. Өөр нууц үг сонгоод дахин оролдоно уу.");
  redirect("/admin");
}
