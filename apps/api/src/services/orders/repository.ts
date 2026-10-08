import { randomInt } from "node:crypto";
import { pool } from "../../db/pool.js";
import { HttpError } from "../../lib/http.js";
import { deliveryFeeFor, getDeliveryFees } from "../../lib/settings.js";

export type CheckoutInput = {
  cartId: string;
  couponCode?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
};

const ORDER_COLS = `o.id, o.order_number AS "orderNumber", o.user_id AS "userId", o.customer_name AS "customerName",
  o.email, o.phone, o.address, o.city, o.state, o.country, o.subtotal_kobo AS "subtotalKobo",
  o.delivery_fee_kobo AS "deliveryFeeKobo", o.discount_kobo AS "discountKobo", o.total_kobo AS "totalKobo",
  o.status, o.payment_status AS "paymentStatus", o.payment_reference AS "paymentReference",
  o.is_demo AS "isDemo", o.created_at AS "createdAt"`;

type OrderRow = { id: string; [key: string]: unknown };

async function withItems(orders: OrderRow[]) {
  if (orders.length === 0) return [];
  const items = (
    await pool.query(
      `SELECT oi.order_id AS "orderId", oi.product_id AS "productId", oi.product_name AS name,
              oi.unit_price_kobo AS "unitPriceKobo", oi.quantity, p.slug, p.image_url AS "imageUrl"
       FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ANY($1) ORDER BY oi.product_name`,
      [orders.map((o) => o.id)]
    )
  ).rows;
  return orders.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) }));
}

export async function getOrder(orderNumber: string) {
  const rows = (await pool.query(`SELECT ${ORDER_COLS} FROM orders o WHERE o.order_number = $1`, [orderNumber])).rows;
  return (await withItems(rows))[0] ?? null;
}

export async function listOrders(opts: { userId?: string; status?: string; limit?: number }) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.userId) { params.push(opts.userId); where.push(`o.user_id = $${params.length}`); }
  if (opts.status) { params.push(opts.status); where.push(`o.status = $${params.length}`); }
  params.push(opts.limit ?? 100);
  const rows = (
    await pool.query(
      `SELECT ${ORDER_COLS} FROM orders o ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY o.created_at DESC LIMIT $${params.length}`,
      params
    )
  ).rows;
  return withItems(rows);
}

export async function createOrder(userId: string, input: CheckoutInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const items = (
      await client.query(
        `SELECT ci.product_id AS "productId", ci.quantity, p.name, p.price_kobo AS "priceKobo", p.stock, p.status
         FROM cart_items ci JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = $1 ORDER BY p.name FOR UPDATE OF p`,
        [input.cartId]
      )
    ).rows;
    if (items.length === 0) throw new HttpError(400, "Your cart is empty.");

    for (const it of items) {
      if (it.status !== "active") throw new HttpError(409, `${it.name} is no longer available. Please remove it from your cart.`);
      if (it.stock <= 0) throw new HttpError(409, `${it.name} is out of stock. Please remove it from your cart.`);
      if (it.stock < it.quantity) throw new HttpError(409, `${it.name} only has ${it.stock} left. Please update your cart.`);
    }

    const subtotal = items.reduce((s, i) => s + i.priceKobo * i.quantity, 0);
    const deliveryFee = deliveryFeeFor(input.state, await getDeliveryFees(client));

    let discount = 0;
    if (input.couponCode) {
      const c = (
        await client.query(
          `SELECT percent_off, amount_off_kobo FROM coupons
           WHERE code = $1 AND active AND (expires_at IS NULL OR expires_at > now())`,
          [input.couponCode.trim().toUpperCase()]
        )
      ).rows[0];
      if (!c) throw new HttpError(400, "That coupon code is not valid.");
      discount = c.percent_off ? Math.floor((subtotal * c.percent_off) / 100) : Math.min(c.amount_off_kobo, subtotal);
    }
    const total = subtotal + deliveryFee - discount;

    let orderNumber = "";
    for (let i = 0; i < 10; i++) {
      const candidate = `RB-${randomInt(100000, 999999)}`;
      const taken = await client.query("SELECT 1 FROM orders WHERE order_number = $1", [candidate]);
      if (!taken.rowCount) { orderNumber = candidate; break; }
    }
    if (!orderNumber) throw new HttpError(500, "Could not create the order. Please try again.");

    const order = (
      await client.query(
        `INSERT INTO orders (order_number, user_id, customer_name, email, phone, address, city, state, country,
           subtotal_kobo, delivery_fee_kobo, discount_kobo, total_kobo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
        [orderNumber, userId, input.customerName, input.email, input.phone, input.address, input.city,
         input.state, input.country, subtotal, deliveryFee, discount, total]
      )
    ).rows[0];

    for (const it of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, product_name, unit_price_kobo, quantity) VALUES ($1,$2,$3,$4,$5)",
        [order.id, it.productId, it.name, it.priceKobo, it.quantity]
      );
      await client.query("UPDATE products SET stock = stock - $1, updated_at = now() WHERE id = $2", [it.quantity, it.productId]);
    }
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [input.cartId]);
    await client.query("UPDATE carts SET updated_at = now(), user_id = $2 WHERE id = $1", [input.cartId, userId]);

    await client.query("COMMIT");
    return (await getOrder(orderNumber))!;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(orderNumber: string, status: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const row = (await client.query("SELECT id, status FROM orders WHERE order_number = $1 FOR UPDATE", [orderNumber])).rows[0];
    if (!row) throw new HttpError(404, "Order not found.");
    if (row.status === status) { await client.query("COMMIT"); return; }
    if (row.status === "cancelled") throw new HttpError(400, "A cancelled order cannot be reopened.");

    if (status === "cancelled") {
      await client.query(
        `UPDATE products p SET stock = p.stock + oi.quantity, updated_at = now()
         FROM order_items oi WHERE oi.order_id = $1 AND oi.product_id = p.id`,
        [row.id]
      );
    }
    await client.query("UPDATE orders SET status = $1, updated_at = now() WHERE id = $2", [status, row.id]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
