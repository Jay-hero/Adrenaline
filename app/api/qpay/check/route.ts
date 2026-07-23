import { NextResponse } from "next/server";
import { checkQPayInvoice } from "../../../../lib/qpay";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { invoiceId?: string };
    if (!body.invoiceId || body.invoiceId.length > 128) return NextResponse.json({ error: "Invoice ID буруу байна." }, { status: 400 });
    return NextResponse.json(await checkQPayInvoice(body.invoiceId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "QPay төлбөр шалгаж чадсангүй." }, { status: 503 });
  }
}

