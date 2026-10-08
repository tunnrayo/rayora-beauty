import { Router } from "express";

export function createServiceRouter(name: string): Router {
  const router = Router();
  router.get("/status", (_req, res) => {
    res.json({ service: name, status: "ready" });
  });
  return router;
}
