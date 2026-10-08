import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";
import { env } from "./config/env.js";
import { productsRouter } from "./services/products/routes.js";
import { cartRouter } from "./services/cart/routes.js";
import { ordersRouter } from "./services/orders/routes.js";
import { paymentsRouter } from "./services/payments/routes.js";
import { usersRouter } from "./services/users/routes.js";
import { notificationsRouter } from "./services/notifications/routes.js";
import { analyticsRouter } from "./services/analytics/routes.js";

export const app = express();

// Railway sits behind a proxy; this makes rate limiting see real visitor IPs
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

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

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Customers never see technical details; we log them on the server instead
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});
