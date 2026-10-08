import { Router } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { asyncHandler, parse } from "../../lib/http.js";
import { requireAdmin } from "../../lib/auth.js";

export const analyticsRouter = Router();

analyticsRouter.get("/status", (_req, res) => {
  res.json({ service: "analytics", status: "ready" });
});

const eventSchema = z.object({
  type: z.enum(["page_view", "product_view", "add_to_cart", "checkout_start"]),
  path: z.string().trim().max(200).optional(),
  productId: z.string().uuid().optional(),
  sessionId: z.string().trim().max(64).optional(),
});

analyticsRouter.post("/event", asyncHandler(async (req, res) => {
  const e = parse(eventSchema, req.body);
  await pool.query(
    "INSERT INTO analytics_events (event_type, path, product_id, session_id) VALUES ($1,$2,$3,$4)",
    [e.type, e.path ?? null, e.productId ?? null, e.sessionId ?? null]
  );
  res.status(204).end();
}));

analyticsRouter.get("/dashboard", requireAdmin, asyncHandler(async (req, res) => {
  const includeDemo = req.query.demo !== "hide";
  const filter = "o.payment_status = 'paid' AND o.status <> 'cancelled' AND ($1::boolean OR NOT o.is_demo)";
  const q = (sql: string, params: unknown[] = [includeDemo]) => pool.query(sql, params).then((r) => r.rows);

  const [totals, daily, top, statuses, recent, low, traffic, abandoned] = await Promise.all([
    q(`SELECT COALESCE(SUM(o.total_kobo),0)::bigint AS "salesKobo", COUNT(*)::int AS "paidOrders" FROM orders o WHERE ${filter}`),
    q(`SELECT to_char(d::date, 'YYYY-MM-DD') AS day, COALESCE(SUM(o.total_kobo),0)::bigint AS "salesKobo", COUNT(o.id)::int AS orders
       FROM generate_series(current_date - 13, current_date, interval '1 day') d
       LEFT JOIN orders o ON o.created_at::date = d::date AND ${filter}
       GROUP BY d ORDER BY d`),
    q(`SELECT oi.product_name AS name, SUM(oi.quantity)::int AS units, SUM(oi.quantity * oi.unit_price_kobo)::bigint AS "revenueKobo"
       FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE ${filter}
       GROUP BY oi.product_name ORDER BY units DESC LIMIT 5`),
    q(`SELECT o.status, COUNT(*)::int AS count FROM orders o WHERE ($1::boolean OR NOT o.is_demo) GROUP BY o.status`),
    q(`SELECT o.order_number AS "orderNumber", o.customer_name AS "customerName", o.total_kobo AS "totalKobo",
              o.status, o.is_demo AS "isDemo", o.created_at AS "createdAt"
       FROM orders o WHERE ($1::boolean OR NOT o.is_demo) ORDER BY o.created_at DESC LIMIT 8`),
    q(`SELECT id, name, stock FROM products WHERE status = 'active' AND stock <= 10 ORDER BY stock, name LIMIT 10`, []),
    q(`SELECT COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS "pageViews",
              COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'page_view')::int AS sessions,
              COUNT(*) FILTER (WHERE event_type = 'add_to_cart')::int AS "addToCart",
              COUNT(*) FILTER (WHERE event_type = 'checkout_start')::int AS "checkoutStarts"
       FROM analytics_events WHERE created_at > now() - interval '30 days'`, []),
    q(`SELECT COUNT(DISTINCT c.id)::int AS count FROM carts c JOIN cart_items ci ON ci.cart_id = c.id
       WHERE c.updated_at < now() - interval '1 hour'`, []),
  ]);

  const counts = (await pool.query(
    `SELECT (SELECT COUNT(*) FROM users WHERE role = 'customer')::int AS customers,
            (SELECT COUNT(*) FROM products)::int AS products,
            (SELECT COUNT(*) FROM orders o WHERE ($1::boolean OR NOT o.is_demo))::int AS orders,
            (SELECT COUNT(*) FROM orders o WHERE o.is_demo)::int AS "demoOrders"`,
    [includeDemo]
  )).rows[0];

  const paidOrders = totals[0].paidOrders as number;
  const sessions = traffic[0].sessions as number;
  res.json({
    includeDemo,
    salesKobo: totals[0].salesKobo,
    paidOrders,
    ...counts,
    salesByDay: daily,
    topProducts: top,
    statusSummary: statuses,
    recentOrders: recent,
    lowStock: low,
    traffic: { ...traffic[0], conversionPercent: sessions ? Math.round((paidOrders / sessions) * 1000) / 10 : 0 },
    abandonedCarts: abandoned[0].count,
  });
}));
