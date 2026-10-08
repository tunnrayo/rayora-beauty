import { Router } from "express";
import { z } from "zod";
import { getProductBySlug, listCategories, listProducts } from "./repository.js";

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

productsRouter.get("/", async (req, res, next) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid search options." });
    return;
  }
  const { minPrice, maxPrice, ...rest } = parsed.data;
  try {
    res.json(await listProducts({ ...rest, minNaira: minPrice, maxNaira: maxPrice }));
  } catch (err) {
    next(err);
  }
});

// Must come before "/:slug" so "categories" is not treated as a product name
productsRouter.get("/categories", async (_req, res, next) => {
  try {
    res.json({ items: await listCategories() });
  } catch (err) {
    next(err);
  }
});

productsRouter.get("/:slug", async (req, res, next) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});
