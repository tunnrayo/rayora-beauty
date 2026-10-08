import { Router } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { asyncHandler, HttpError, parse } from "../../lib/http.js";
import { requireAdmin, requireAuth } from "../../lib/auth.js";
import {
  createProduct, getProductById, getProductBySlug, listAllProducts, listCategories, listProducts,
  slugify, updateProduct,
} from "./repository.js";

export const productsRouter = Router();

productsRouter.get("/status", (_req, res) => {
  res.json({ service: "products", status: "ready" });
});

const listSchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(60).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  skinType: z.string().trim().max(30).optional(),
  flag: z.enum(["featured", "new", "best"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "popular", "rating"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { minPrice, maxPrice, ...rest } = parse(listSchema, req.query);
    res.json(await listProducts({ ...rest, minNaira: minPrice, maxNaira: maxPrice }));
  })
);

productsRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    res.json({ items: await listCategories() });
  })
);

// ---------- admin ----------
const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .regex(/^(\/media\/[0-9a-f-]{36}|https:\/\/.+)$/, "Image must be a generated image or an https link")
  .nullable()
  .optional();

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  description: z.string().trim().min(10, "Description is too short").max(2000),
  categoryId: z.string().uuid("Choose a category"),
  priceKobo: z.number().int().min(0).max(1_000_000_000),
  compareAtPriceKobo: z.number().int().positive().nullable().optional(),
  size: z.string().trim().max(40).default(""),
  ingredients: z.string().trim().max(2000).default(""),
  skinTypes: z.array(z.string().trim().max(30)).max(10).default([]),
  shades: z.array(z.string().trim().max(40)).max(60).default([]),
  stock: z.number().int().min(0).max(100000),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  imageUrl: imageUrlSchema,
});

productsRouter.get("/admin/all", requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ items: await listAllProducts() });
}));

productsRouter.get("/admin/item/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const p = await getProductById(id);
  if (!p) throw new HttpError(404, "Product not found.");
  res.json(p);
}));

productsRouter.post("/admin", requireAdmin, asyncHandler(async (req, res) => {
  const id = await createProduct(parse(productSchema, req.body));
  res.status(201).json({ id });
}));

productsRouter.put("/admin/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const ok = await updateProduct(id, parse(productSchema, req.body));
  if (!ok) throw new HttpError(404, "Product not found.");
  res.json({ id });
}));

productsRouter.patch("/admin/:id/stock", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const { stock } = parse(z.object({ stock: z.number().int().min(0).max(100000) }), req.body);
  const r = await pool.query("UPDATE products SET stock = $1, updated_at = now() WHERE id = $2", [stock, id]);
  if (!r.rowCount) throw new HttpError(404, "Product not found.");
  res.json({ id, stock });
}));

productsRouter.patch("/admin/:id/image", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const { imageUrl } = parse(z.object({ imageUrl: imageUrlSchema }), req.body);
  const r = await pool.query("UPDATE products SET image_url = $1, updated_at = now() WHERE id = $2", [imageUrl ?? null, id]);
  if (!r.rowCount) throw new HttpError(404, "Product not found.");
  res.json({ id, imageUrl: imageUrl ?? null });
}));

productsRouter.delete("/admin/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
  res.status(204).end();
}));

const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).default(""),
  sortOrder: z.number().int().min(0).max(1000).default(0),
});

productsRouter.post("/admin/categories", requireAdmin, asyncHandler(async (req, res) => {
  const c = parse(categorySchema, req.body);
  const r = await pool.query(
    "INSERT INTO categories (slug, name, description, sort_order) VALUES ($1,$2,$3,$4) RETURNING id",
    [slugify(c.name), c.name, c.description, c.sortOrder]
  );
  res.status(201).json({ id: r.rows[0].id });
}));

productsRouter.put("/admin/categories/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const c = parse(categorySchema, req.body);
  const r = await pool.query(
    "UPDATE categories SET name=$1, description=$2, sort_order=$3 WHERE id=$4",
    [c.name, c.description, c.sortOrder, id]
  );
  if (!r.rowCount) throw new HttpError(404, "Category not found.");
  res.json({ id });
}));

productsRouter.delete("/admin/categories/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const used = await pool.query("SELECT 1 FROM products WHERE category_id = $1 LIMIT 1", [id]);
  if (used.rowCount) throw new HttpError(409, "Move or delete the products in this category first.");
  await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  res.status(204).end();
}));

// ---------- reviews ----------
productsRouter.get("/:slug/reviews", asyncHandler(async (req, res) => {
  const r = await pool.query(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at AS "createdAt", split_part(u.full_name, ' ', 1) AS "firstName"
     FROM reviews r JOIN users u ON u.id = r.user_id JOIN products p ON p.id = r.product_id
     WHERE p.slug = $1 ORDER BY r.created_at DESC LIMIT 50`,
    [req.params.slug]
  );
  res.json({ items: r.rows });
}));

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating").max(5),
  title: z.string().trim().max(100).default(""),
  body: z.string().trim().max(1000).default(""),
});

productsRouter.post("/:slug/reviews", requireAuth, asyncHandler(async (req, res) => {
  const input = parse(reviewSchema, req.body);
  const product = (await pool.query("SELECT id, rating::float AS rating, review_count AS count FROM products WHERE slug = $1", [req.params.slug])).rows[0];
  if (!product) throw new HttpError(404, "Product not found.");

  const saved = await pool.query(
    `INSERT INTO reviews (product_id, user_id, rating, title, body) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (product_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, title = EXCLUDED.title, body = EXCLUDED.body
     RETURNING (xmax = 0) AS inserted`,
    [product.id, req.auth!.userId, input.rating, input.title, input.body]
  );
  if (saved.rows[0].inserted) {
    const count = product.count + 1;
    const rating = Math.round(((product.rating * product.count + input.rating) / count) * 10) / 10;
    await pool.query("UPDATE products SET rating = $1, review_count = $2 WHERE id = $3", [rating, count, product.id]);
  }
  res.status(201).json({ ok: true });
}));

// ---------- single product (keep last) ----------
productsRouter.get("/:slug", asyncHandler(async (req, res) => {
  const product = await getProductBySlug(req.params.slug);
  if (!product) throw new HttpError(404, "Product not found.");
  res.json(product);
}));
