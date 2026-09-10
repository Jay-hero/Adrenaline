import { NextResponse } from "next/server"; import { getSiteContent } from "../../../lib/content";
export async function GET(){ const content=await getSiteContent();return NextResponse.json({...content,pages:content.pages.filter(p=>!p.deleted&&p.status==='published')},{headers:{"Cache-Control":"no-store"}}); }
