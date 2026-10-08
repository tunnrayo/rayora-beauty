import { env } from "../../config/env.js";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.log(`[email not configured] would send "${subject}" to ${to}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM ?? "Rayora Beauty <onboarding@resend.dev>", to: [to], subject, html }),
    });
    if (!res.ok) console.error("Email provider rejected the message:", res.status);
  } catch {
    console.error("Email could not be sent.");
  }
}

type OrderLike = {
  orderNumber: string; customerName: string; email: string; status: string; totalKobo: number;
  items?: { name: string; quantity: number }[];
};

export async function notifyOrderPaid(o: OrderLike) {
  const lines = (o.items ?? []).map((i) => `<li>${esc(i.name)} × ${i.quantity}</li>`).join("");
  await sendEmail(
    o.email,
    `Your Rayora Beauty order ${o.orderNumber}`,
    `<p>Hello ${esc(o.customerName)},</p><p>Thank you for your order. We have received it and will keep you updated.</p>
     <p><strong>Order ${esc(o.orderNumber)}</strong></p><ul>${lines}</ul><p>Total: ${naira(o.totalKobo)}</p>`
  );
}

export async function notifyOrderStatus(o: OrderLike) {
  await sendEmail(
    o.email,
    `Order ${o.orderNumber} is now ${o.status}`,
    `<p>Hello ${esc(o.customerName)},</p><p>Your order <strong>${esc(o.orderNumber)}</strong> is now <strong>${esc(o.status)}</strong>.</p>
     <p>You can follow it any time from your Rayora Beauty account.</p>`
  );
}
