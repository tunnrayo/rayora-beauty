import { Router } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { asyncHandler, HttpError, parse } from "../../lib/http.js";
import { requireAdmin } from "../../lib/auth.js";
import { getDeliveryFees } from "../../lib/settings.js";

export const storeRouter = Router();

storeRouter.get("/status", (_req, res) => {
  res.json({ service: "store", status: "ready" });
});

const BANNER_COLS = `id, title, subtitle, link_url AS "linkUrl", active, sort_order AS "sortOrder"`;

storeRouter.get("/banners", asyncHandler(async (_req, res) => {
  const r = await pool.query(`SELECT ${BANNER_COLS} FROM banners WHERE active ORDER BY sort_order, title LIMIT 3`);
  res.json({ items: r.rows });
}));

// ---- admin: banners ----
const bannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(200).default(""),
  linkUrl: z.string().trim().max(200).regex(/^\//, "Link must start with /").default("/shop"),
});

storeRouter.get("/admin/banners", requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ items: (await pool.query(`SELECT ${BANNER_COLS} FROM banners ORDER BY sort_order, title`)).rows });
}));

storeRouter.post("/admin/banners", requireAdmin, asyncHandler(async (req, res) => {
  const b = parse(bannerSchema, req.body);
  await pool.query("INSERT INTO banners (title, subtitle, link_url) VALUES ($1,$2,$3)", [b.title, b.subtitle, b.linkUrl]);
  res.status(201).json({ ok: true });
}));

storeRouter.patch("/admin/banners/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const { active } = parse(z.object({ active: z.boolean() }), req.body);
  await pool.query("UPDATE banners SET active = $1 WHERE id = $2", [active, id]);
  res.json({ ok: true });
}));

storeRouter.delete("/admin/banners/:id", requireAdmin, asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM banners WHERE id = $1", [parse(z.string().uuid(), req.params.id)]);
  res.status(204).end();
}));

// ---- admin: coupons ----
const COUPON_COLS = `id, code, percent_off AS "percentOff", amount_off_kobo AS "amountOffKobo", active, expires_at AS "expiresAt"`;

storeRouter.get("/admin/coupons", requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ items: (await pool.query(`SELECT ${COUPON_COLS} FROM coupons ORDER BY code`)).rows });
}));

const couponSchema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/, "Code must be 3 to 20 letters or numbers"),
    percentOff: z.number().int().min(1).max(100).nullable().optional(),
    amountOffKobo: z.number().int().positive().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .refine((c) => Boolean(c.percentOff) !== Boolean(c.amountOffKobo), "Choose either a percentage or an amount");

storeRouter.post("/admin/coupons", requireAdmin, asyncHandler(async (req, res) => {
  const c = parse(couponSchema, req.body);
  await pool.query(
    "INSERT INTO coupons (code, percent_off, amount_off_kobo, expires_at) VALUES ($1,$2,$3,$4)",
    [c.code, c.percentOff ?? null, c.amountOffKobo ?? null, c.expiresAt ?? null]
  );
  res.status(201).json({ ok: true });
}));

storeRouter.patch("/admin/coupons/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const { active } = parse(z.object({ active: z.boolean() }), req.body);
  await pool.query("UPDATE coupons SET active = $1 WHERE id = $2", [active, id]);
  res.json({ ok: true });
}));

storeRouter.delete("/admin/coupons/:id", requireAdmin, asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM coupons WHERE id = $1", [parse(z.string().uuid(), req.params.id)]);
  res.status(204).end();
}));

// ---- admin: settings ----
storeRouter.get("/admin/settings", requireAdmin, asyncHandler(async (_req, res) => {
  res.json(await getDeliveryFees());
}));

storeRouter.put("/admin/settings", requireAdmin, asyncHandler(async (req, res) => {
  const s = parse(z.object({
    lagosKobo: z.number().int().min(0).max(100_000_000),
    otherKobo: z.number().int().min(0).max(100_000_000),
  }), req.body);
  await pool.query(
    `INSERT INTO store_settings (key, value) VALUES ('delivery_fee_lagos_kobo', $1), ('delivery_fee_other_kobo', $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [String(s.lagosKobo), String(s.otherKobo)]
  );
  res.json(s);
}));

storeRouter.use((_req, _res, next) => next(new HttpError(404, "Not found.")));
