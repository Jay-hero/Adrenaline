import { requireChatGPTUser,chatGPTSignOutPath } from "../chatgpt-auth";import { isAdmin } from "../../lib/content";import Editor from "./Editor";
export const dynamic="force-dynamic";
export default async function Page(){const u=await requireChatGPTUser("/admin");if(!await isAdmin(u.email))return <main className="admin-denied"><h1>Админы эрхгүй байна</h1><p>{u.email}</p></main>;return <Editor email={u.email} signout={chatGPTSignOutPath("/")}/>;}
