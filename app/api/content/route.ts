import { NextResponse } from "next/server"; import { getSiteContent } from "../../../lib/content";
export async function GET(){ return NextResponse.json(await getSiteContent(),{headers:{"Cache-Control":"no-store"}}); }
