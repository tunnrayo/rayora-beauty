import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { asyncHandler, HttpError, parse } from "../../lib/http.js";
import { requireAdmin, requireAuth, signToken } from "../../lib/auth.js";
import { PRODUCT_SELECT } from "../products/repository.js";

export const usersRouter = Router();

usersRouter.get("/status", (_req, res) => {
  res.json({ service: "users", status: "ready" });
});

const USER_COLS = `id, email, full_name AS "fullName", phone, role`;

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address").max(120),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  phone: z.string().trim().max(20).optional(),
});

usersRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = parse(registerSchema, req.body);
    const hash = await bcrypt.hash(input.password, 10);
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone) VALUES ($1,$2,$3,$4) RETURNING ${USER_COLS}`,
      [input.email, hash, input.fullName, input.phone || null]
    ).catch((err) => {
      if (err.code === "23505") throw new HttpError(409, "An account with this email already exists.");
      throw err;
    });
    const user = r.rows[0];
    res.status(201).json({ token: signToken(user.id, user.role), user });
  })
);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password").max(72),
});

usersRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = parse(loginSchema, req.body);
    const row = (await pool.query(`SELECT ${USER_COLS}, password_hash FROM users WHERE email = $1`, [input.email])).rows[0];
    const ok = row ? await bcrypt.compare(input.password, row.password_hash) : false;
    if (!row || !ok) throw new HttpError(401, "Incorrect email or password.");
    const { password_hash: _ignored, ...user } = row;
    res.json({ token: signToken(user.id, user.role), user });
  })
);

usersRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const row = (await pool.query(`SELECT ${USER_COLS} FROM users WHERE id = $1`, [req.auth!.userId])).rows[0];
    if (!row) throw new HttpError(401, "Please log in to continue.");
    res.json(row);
  })
);

// ---- wishlist ----
usersRouter.get(
  "/wishlist",
  requireAuth,
  asyncHandler(async (req, res) => {
    const r = await pool.query(
      `${PRODUCT_SELECT} JOIN wishlist_items w ON w.product_id = p.id
       WHERE w.user_id = $1 AND p.status = 'active' ORDER BY w.created_at DESC`,
      [req.auth!.userId]
    );
    res.json({ items: r.rows });
  })
);

usersRouter.post(
  "/wishlist/:productId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const productId = parse(z.string().uuid(), req.params.productId);
    await pool.query(
      "INSERT INTO wishlist_items (user_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [req.auth!.userId, productId]
    );
    res.status(204).end();
  })
);

usersRouter.delete(
  "/wishlist/:productId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const productId = parse(z.string().uuid(), req.params.productId);
    await pool.query("DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2", [req.auth!.userId, productId]);
    res.status(204).end();
  })
);

// ---- admin ----
usersRouter.get(
  "/admin/customers",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const r = await pool.query(
      `SELECT u.id, u.email, u.full_name AS "fullName", u.phone, u.created_at AS "createdAt",
              COUNT(o.id)::int AS "orderCount",
              COALESCE(SUM(o.total_kobo) FILTER (WHERE o.payment_status = 'paid' AND o.status <> 'cancelled'), 0)::bigint AS "spentKobo"
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'customer' GROUP BY u.id ORDER BY u.created_at DESC LIMIT 300`
    );
    res.json({ items: r.rows });
  })
);
