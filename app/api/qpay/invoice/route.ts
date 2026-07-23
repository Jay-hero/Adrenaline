import { NextResponse } from "next/server";
import { membershipPlans } from "../../../site-data";
import { createQPayInvoice } from "../../../../lib/qpay";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { planId?: string };
    const plan = membershipPlans.find((item) => item.id === body.planId);
    if (!plan) return NextResponse.json({ error: "Гишүүнчлэлийн сонголт буруу байна." }, { status: 400 });
    const origin = new URL(request.url).origin;
    const invoice = await createQPayInvoice({
      orderId: `ADRN-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      description: `Adrenaline Fitness — ${plan.name} (${plan.duration})`,
      amount: plan.price,
      callbackUrl: process.env.QPAY_CALLBACK_URL || `${origin}/api/qpay/callback`,
    });
    return NextResponse.json({ invoiceId: invoice.invoice_id, qrImage: invoice.qr_image, shortUrl: invoice.qPay_shortUrl, bankUrls: invoice.urls || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "QPay нэхэмжлэх үүсгэж чадсангүй." }, { status: 503 });
  }
}

