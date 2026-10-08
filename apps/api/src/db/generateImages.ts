import { pool } from "./pool.js";
import { generateImage } from "../services/ai/hf.js";

// Generates a photo for every active product that has none. Run: npm run generate-images -w apps/api
async function run() {
  const rows = (
    await pool.query(
      `SELECT p.id, p.name, p.description, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'active' AND p.image_url IS NULL ORDER BY p.name`
    )
  ).rows;
  console.log(`${rows.length} products need images.`);

  for (const p of rows) {
    const prompt =
      `Clean premium beauty product photography of a ${p.category} product: ${p.name}. ${p.description} ` +
      "Warm neutral studio surface, soft natural lighting, elegant composition, clean product presentation, " +
      "subtle beauty focused styling, sharp focus, undistorted packaging, no text, no logos, no watermark.";
    try {
      const img = await generateImage(prompt, "4:5");
      const saved = (await pool.query("INSERT INTO generated_images (mime, data, prompt) VALUES ($1,$2,$3) RETURNING id", [img.mime, img.data, prompt])).rows[0];
      await pool.query("UPDATE products SET image_url = $1, updated_at = now() WHERE id = $2", [`/media/${saved.id}`, p.id]);
      console.log(`Done: ${p.name}`);
    } catch (err) {
      console.error(`Failed: ${p.name} - ${(err as Error).message}`);
    }
  }
}

run().finally(() => pool.end());
