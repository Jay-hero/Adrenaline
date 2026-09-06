import { redirect } from "next/navigation";
import { adminUser } from "../../lib/supabase/server";
import Editor from "./Editor";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await adminUser();
  if (!user) redirect("/login");
  return <Editor email={user.email!} signout="/logout" />;
}
