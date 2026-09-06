import { logout } from "../login/actions";
export default function Logout() {
  return <main className="admin-denied"><h1>Гарах</h1><form action={logout}><button className="btn primary" type="submit">Гарах</button></form><a href="/admin">Буцах</a></main>;
}
