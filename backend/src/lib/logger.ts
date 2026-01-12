/**
 * Logger Configuration
 *
 * Winston logger with console + file transports.
 * Uses JSON logs in production and colorized logs in development.
 */

import winston from "winston";
import fs from "node:fs";
import path from "node:path";
import { env, isDev, isTest } from "../config/env.ts";

const logDir = env.LOG_DIR;
const shouldLogToFile = !isDev && !isTest && Boolean(logDir);

if (shouldLogToFile && logDir && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true })
);

const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaKeys = Object.keys(meta);
    const metaString = metaKeys.length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${metaString}`;
  })
);

const jsonFormat = winston.format.combine(baseFormat, winston.format.json());

const transports: winston.transport[] = [
  new winston.transports.Console({ level: env.LOG_LEVEL }),
];

if (shouldLogToFile && logDir) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
      level: env.LOG_LEVEL,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
      tailable: true,
    })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: isDev ? consoleFormat : jsonFormat,
  defaultMeta: {
    service: env.SERVICE_NAME,
    env: env.NODE_ENV,
  },
  transports,
  exitOnError: false,
  silent: isTest,
});
