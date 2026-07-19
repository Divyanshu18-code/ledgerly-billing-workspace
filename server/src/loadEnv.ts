// src/loadEnv.ts
import * as path from 'path';
import * as dotenv from 'dotenv';
// Resolve .env relative to project root (two levels up from compiled file)
const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Failed to load .env from', envPath, result.error);
} else {
  console.log('Loaded .env from', envPath);
}
