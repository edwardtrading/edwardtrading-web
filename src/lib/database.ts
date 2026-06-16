import { createClient } from "@libsql/client";

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_AUTH_TOKEN);
}

export function getDatabaseClient() {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "The production content service is not configured."
    );
  }

  return createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN as string
  });
}

export function parseJsonArray(value: unknown): string[] {
  if (typeof value !== "string" || !value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function parseJsonObject(value: unknown): Record<string, string> {
  if (typeof value !== "string" || !value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? Object.fromEntries(
          Object.entries(parsed).map(([key, item]) => [key, String(item)])
        )
      : {};
  } catch {
    return {};
  }
}
