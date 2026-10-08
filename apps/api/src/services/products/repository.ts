import { pool } from "../../db/pool.js";

export type ProductQuery = {
  q?: string;
  category?: string;
  minNaira?: number;
  maxNaira?: number;
  skinType?: string;
  flag?: "featured" | "new" | "best";
  sort: "newest" | "price_asc" | "price_desc" | "popular" | "rating";
  page: number;
  limit: number;
};

export const PRODUCT_SELECT = `
  SELECT p.id, p.slug, p.name, p.description, p.size, p.ingredients, p.skin_types AS "skinTypes", p.shades,
         p.price_kobo AS "priceKobo", p.compare_at_price_kobo AS "compareAtPriceKobo",
         p.stock, p.rating::float AS rating, p.review_count AS "reviewCount", p.status,
         p.is_featured AS "isFeatured", p.is_new AS "isNew", p.is_best_seller AS "isBestSeller",
         p.image_url AS "imageUrl", p.created_at AS "createdAt", p.is_demo AS "isDemo",
         p.category_id AS "categoryId", c.slug AS "categorySlug", c.name AS "categoryName"
  FROM products p JOIN categories c ON c.id = p.category_id`;

const FLAGS = {
  featured: "p.is_featured = true",
  new: "p.is_new = true",
  best: "p.is_best_seller = true",
} as const;

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
  if (q.flag) where.push(FLAGS[q.flag]);

  const whereSql = `WHERE ${where.join(" AND ")}`;
  const total = (
    await pool.query(`SELECT count(*)::int AS n FROM products p JOIN categories c ON c.id = p.category_id ${whereSql}`, params)
  ).rows[0].n as number;

  params.push(q.limit, (q.page - 1) * q.limit);
  const items = (
    await pool.query(
      `${PRODUCT_SELECT} ${whereSql} ORDER BY ${ORDER[q.sort]} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )
  ).rows;

  return { items, total, page: q.page, pageSize: q.limit };
}

export async function getProductBySlug(slug: string) {
  const r = await pool.query(`${PRODUCT_SELECT} WHERE p.slug = $1 AND p.status = 'active'`, [slug]);
  return r.rows[0] ?? null;
}

export async function getProductById(id: string) {
  const r = await pool.query(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]);
  return r.rows[0] ?? null;
}

export async function listAllProducts() {
  return (await pool.query(`${PRODUCT_SELECT} ORDER BY p.created_at DESC`)).rows;
}

export async function listCategories() {
  const r = await pool.query(
    `SELECT c.id, c.slug, c.name, c.description, c.sort_order AS "sortOrder", count(p.id)::int AS "productCount"
     FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
     GROUP BY c.id ORDER BY c.sort_order, c.name`
  );
  return r.rows;
}

export type ProductInput = {
  name: string;
  description: string;
  categoryId: string;
  priceKobo: number;
  compareAtPriceKobo?: number | null;
  size: string;
  ingredients: string;
  skinTypes: string[];
  shades: string[];
  stock: number;
  status: "active" | "draft" | "archived";
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  imageUrl?: string | null;
};

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "product";

function values(p: ProductInput) {
  return [
    p.name, p.description, p.categoryId, p.priceKobo, p.compareAtPriceKobo ?? null, p.size, p.ingredients,
    p.skinTypes, p.shades, p.stock, p.status, p.isFeatured, p.isNew, p.isBestSeller, p.imageUrl ?? null,
  ];
}

export async function createProduct(p: ProductInput) {
  const base = slugify(p.name);
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      const r = await pool.query(
        `INSERT INTO products (name, description, category_id, price_kobo, compare_at_price_kobo, size, ingredients,
           skin_types, shades, stock, status, is_featured, is_new, is_best_seller, image_url, slug)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
        [...values(p), slug]
      );
      return r.rows[0].id as string;
    } catch (err) {
      if ((err as { code?: string }).code !== "23505" || attempt === 2) throw err;
    }
  }
  throw new Error("Could not create product");
}

export async function updateProduct(id: string, p: ProductInput) {
  const r = await pool.query(
    `UPDATE products SET name=$1, description=$2, category_id=$3, price_kobo=$4, compare_at_price_kobo=$5, size=$6,
       ingredients=$7, skin_types=$8, shades=$9, stock=$10, status=$11, is_featured=$12, is_new=$13,
       is_best_seller=$14, image_url=$15, updated_at=now()
     WHERE id=$16 RETURNING id`,
    [...values(p), id]
  );
  return r.rowCount === 1;
}
