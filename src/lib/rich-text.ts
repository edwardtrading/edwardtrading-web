/**
 * Server-side sanitizer for rich text authored in the CMS editor.
 *
 * The editor stores HTML so that headings, bold text, tables, and links survive
 * a round trip. Everything an editor writes is passed through `sanitizeRichText`
 * before it is stored, so the public pages never output markup that was not
 * explicitly allowed here.
 */

const allowedTags: Record<string, string[]> = {
  p: [],
  br: [],
  hr: [],
  h1: ["id"],
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  h5: ["id"],
  h6: ["id"],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  mark: [],
  sub: [],
  sup: [],
  small: [],
  ul: [],
  ol: ["start"],
  li: [],
  dl: [],
  dt: [],
  dd: [],
  a: ["href", "title", "target", "rel"],
  blockquote: ["cite"],
  pre: [],
  code: [],
  table: [],
  caption: [],
  thead: [],
  tbody: [],
  tfoot: [],
  tr: [],
  th: ["colspan", "rowspan", "scope"],
  td: ["colspan", "rowspan"],
  img: ["src", "alt", "width", "height", "loading"],
  figure: [],
  figcaption: [],
  div: [],
  span: []
};

const voidTags = new Set(["br", "hr", "img"]);

/** Tags whose entire subtree is discarded rather than unwrapped. */
const strippedTags = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "template",
  "svg",
  "math",
  "form",
  "input",
  "select",
  "textarea",
  "button",
  "link",
  "meta",
  "base",
  "title",
  "head",
  "html",
  "body"
]);

const attributePattern =
  /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

const looseAmpersand = /&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#[xX][0-9a-fA-F]{1,6});)/g;

function escapeText(value: string) {
  return value
    .replace(looseAmpersand, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string) {
  return value
    .replace(looseAmpersand, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeUrl(value: string, allowDataImage = false) {
  const normalized = value
    .replace(/&#(\d+);?/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);?/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/[\u0000-\u0020]/g, "")
    .toLowerCase();

  if (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("vbscript:") ||
    normalized.startsWith("file:")
  ) {
    return false;
  }

  if (normalized.startsWith("data:")) {
    return (
      allowDataImage &&
      /^data:image\/(png|jpe?g|gif|webp|avif);base64,/.test(normalized)
    );
  }

  return true;
}

function sanitizeAttributes(tag: string, raw: string) {
  const allowed = allowedTags[tag];
  const output: string[] = [];
  let isBlankTarget = false;
  let relValue = "";

  attributePattern.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(raw))) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";

    if (!allowed.includes(name)) {
      continue;
    }

    if ((name === "href" || name === "src") && !isSafeUrl(value, name === "src")) {
      continue;
    }

    if (name === "target") {
      if (value !== "_blank") {
        continue;
      }
      isBlankTarget = true;
    }

    if (name === "rel") {
      relValue = value;
      continue;
    }

    output.push(`${name}="${escapeAttribute(value)}"`);
  }

  if (tag === "a") {
    const rel = new Set(relValue.split(/\s+/).filter(Boolean));
    if (isBlankTarget) {
      rel.add("noopener");
      rel.add("noreferrer");
    }
    if (rel.size > 0) {
      output.push(`rel="${escapeAttribute(Array.from(rel).join(" "))}"`);
    }
  }

  if (tag === "img") {
    if (!output.some((attribute) => attribute.startsWith("src="))) {
      return null;
    }
    if (!output.some((attribute) => attribute.startsWith("alt="))) {
      output.push('alt=""');
    }
    if (!output.some((attribute) => attribute.startsWith("loading="))) {
      output.push('loading="lazy"');
    }
  }

  return output;
}

/**
 * Returns HTML containing only allowlisted tags and attributes, with every tag
 * balanced. Unknown tags are unwrapped so their text survives; script-like tags
 * are removed along with their contents.
 */
export function sanitizeRichText(value: string) {
  if (!value) {
    return "";
  }

  const input = value.replace(/<!--[\s\S]*?-->/g, "");
  const tokenPattern = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  const openStack: string[] = [];
  const output: string[] = [];

  let cursor = 0;
  let skipUntil: string | null = null;
  let skipDepth = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(input))) {
    const token = match[0];
    const tag = match[1].toLowerCase();
    const rawAttributes = match[2] ?? "";
    const isClosing = token.startsWith("</");
    const text = input.slice(cursor, match.index);
    cursor = match.index + token.length;

    if (skipUntil) {
      if (tag === skipUntil) {
        if (isClosing) {
          skipDepth -= 1;
          if (skipDepth <= 0) {
            skipUntil = null;
          }
        } else if (!token.endsWith("/>")) {
          skipDepth += 1;
        }
      }
      continue;
    }

    if (text) {
      output.push(escapeText(text));
    }

    if (strippedTags.has(tag)) {
      if (!isClosing && !token.endsWith("/>")) {
        skipUntil = tag;
        skipDepth = 1;
      }
      continue;
    }

    if (!(tag in allowedTags)) {
      continue;
    }

    if (isClosing) {
      const index = openStack.lastIndexOf(tag);
      if (index === -1) {
        continue;
      }
      while (openStack.length > index) {
        output.push(`</${openStack.pop()}>`);
      }
      continue;
    }

    const attributes = sanitizeAttributes(tag, rawAttributes);
    if (attributes === null) {
      continue;
    }

    const serialized = attributes.length > 0 ? ` ${attributes.join(" ")}` : "";

    if (voidTags.has(tag)) {
      output.push(`<${tag}${serialized} />`);
      continue;
    }

    output.push(`<${tag}${serialized}>`);
    openStack.push(tag);
  }

  const trailing = input.slice(cursor);
  if (trailing) {
    output.push(escapeText(trailing));
  }

  while (openStack.length > 0) {
    output.push(`</${openStack.pop()}>`);
  }

  return output.join("").trim();
}

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”"
};

/** Flattens rich text to a single line, used for previews and meta fallbacks. */
export function htmlToPlainText(value: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|figcaption)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (entity, name: string) => namedEntities[name] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

/** Trims to a whole word at or below `limit` characters. */
export function truncateText(value: string, limit: number) {
  const text = value.trim();

  if (text.length <= limit) {
    return text;
  }

  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");
  const trimmed = lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped;

  return `${trimmed.replace(/[\s.,;:!-]+$/, "")}…`;
}

export function readingTimeMinutes(html: string) {
  const words = htmlToPlainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Adds stable ids to headings so in-page anchors and a table of contents work. */
export function withHeadingIds(html: string) {
  const used = new Set<string>();

  return html.replace(
    /<(h[1-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag: string, attributes: string, inner: string) => {
      if (/\sid\s*=/.test(attributes)) {
        return full;
      }

      const base =
        htmlToPlainText(inner)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "section";

      let id = base;
      let suffix = 2;
      while (used.has(id)) {
        id = `${base}-${suffix}`;
        suffix += 1;
      }
      used.add(id);

      return `<${tag}${attributes} id="${id}">${inner}</${tag}>`;
    }
  );
}

export type HeadingOutline = { id: string; text: string; level: number };

export function extractHeadings(html: string): HeadingOutline[] {
  const headings: HeadingOutline[] = [];
  const pattern = /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html))) {
    const idMatch = /\sid\s*=\s*"([^"]*)"/.exec(match[2]);
    const text = htmlToPlainText(match[3]);

    if (idMatch && text) {
      headings.push({ id: idMatch[1], text, level: Number(match[1][1]) });
    }
  }

  return headings;
}
