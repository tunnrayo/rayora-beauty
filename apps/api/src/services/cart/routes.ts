import { Router } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { asyncHandler, HttpError, parse } from "../../lib/http.js";
import { getDeliveryFees } from "../../lib/settings.js";

export const cartRouter = Router();

cartRouter.get("/status", (_req, res) => {
  res.json({ service: "cart", status: "ready" });
});

const idSchema = z.string().uuid();

function cartId(raw: string): string {
  const r = idSchema.safeParse(raw);
  if (!r.success) throw new HttpError(404, "Cart not found.");
  return r.data;
}

async function loadCart(id: string) {
  const exists = await pool.query("SELECT 1 FROM carts WHERE id = $1", [id]);
  if (!exists.rowCount) throw new HttpError(404, "Cart not found.");
  const items = (
    await pool.query(
      `SELECT ci.product_id AS "productId", ci.quantity, p.slug, p.name, p.size,
              p.price_kobo AS "priceKobo", p.stock, p.status, p.image_url AS "imageUrl", c.name AS "categoryName"
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE ci.cart_id = $1 ORDER BY p.name`,
      [id]
    )
  ).rows;
  const lines = items.map((i) => ({ ...i, lineTotalKobo: i.priceKobo * i.quantity }));
  return {
    id,
    items: lines,
    subtotalKobo: lines.reduce((s, l) => s + l.lineTotalKobo, 0),
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    fees: await getDeliveryFees(),
  };
}

async function changeQuantity(id: string, productId: string, quantity: number, mode: "add" | "set") {
  const product = (await pool.query("SELECT name, stock, status FROM products WHERE id = $1", [productId])).rows[0];
  if (!product || product.status !== "active") throw new HttpError(404, "That product is not available.");

  const current =
    (await pool.query("SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2", [id, productId])).rows[0]
      ?.quantity ?? 0;
  const wanted = mode === "add" ? current + quantity : quantity;
  let notice: string | undefined;

  if (wanted <= 0) {
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2", [id, productId]);
  } else {
    if (product.stock <= 0) throw new HttpError(409, `${product.name} is out of stock.`);
    const finalQty = Math.min(wanted, product.stock);
    if (finalQty < wanted) notice = `Only ${product.stock} of ${product.name} available, so we set the quantity to ${finalQty}.`;
    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1,$2,$3)
       ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
      [id, productId, finalQty]
    );
  }
  await pool.query("UPDATE carts SET updated_at = now() WHERE id = $1", [id]);
  return { cart: await loadCart(id), notice };
}

cartRouter.post(
  "/",
  asyncHandler(async (_req, res) => {
    const r = await pool.query("INSERT INTO carts DEFAULT VALUES RETURNING id");
    res.status(201).json({ id: r.rows[0].id });
  })
);

cartRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await loadCart(cartId(req.params.id)));
  })
);

const addSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20).default(1),
});

cartRouter.post(
  "/:id/items",
  asyncHandler(async (req, res) => {
    const id = cartId(req.params.id);
    await loadCart(id);
    const input = parse(addSchema, req.body);
    res.json(await changeQuantity(id, input.productId, input.quantity, "add"));
  })
);

cartRouter.put(
  "/:id/items/:productId",
  asyncHandler(async (req, res) => {
    const id = cartId(req.params.id);
    await loadCart(id);
    const productId = parse(idSchema, req.params.productId);
    const { quantity } = parse(z.object({ quantity: z.number().int().min(0).max(20) }), req.body);
    res.json(await changeQuantity(id, productId, quantity, "set"));
  })
);

cartRouter.delete(
  "/:id/items/:productId",
  asyncHandler(async (req, res) => {
    const id = cartId(req.params.id);
    await loadCart(id);
    const productId = parse(idSchema, req.params.productId);
    res.json(await changeQuantity(id, productId, 0, "set"));
  })
);
