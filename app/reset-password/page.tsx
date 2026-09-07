import { redirect } from "next/navigation";
import { adminUser } from "../../lib/supabase/server";
import AccountForm from "../login/AccountForm";
export default async function ResetPassword() {
  if (!await adminUser()) redirect("/forgot-password");
  return <AccountForm mode="password" />;
}
