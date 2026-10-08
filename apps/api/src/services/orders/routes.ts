import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError, parse } from "../../lib/http.js";
import { requireAdmin, requireAuth } from "../../lib/auth.js";
import { notifyOrderStatus } from "../notifications/email.js";
import { createOrder, getOrder, listOrders, updateOrderStatus } from "./repository.js";

export const ordersRouter = Router();

ordersRouter.get("/status", (_req, res) => {
  res.json({ service: "orders", status: "ready" });
});

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  couponCode: z.string().trim().max(40).optional(),
  customerName: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20),
  address: z.string().trim().min(5, "Please enter your delivery address").max(200),
  city: z.string().trim().min(2, "Please enter your city").max(60),
  state: z.string().trim().min(2, "Please choose your state").max(40),
  country: z.string().trim().min(2).max(40).default("Nigeria"),
});

ordersRouter.post("/", requireAuth, asyncHandler(async (req, res) => {
  const order = await createOrder(req.auth!.userId, parse(checkoutSchema, req.body));
  res.status(201).json(order);
}));

ordersRouter.get("/mine", requireAuth, asyncHandler(async (req, res) => {
  res.json({ items: await listOrders({ userId: req.auth!.userId }) });
}));

// ---- admin ----
ordersRouter.get("/admin/all", requireAdmin, asyncHandler(async (req, res) => {
  const status = STATUSES.find((s) => s === req.query.status);
  res.json({ items: await listOrders({ status, limit: 300 }) });
}));

ordersRouter.patch("/admin/:orderNumber/status", requireAdmin, asyncHandler(async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(STATUSES) }), req.body);
  await updateOrderStatus(req.params.orderNumber, status);
  const order = await getOrder(req.params.orderNumber);
  if (order) void notifyOrderStatus(order as never);
  res.json(order);
}));

// Customers can only open their own orders. Admins can open any.
ordersRouter.get("/:orderNumber", requireAuth, asyncHandler(async (req, res) => {
  const order = await getOrder(req.params.orderNumber);
  const allowed = order && (order.userId === req.auth!.userId || req.auth!.role === "admin");
  if (!allowed) throw new HttpError(404, "Order not found.");
  res.json(order);
}));
