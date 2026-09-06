"use client";
import { useActionState } from "react";
import { login } from "./actions";
import styles from "./page.module.css";

export default function Login() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return <main className={styles.main}><form action={action} className={styles.form}>
    <a href="/"><img src="/adrenaline-logo.jpg" width="64" height="64" alt="Adrenaline" /></a>
    <h1>Админ нэвтрэх</h1>
    <label htmlFor="email">Имэйл</label>
    <input id="email" name="email" type="email" autoComplete="username" required />
    <label htmlFor="password">Нууц үг</label>
    <input id="password" name="password" type="password" autoComplete="current-password" required />
    {state.error && <p role="alert">{state.error}</p>}
    <button disabled={pending} type="submit">{pending ? "Нэвтэрч байна…" : "Нэвтрэх"}</button>
    <a href="/">Нүүр хуудас</a>
  </form></main>;
}
