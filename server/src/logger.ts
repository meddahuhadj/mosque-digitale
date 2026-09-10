import winston from "winston";
import { config } from "./config.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const stackStr = stack ? `\n${stack}` : "";
  return `${ts} [${level}] ${message}${metaStr}${stackStr}`;
});

export const logger = winston.createLogger({
  level: config.nodeEnv === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    ...(config.nodeEnv === "production"
      ? [
          new winston.transports.File({ filename: "logs/error.log", level: "error" }),
          new winston.transports.File({ filename: "logs/combined.log" }),
        ]
      : []),
  ],
});

export function childLogger(module: string) {
  return logger.child({ module });
}
