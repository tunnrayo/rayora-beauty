import { pool } from "../../db/pool.js";

export type ProductQuery = {
  q?: string;
  category?: string;
  minNaira?: number;
  maxNaira?: number;
  skinType?: string;
  sort: "newest" | "price_asc" | "price_desc" | "popular" | "rating";
  page: number;
  limit: number;
};

const SELECT = `
  SELECT p.id, p.slug, p.name, p.description, p.size, p.ingredients, p.skin_types AS "skinTypes", p.shades,
         p.price_kobo AS "priceKobo", p.compare_at_price_kobo AS "compareAtPriceKobo",
         p.stock, p.rating::float AS rating, p.review_count AS "reviewCount", p.status,
         p.is_featured AS "isFeatured", p.is_new AS "isNew", p.is_best_seller AS "isBestSeller",
         p.image_url AS "imageUrl", p.created_at AS "createdAt",
         c.slug AS "categorySlug", c.name AS "categoryName"
  FROM products p JOIN categories c ON c.id = p.category_id`;

const ORDER: Record<ProductQuery["sort"], string> = {
  newest: "p.created_at DESC",
  price_asc: "p.price_kobo ASC",
  price_desc: "p.price_kobo DESC",
  popular: "p.review_count DESC",
  rating: "p.rating DESC, p.review_count DESC",
};

export async function listProducts(q: ProductQuery) {
  const where: string[] = ["p.status = 'active'"];
  const params: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    where.push(sql.replace("?", `$${params.length}`));
  };

  if (q.q) add("p.name ILIKE ?", `%${q.q}%`);
  if (q.category) add("c.slug = ?", q.category);
  if (q.minNaira !== undefined) add("p.price_kobo >= ?", q.minNaira * 100);
  if (q.maxNaira !== undefined) add("p.price_kobo <= ?", q.maxNaira * 100);
  if (q.skinType) add("? = ANY(p.skin_types)", q.skinType);

  const whereSql = `WHERE ${where.join(" AND ")}`;
  const total = (
    await pool.query(`SELECT count(*)::int AS n FROM products p JOIN categories c ON c.id = p.category_id ${whereSql}`, params)
  ).rows[0].n as number;

  params.push(q.limit, (q.page - 1) * q.limit);
  const items = (
    await pool.query(
      `${SELECT} ${whereSql} ORDER BY ${ORDER[q.sort]} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )
  ).rows;

  return { items, total, page: q.page, pageSize: q.limit };
}

export async function getProductBySlug(slug: string) {
  const r = await pool.query(`${SELECT} WHERE p.slug = $1 AND p.status = 'active'`, [slug]);
  return r.rows[0] ?? null;
}

export async function listCategories() {
  const r = await pool.query(
    `SELECT c.slug, c.name, c.description, count(p.id)::int AS "productCount"
     FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
     GROUP BY c.id ORDER BY c.sort_order`
  );
  return r.rows;
}
