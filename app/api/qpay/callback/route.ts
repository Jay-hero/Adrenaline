import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ received: true }); }
export async function POST() { return NextResponse.json({ received: true }); }

