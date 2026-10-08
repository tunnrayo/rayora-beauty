import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { HttpError } from "./http.js";

export type AuthInfo = { userId: string; role: "customer" | "admin" };

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthInfo;
  }
}

function secret(): string {
  if (!env.AUTH_SECRET) throw new HttpError(500, "The server is not fully set up yet.");
  return env.AUTH_SECRET;
}

export function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, secret(), { expiresIn: "7d" });
}

function readToken(req: Request): AuthInfo | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(header.slice(7), secret()) as jwt.JwtPayload;
    return { userId: String(payload.sub), role: payload.role === "admin" ? "admin" : "customer" };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = readToken(req);
  if (!auth) return next(new HttpError(401, "Please log in to continue."));
  req.auth = auth;
  next();
}

/** Admin access is confirmed against the database, so removing a role takes effect immediately. */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = readToken(req);
    if (!auth) throw new HttpError(401, "Please log in to continue.");
    const row = (await pool.query("SELECT role FROM users WHERE id = $1", [auth.userId])).rows[0];
    if (!row || row.role !== "admin") throw new HttpError(403, "You do not have access to this area.");
    req.auth = { userId: auth.userId, role: "admin" };
    next();
  } catch (err) {
    next(err);
  }
}
