import { NextResponse } from "next/server";
import { getDatabaseClient, hasDatabaseConfig } from "@/lib/database";

export const dynamic = "force-dynamic";

/** Matches the ids produced by crypto.randomUUID(). */
const idPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Only formats the CMS accepts are echoed back as the response type. */
const allowedTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/ogg"
]);

/**
 * Serves an image or video uploaded through the editor.
 *
 * Uploads live in the content store rather than on disk so they survive on hosts
 * with a read-only filesystem. Each upload gets a fresh id, so the response is
 * safe to cache permanently.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!hasDatabaseConfig() || !idPattern.test(params.id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT mime_type, byte_size, data FROM media_assets WHERE id = ? LIMIT 1",
      args: [params.id]
    });

    const row = result.rows[0];

    if (!row || !row.data) {
      return new NextResponse("Not found", { status: 404 });
    }

    const declared = String(row.mime_type ?? "");
    const contentType = allowedTypes.has(declared)
      ? declared
      : "application/octet-stream";

    const data = row.data as ArrayBuffer | Uint8Array;
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    // Copy into a plain ArrayBuffer so the value matches BodyInit exactly.
    const body = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        // The store holds editor uploads, so never let a browser sniff a
        // different type out of the bytes.
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline"
      }
    });
  } catch (error) {
    console.error("[media] failed to serve asset", error);
    return new NextResponse("Not found", { status: 404 });
  }
}
