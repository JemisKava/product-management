/**
 * Test Setup
 * 
 * Loads environment variables from .env file before tests run.
 * Bun doesn't automatically load .env files in test mode,
 * so we use bunfig.toml to preload this file which uses dotenv to load the .env file.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "..", ".env");

// Load .env file from project root
const result = config({ path: envPath, override: true });

// Explicitly set variables from parsed result
if (result.parsed) {
  for (const [key, value] of Object.entries(result.parsed)) {
    process.env[key] = value;
  }
}

// Set NODE_ENV to test if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}
