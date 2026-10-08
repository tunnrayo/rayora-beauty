import { createHmac, randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { pool } from "../../db/pool.js";
import { asyncHandler, HttpError, parse } from "../../lib/http.js";
import { requireAuth } from "../../lib/auth.js";
import { getOrder } from "../orders/repository.js";
import { markPaid } from "./service.js";

export const paymentsRouter = Router();

paymentsRouter.get("/status", (_req, res) => {
  res.json({ service: "payments", status: "ready" });
});

/** Tells the website whether to show the demo payment step or send customers to Paystack. */
paymentsRouter.get("/config", (_req, res) => {
  res.json({ mode: env.PAYSTACK_SECRET_KEY ? "paystack" : "demo" });
});

const orderRef = z.object({ orderNumber: z.string().trim().min(3).max(30) });

async function ownOrder(orderNumber: string, userId: string) {
  const order = await getOrder(orderNumber);
  if (!order || order.userId !== userId) throw new HttpError(404, "Order not found.");
  return order;
}

// ---- demo payment (no real money) ----
paymentsRouter.post("/demo/confirm", requireAuth, asyncHandler(async (req, res) => {
  if (env.PAYSTACK_SECRET_KEY) throw new HttpError(400, "Demo payments are switched off.");
  const { orderNumber } = parse(orderRef, req.body);
  await ownOrder(orderNumber, req.auth!.userId);
  await markPaid(orderNumber, `DEMO-${orderNumber}`, true);
  res.json({ orderNumber, paid: true });
}));

// ---- Paystack ----
async function paystack(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
  });
  const json = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: any } | null;
  if (!res.ok || !json?.status) {
    console.error("Paystack error:", res.status, json?.message);
    throw new HttpError(502, "We could not reach the payment provider. Please try again.");
  }
  return json.data;
}

paymentsRouter.post("/paystack/initialize", requireAuth, asyncHandler(async (req, res) => {
  if (!env.PAYSTACK_SECRET_KEY) throw new HttpError(400, "Online payments are not switched on yet.");
  const { orderNumber, callbackUrl } = parse(orderRef.extend({ callbackUrl: z.string().url() }), req.body);
  const order = await ownOrder(orderNumber, req.auth!.userId);
  if (order.paymentStatus === "paid") throw new HttpError(400, "This order is already paid.");

  const reference = `${orderNumber}-${randomBytes(4).toString("hex")}`;
  const data = await paystack("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: order.email, amount: order.totalKobo, currency: "NGN", reference,
      callback_url: callbackUrl, metadata: { orderNumber },
    }),
  });
  await pool.query("UPDATE orders SET payment_reference = $1 WHERE order_number = $2", [reference, orderNumber]);
  res.json({ authorizationUrl: data.authorization_url as string });
}));

paymentsRouter.get("/paystack/verify", requireAuth, asyncHandler(async (req, res) => {
  if (!env.PAYSTACK_SECRET_KEY) throw new HttpError(400, "Online payments are not switched on yet.");
  const reference = parse(z.string().trim().min(5).max(80), req.query.reference);
  const row = (await pool.query("SELECT order_number FROM orders WHERE payment_reference = $1 AND user_id = $2", [reference, req.auth!.userId])).rows[0];
  if (!row) throw new HttpError(404, "Payment not found.");
  const order = await getOrder(row.order_number);
  const data = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
  const paid = data.status === "success" && data.amount === order!.totalKobo && data.currency === "NGN";
  if (paid) await markPaid(row.order_number, reference, false);
  res.json({ orderNumber: row.order_number, paid });
}));

// Paystack calls this itself, so it is verified with a signature instead of a login.
paymentsRouter.post("/paystack/webhook", asyncHandler(async (req, res) => {
  if (!env.PAYSTACK_SECRET_KEY) { res.status(200).end(); return; }
  const raw = (req as unknown as { rawBody?: Buffer }).rawBody;
  const signature = req.headers["x-paystack-signature"];
  const expected = raw ? createHmac("sha512", env.PAYSTACK_SECRET_KEY).update(raw).digest("hex") : "";
  if (!signature || signature !== expected) { res.status(401).end(); return; }

  const event = req.body as { event?: string; data?: { reference?: string; amount?: number; status?: string } };
  if (event.event === "charge.success" && event.data?.reference) {
    const row = (await pool.query("SELECT order_number, total_kobo FROM orders WHERE payment_reference = $1", [event.data.reference])).rows[0];
    if (row && event.data.amount === row.total_kobo) await markPaid(row.order_number, event.data.reference, false);
  }
  res.status(200).end();
}));
