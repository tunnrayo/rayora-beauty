import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { pool } from "./pool.js";

async function createAdmin() {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL and ADMIN_PASSWORD are not set, skipping admin setup.");
    return;
  }
  if (password.length < 10) {
    console.error("ADMIN_PASSWORD must be at least 10 characters. Admin not created.");
    process.exitCode = 1;
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1,$2,'Rayora Admin','admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [email, hash]
  );
  console.log(`Admin account ready for ${email}`);
}

createAdmin()
  .catch((err) => {
    console.error("Admin setup failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
