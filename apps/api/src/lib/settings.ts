import type { Pool, PoolClient } from "pg";
import { pool } from "../db/pool.js";

export type DeliveryFees = { lagosKobo: number; otherKobo: number };

export async function getDeliveryFees(db: Pool | PoolClient = pool): Promise<DeliveryFees> {
  const rows = (
    await db.query(
      "SELECT key, value FROM store_settings WHERE key IN ('delivery_fee_lagos_kobo','delivery_fee_other_kobo')"
    )
  ).rows as { key: string; value: string }[];
  const map = Object.fromEntries(rows.map((r) => [r.key, Number(r.value)]));
  return {
    lagosKobo: map.delivery_fee_lagos_kobo ?? 250000,
    otherKobo: map.delivery_fee_other_kobo ?? 450000,
  };
}

export function deliveryFeeFor(state: string, fees: DeliveryFees): number {
  return state.trim().toLowerCase() === "lagos" ? fees.lagosKobo : fees.otherKobo;
}
