import { pool } from "./pool.js";

const categories = [
  { slug: "skincare", name: "Skincare", description: "Gentle, effective care for every skin tone.", sort: 1 },
  { slug: "makeup", name: "Makeup", description: "Colour and coverage with shades that include everyone.", sort: 2 },
  { slug: "body-care", name: "Body Care", description: "Softening, scented care from head to toe.", sort: 3 },
  { slug: "fragrance", name: "Fragrance", description: "Scents with warmth and staying power.", sort: 4 },
];

type Seed = {
  cat: string; name: string; naira: number; was?: number; size: string; stock: number;
  rating: number; reviews: number; flags: ("f" | "n" | "b")[]; desc: string; ing: string;
  skin?: string[]; shades?: string[];
};

const all = ["Dry", "Oily", "Combination", "Sensitive", "Normal"];

const products: Seed[] = [
  { cat: "skincare", name: "Radiance Glow Serum", naira: 18500, was: 22000, size: "30ml", stock: 42, rating: 4.7, reviews: 128, flags: ["f", "b"],
    desc: "A lightweight serum that leaves skin looking even and lit from within. Absorbs quickly and sits well under makeup.",
    ing: "Water, Niacinamide, Glycerin, Licorice Root Extract, Hyaluronic Acid, Panthenol", skin: all },
  { cat: "skincare", name: "Hydrating Face Cream", naira: 14500, size: "50ml", stock: 35, rating: 4.6, reviews: 96, flags: ["f"],
    desc: "A soft, rich cream that keeps skin comfortable all day without feeling heavy in Lagos humidity.",
    ing: "Water, Shea Butter, Squalane, Glycerin, Ceramide NP, Tocopherol", skin: ["Dry", "Normal", "Combination"] },
  { cat: "skincare", name: "Gentle Foaming Cleanser", naira: 8500, size: "150ml", stock: 60, rating: 4.5, reviews: 74, flags: ["b"],
    desc: "Lifts away sunscreen, sweat and makeup and leaves skin clean, never tight.",
    ing: "Water, Coco-Glucoside, Glycerin, Aloe Vera Juice, Allantoin", skin: all },
  { cat: "skincare", name: "Vitamin C Brightening Serum", naira: 16500, was: 19500, size: "30ml", stock: 28, rating: 4.4, reviews: 83, flags: ["n"],
    desc: "A daily serum that helps fade the look of dark marks and uneven tone over time.",
    ing: "Water, Ascorbyl Glucoside, Glycerin, Ferulic Acid, Sodium Hyaluronate", skin: ["Normal", "Combination", "Oily", "Dry"] },
  { cat: "skincare", name: "Daily SPF 50 Sunscreen", naira: 12500, size: "50ml", stock: 55, rating: 4.8, reviews: 211, flags: ["f", "b"],
    desc: "Broad spectrum protection with no white cast on deep skin tones. Light enough to wear every day.",
    ing: "Water, Zinc Oxide (non nano), Squalane, Glycerin, Vitamin E, Aloe Vera", skin: all },

  { cat: "makeup", name: "Velvet Matte Lipstick", naira: 6500, size: "3.5g", stock: 80, rating: 4.6, reviews: 164, flags: ["f", "b"],
    desc: "Rich, comfortable colour with a soft matte finish. Shades chosen to flatter deep, medium and light skin.",
    ing: "Ricinus Communis Seed Oil, Candelilla Wax, Mica, Vitamin E, Iron Oxides", shades: ["Cocoa Rose", "Burnt Terracotta", "Deep Plum", "Soft Mauve", "True Red", "Warm Nude"] },
  { cat: "makeup", name: "Soft Glow Foundation", naira: 14000, size: "30ml", stock: 46, rating: 4.5, reviews: 142, flags: ["f"],
    desc: "Medium buildable coverage with a natural skin finish. Available in 24 shades from fair to deep, with warm, neutral and cool undertones.",
    ing: "Water, Isododecane, Glycerin, Titanium Dioxide, Iron Oxides, Squalane", skin: ["Normal", "Combination", "Dry"],
    shades: ["110 Porcelain", "230 Sand", "320 Honey", "410 Caramel", "510 Mocha", "610 Espresso", "650 Ebony"] },
  { cat: "makeup", name: "Define and Lift Mascara", naira: 7500, size: "9ml", stock: 52, rating: 4.3, reviews: 58, flags: ["n"],
    desc: "Separates and lengthens lashes with a smudge resistant black formula that lasts through a long day.",
    ing: "Water, Beeswax, Carnauba Wax, Iron Oxides, Panthenol", shades: ["Black"] },
  { cat: "makeup", name: "Cream Blush", naira: 7000, size: "6g", stock: 38, rating: 4.7, reviews: 89, flags: ["n", "f"],
    desc: "A soft cream that melts into skin for a natural flush. Pigmented enough to show up beautifully on deeper tones.",
    ing: "Caprylic Triglyceride, Mica, Iron Oxides, Squalane, Vitamin E", shades: ["Peach Glow", "Berry Flush", "Warm Clay", "Rosewood"] },
  { cat: "makeup", name: "Radiant Highlighter", naira: 8000, was: 9500, size: "8g", stock: 7, rating: 4.4, reviews: 47, flags: [],
    desc: "A finely milled powder that adds a soft, glowing finish to cheekbones, brow bones and shoulders.",
    ing: "Talc, Mica, Magnesium Stearate, Iron Oxides, Squalane", shades: ["Champagne Gold", "Bronze Honey", "Rose Pearl"] },

  { cat: "body-care", name: "Nourishing Body Butter", naira: 9500, size: "250ml", stock: 48, rating: 4.8, reviews: 187, flags: ["f", "b"],
    desc: "A thick, whipped butter that leaves skin soft and glowing, with no ashy finish.",
    ing: "Shea Butter, Cocoa Butter, Mango Butter, Coconut Oil, Vitamin E", skin: ["Dry", "Normal", "Sensitive"] },
  { cat: "body-care", name: "Vanilla Silk Body Lotion", naira: 7500, size: "300ml", stock: 65, rating: 4.5, reviews: 102, flags: ["n"],
    desc: "A fast absorbing lotion with a warm vanilla scent. Light enough for hot weather.",
    ing: "Water, Glycerin, Shea Butter, Vanilla Extract, Allantoin, Tocopherol", skin: all },
  { cat: "body-care", name: "Exfoliating Sugar Scrub", naira: 6500, was: 8000, size: "200g", stock: 0, rating: 4.6, reviews: 71, flags: [],
    desc: "A sugar and oil scrub that smooths rough patches on elbows, knees and feet and leaves a soft, conditioned feel.",
    ing: "Sucrose, Sweet Almond Oil, Coconut Oil, Shea Butter, Vitamin E", skin: ["Normal", "Dry", "Combination"] },
  { cat: "body-care", name: "Hydrating Body Oil", naira: 8500, size: "100ml", stock: 33, rating: 4.7, reviews: 64, flags: ["n"],
    desc: "A dry finish oil that gives skin a healthy sheen. Lovely on damp skin after a shower.",
    ing: "Jojoba Oil, Sweet Almond Oil, Marula Oil, Vitamin E, Fragrance", skin: ["Dry", "Normal"] },

  { cat: "fragrance", name: "Rayora Bloom Eau de Parfum", naira: 32000, size: "50ml", stock: 22, rating: 4.8, reviews: 93, flags: ["f", "b"],
    desc: "A bright floral scent of jasmine and orange blossom settling into soft musk and sandalwood.",
    ing: "Alcohol Denat., Parfum, Water, Linalool, Limonene" },
  { cat: "fragrance", name: "Midnight Rose Eau de Parfum", naira: 35000, size: "50ml", stock: 18, rating: 4.9, reviews: 77, flags: ["n", "f"],
    desc: "Deep rose with a trace of oud and amber. A confident evening scent that lasts.",
    ing: "Alcohol Denat., Parfum, Water, Geraniol, Citronellol" },
  { cat: "fragrance", name: "Golden Aura Body Mist", naira: 11500, size: "150ml", stock: 40, rating: 4.4, reviews: 59, flags: ["b"],
    desc: "A light, shimmer free mist with notes of pear, vanilla and warm amber for everyday wear.",
    ing: "Alcohol Denat., Water, Parfum, Glycerin, Linalool" },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function flagSet(key: string): Promise<boolean> {
  const r = await pool.query("SELECT 1 FROM store_settings WHERE key = $1", [key]);
  return (r.rowCount ?? 0) > 0;
}
async function setFlag(key: string) {
  await pool.query("INSERT INTO store_settings (key, value) VALUES ($1, 'done') ON CONFLICT (key) DO NOTHING", [key]);
}

// Clearly marked demo orders so the admin dashboard looks alive. They are flagged is_demo = true.
const demoOrders = [
  { n: 1, name: "Demo Customer A", city: "Ikeja", state: "Lagos", days: 12, status: "delivered", picks: [["radiance-glow-serum", 1], ["daily-spf-50-sunscreen", 2]] },
  { n: 2, name: "Demo Customer B", city: "Abuja", state: "FCT", days: 10, status: "delivered", picks: [["velvet-matte-lipstick", 2]] },
  { n: 3, name: "Demo Customer C", city: "Ibadan", state: "Oyo", days: 8, status: "shipped", picks: [["nourishing-body-butter", 1], ["vanilla-silk-body-lotion", 1]] },
  { n: 4, name: "Demo Customer D", city: "Lekki", state: "Lagos", days: 6, status: "processing", picks: [["midnight-rose-eau-de-parfum", 1]] },
  { n: 5, name: "Demo Customer E", city: "Port Harcourt", state: "Rivers", days: 4, status: "confirmed", picks: [["soft-glow-foundation", 1], ["cream-blush", 1]] },
  { n: 6, name: "Demo Customer F", city: "Yaba", state: "Lagos", days: 3, status: "confirmed", picks: [["gentle-foaming-cleanser", 2], ["hydrating-face-cream", 1]] },
  { n: 7, name: "Demo Customer G", city: "Enugu", state: "Enugu", days: 1, status: "pending", picks: [["rayora-bloom-eau-de-parfum", 1]] },
  { n: 8, name: "Demo Customer H", city: "Surulere", state: "Lagos", days: 0, status: "cancelled", picks: [["golden-aura-body-mist", 1]] },
] as const;

async function seedDemoOrders() {
  for (const o of demoOrders) {
    const number = `RB-DEMO-${String(o.n).padStart(3, "0")}`;
    const items: { id: string; name: string; price: number; qty: number }[] = [];
    for (const [slug, qty] of o.picks) {
      const r = await pool.query("SELECT id, name, price_kobo FROM products WHERE slug = $1", [slug]);
      if (r.rows[0]) items.push({ id: r.rows[0].id, name: r.rows[0].name, price: r.rows[0].price_kobo, qty });
    }
    if (items.length === 0) continue;
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const fee = o.state === "Lagos" ? 250000 : 450000;
    const paid = o.status !== "pending" && o.status !== "cancelled";
    const created = await pool.query(
      `INSERT INTO orders (order_number, customer_name, email, phone, address, city, state, subtotal_kobo, delivery_fee_kobo,
         total_kobo, status, payment_status, is_demo, created_at)
       VALUES ($1,$2,'demo@example.com','08000000000','Demo address',$3,$4,$5,$6,$7,$8,$9,true, now() - ($10::text || ' days')::interval)
       ON CONFLICT (order_number) DO NOTHING RETURNING id`,
      [number, o.name, o.city, o.state, subtotal, fee, subtotal + fee, o.status, paid ? "paid" : "unpaid", String(o.days)]
    );
    if (created.rows[0]) {
      for (const i of items) {
        await pool.query(
          "INSERT INTO order_items (order_id, product_id, product_name, unit_price_kobo, quantity) VALUES ($1,$2,$3,$4,$5)",
          [created.rows[0].id, i.id, i.name, i.price, i.qty]
        );
      }
    }
  }
}

async function seed() {
  // Seed the catalogue only once, so products you delete later do not come back.
  if (await flagSet("catalogue_seeded")) {
    console.log("Catalogue already set up, skipping.");
  } else {
    const existing = (await pool.query("SELECT count(*)::int AS n FROM products")).rows[0].n as number;
    if (existing > 0) {
      await setFlag("catalogue_seeded");
      console.log("Products already exist, skipping catalogue seed.");
    } else {
      const catIds: Record<string, string> = {};
      for (const c of categories) {
        const r = await pool.query(
          `INSERT INTO categories (slug, name, description, sort_order) VALUES ($1,$2,$3,$4)
           ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order
           RETURNING id`,
          [c.slug, c.name, c.description, c.sort]
        );
        catIds[c.slug] = r.rows[0].id;
      }
      for (const p of products) {
        await pool.query(
          `INSERT INTO products (slug, name, description, category_id, price_kobo, compare_at_price_kobo, size, ingredients,
             skin_types, shades, stock, rating, review_count, is_featured, is_new, is_best_seller, is_demo)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true)
           ON CONFLICT (slug) DO NOTHING`,
          [
            slugify(p.name), p.name, p.desc, catIds[p.cat], p.naira * 100, p.was ? p.was * 100 : null, p.size, p.ing,
            p.skin ?? [], p.shades ?? [], p.stock, p.rating, p.reviews,
            p.flags.includes("f"), p.flags.includes("n"), p.flags.includes("b"),
          ]
        );
      }
      await setFlag("catalogue_seeded");
      console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
    }
  }

  await pool.query(
    `INSERT INTO store_settings (key, value) VALUES ('delivery_fee_lagos_kobo','250000'), ('delivery_fee_other_kobo','450000')
     ON CONFLICT (key) DO NOTHING`
  );

  if (!(await flagSet("demo_orders_seeded"))) {
    await seedDemoOrders();
    await setFlag("demo_orders_seeded");
    console.log("Added demo orders (marked as demo data).");
  }

  if (!(await flagSet("welcome_banner_seeded"))) {
    await pool.query("INSERT INTO banners (title, subtitle, link_url) VALUES ($1,$2,$3)", [
      "Welcome to Rayora Beauty", "Shades and formulas made for every skin tone.", "/shop",
    ]);
    await setFlag("welcome_banner_seeded");
  }
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
