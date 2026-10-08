import { pool } from "../../db/pool.js";
import { getOrder } from "../orders/repository.js";
import { notifyOrderPaid } from "../notifications/email.js";

/** Marks an order paid exactly once. Returns true if this call did the update. */
export async function markPaid(orderNumber: string, reference: string, demo: boolean): Promise<boolean> {
  const r = await pool.query(
    `UPDATE orders SET payment_status = 'paid', payment_reference = $2, is_demo = $3,
       status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END, updated_at = now()
     WHERE order_number = $1 AND payment_status <> 'paid' AND status <> 'cancelled'`,
    [orderNumber, reference, demo]
  );
  if (r.rowCount) {
    const order = await getOrder(orderNumber);
    if (order) void notifyOrderPaid(order as never);
    return true;
  }
  return false;
}
