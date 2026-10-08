import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";
import { env } from "./config/env.js";
import { HttpError } from "./lib/http.js";
import { productsRouter } from "./services/products/routes.js";
import { cartRouter } from "./services/cart/routes.js";
import { ordersRouter } from "./services/orders/routes.js";
import { paymentsRouter } from "./services/payments/routes.js";
import { usersRouter } from "./services/users/routes.js";
import { notificationsRouter } from "./services/notifications/routes.js";
import { analyticsRouter } from "./services/analytics/routes.js";
import { storeRouter } from "./services/store/routes.js";
import { aiRouter, mediaRouter } from "./services/ai/routes.js";

export const app = express();

// Railway sits behind a proxy; this makes rate limiting see real visitor IPs
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(
  express.json({
    limit: "1mb",
    // Paystack signs the exact bytes it sends, so keep a copy for the webhook check
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody: Buffer }).rawBody = buf;
    },
  })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));

// Stricter limit on login and sign up to slow down password guessing
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: true, legacyHeaders: false });
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/register", authLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "Rayora Beauty API", time: new Date().toISOString() });
});

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/store", storeRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/media", mediaRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Customers never see technical details; we log them on the server instead
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  const code = (err as { code?: string }).code;
  if (code === "23505") { res.status(409).json({ error: "That already exists." }); return; }
  if (code === "23514") { res.status(400).json({ error: "One of the values is not allowed. Check prices and stock." }); return; }
  if (code === "23503") { res.status(409).json({ error: "This item is in use and cannot be changed." }); return; }
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});
