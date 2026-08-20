import { createClient } from "@libsql/client";

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_AUTH_TOKEN);
}

/**
 * The Turso HTTP client issues its queries through global `fetch`, which the
 * Next.js App Router patches and caches. Left alone, Next stores every query
 * response in its data cache with a one year revalidate, so content edited in
 * the CMS keeps serving the previous value until the next deploy. Opting each
 * database request out of that cache keeps reads live.
 */
const uncachedFetch: typeof globalThis.fetch = (input, init) =>
  globalThis.fetch(input, { ...init, cache: "no-store" });

export function getDatabaseClient() {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "The production content service is not configured."
    );
  }

  return createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN as string,
    fetch: uncachedFetch
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
