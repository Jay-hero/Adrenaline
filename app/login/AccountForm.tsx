"use client";
import { useActionState } from "react";
import { register, recover, changePassword } from "./account-actions";
import styles from "./page.module.css";

export default function AccountForm({ mode }: { mode: "register" | "recover" | "password" }) {
  const [state, action, pending] = useActionState(mode === "register" ? register : mode === "recover" ? recover : changePassword, { error: "", message: "" });
  const title = mode === "register" ? "Админ бүртгэл үүсгэх" : mode === "recover" ? "Нууц үг сэргээх" : "Шинэ нууц үг";
  return <main className={styles.main}><form action={action} className={styles.form}>
    <a href="/"><img src="/adrenaline-logo.jpg" width="64" height="64" alt="Adrenaline" /></a>
    <h1>{title}</h1>
    {mode !== "password" && <><label htmlFor="email">Имэйл</label><input id="email" name="email" type="email" autoComplete="username" required /></>}
    {mode !== "recover" && <><label htmlFor="password">Шинэ нууц үг (12+ тэмдэгт)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required /><label htmlFor="confirm">Нууц үг давтах</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required /></>}
    {state.error && <p role="alert">{state.error}</p>}
    {state.message && <div role="status">{state.message}</div>}
    <button disabled={pending || Boolean(state.message)} type="submit">{pending ? "Түр хүлээнэ үү…" : mode === "recover" ? "Сэргээх холбоос авах" : mode === "register" ? "Бүртгэл үүсгэх" : "Нууц үг хадгалах"}</button>
    <a href="/login">Нэвтрэх</a>
    {mode !== "recover" && <a href="/forgot-password">Нууц үг мартсан</a>}
  </form></main>;
}
