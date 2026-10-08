import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { TypeOf, ZodTypeAny } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function parse<T extends ZodTypeAny>(schema: T, data: unknown): TypeOf<T> {
  const r = schema.safeParse(data);
  if (!r.success) {
    const issue = r.error.issues[0];
    const field = issue?.path.join(".");
    throw new HttpError(400, field ? `${field}: ${issue?.message}` : issue?.message ?? "Invalid input.");
  }
  return r.data;
}
