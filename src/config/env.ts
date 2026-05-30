import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const ENV_PATHS = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
];

export function loadEnv(): void {
  for (const envPath of ENV_PATHS) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  }
}

export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  return value ?? defaultValue ?? '';
}

export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]?.toLowerCase();
  if (!value) return defaultValue;
  return ['true', '1', 'yes'].includes(value);
}

export function getEnvList(key: string, defaultValue: string[] = []): string[] {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(',').map(s => s.trim()).filter(Boolean);
}
