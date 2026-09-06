const baseUrl = () => (process.env.QPAY_BASE_URL || "https://merchant-sandbox.qpay.mn").replace(/\/$/, "");

function config() {
  const username = process.env.QPAY_USERNAME;
  const password = process.env.QPAY_PASSWORD;
  const invoiceCode = process.env.QPAY_INVOICE_CODE;
  if (!username || !password || !invoiceCode) {
    throw new Error("QPay merchant username, password болон invoice code тохируулагдаагүй байна.");
  }
  return { username, password, invoiceCode };
}

async function token() {
  const settings = config();
  const response = await fetch(`${baseUrl()}/v2/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${settings.username}:${settings.password}`)}`,
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json()) as { access_token?: string; message?: string };
  if (!response.ok || !data.access_token) throw new Error(data.message || "QPay authentication амжилтгүй боллоо.");
  return { accessToken: data.access_token, invoiceCode: settings.invoiceCode };
}

export async function createQPayInvoice(input: { orderId: string; description: string; amount: number; callbackUrl: string }) {
  const auth = await token();
  const response = await fetch(`${baseUrl()}/v2/invoice`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      invoice_code: auth.invoiceCode,
      sender_invoice_no: input.orderId,
      invoice_receiver_code: "terminal",
      invoice_description: input.description,
      amount: input.amount,
      callback_url: input.callbackUrl,
    }),
  });
  const data = (await response.json()) as { invoice_id?: string; qr_image?: string; qPay_shortUrl?: string; urls?: unknown[]; message?: string };
  if (!response.ok || !data.invoice_id) throw new Error(data.message || "QPay invoice үүсгэхэд алдаа гарлаа.");
  return data;
}

export async function checkQPayInvoice(invoiceId: string) {
  const auth = await token();
  const response = await fetch(`${baseUrl()}/v2/payment/check`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ object_type: "INVOICE", object_id: invoiceId, offset: { page_number: 1, page_limit: 10 } }),
  });
  const data = (await response.json()) as { count?: number; rows?: Array<{ payment_status?: string }>; message?: string };
  if (!response.ok) throw new Error(data.message || "QPay төлбөр шалгаж чадсангүй.");
  return { paid: (data.count || 0) > 0 && Boolean(data.rows?.some((row) => row.payment_status === "PAID")) };
}

