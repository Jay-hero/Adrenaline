import styles from "../../login/page.module.css";
export default function AuthError() {
  return <main className={styles.main}><section className={styles.form}><h1>Холбоос хүчингүй байна</h1><p>Холбоосын хугацаа дууссан эсвэл өөр браузерт нээсэн байна. Хүсэлт гаргасан браузертаа имэйлийн холбоосыг нээнэ үү.</p><a href="/forgot-password">Дахин холбоос авах</a><a href="/login">Нэвтрэх</a></section></main>;
}
