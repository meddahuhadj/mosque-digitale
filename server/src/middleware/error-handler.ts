import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { childLogger } from "../logger.js";

const log = childLogger("error-handler");

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const appErr = err as AppError;
  const statusCode = appErr.statusCode || 500;

  if (statusCode >= 500) {
    log.error(`${req.method} ${req.path} - ${err.message}`, { stack: err.stack });
  } else {
    log.warn(`${req.method} ${req.path} - ${err.message}`);
  }

  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}
