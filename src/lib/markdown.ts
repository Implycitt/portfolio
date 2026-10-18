import { Marked, type Tokens } from "marked";
import katex from "katex";
import hljs from "highlight.js/lib/common";

function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex.trim(), {
    displayMode,
    throwOnError: false,
    strict: false,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(x[\da-f]+|\d+);?/gi, (entity, digits: string) => {
      const code =
        digits[0]?.toLowerCase() === "x"
          ? Number.parseInt(digits.slice(1), 16)
          : Number.parseInt(digits, 10);
      return Number.isInteger(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : entity;
    })
    .replace(
      /&(amp|lt|gt|quot|apos|colon|tab|newline);/gi,
      (entity, name: string) => {
        const values: Record<string, string> = {
          amp: "&",
          lt: "<",
          gt: ">",
          quot: '"',
          apos: "'",
          colon: ":",
          tab: "\t",
          newline: "\n",
        };
        return values[name.toLowerCase()] ?? entity;
      },
    );
}

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const EXPLICIT_SCHEME = /^[a-z][a-z\d+.-]*:/i;

function isSafeUrl(value: string): boolean {
  let decoded = value;
  for (let pass = 0; pass < 4; pass += 1) {
    const next = decodeEntities(decoded).replace(/&colon;/gi, ":");
    if (next === decoded) break;
    decoded = next;
  }
  const normalized = decoded.trim().replace(/[\u0000-\u0020]+/g, "");
  if (!normalized || /^[#/? .]/.test(normalized)) return true;
  if (!EXPLICIT_SCHEME.test(normalized)) return true;
  try {
    return SAFE_PROTOCOLS.has(new URL(normalized).protocol);
  } catch {
    return false;
  }
}

function resolveUrl(value: string, baseUrl: string): string {
  const decoded = decodeEntities(value);
  if (
    !decoded ||
    /^(?:https?:)?\/\//i.test(decoded) ||
    EXPLICIT_SCHEME.test(decoded) ||
    decoded.startsWith("#")
  ) {
    return decoded;
  }

  const repoRelative = decoded.replace(/^\/(?!\/)/, "");
  try {
    return new URL(repoRelative, baseUrl).href;
  } catch {
    return decoded;
  }
}

interface MathToken {
  type: "math";
  raw: string;
  tex: string;
  displayMode: boolean;
}

interface AlertToken {
  type: "alert";
  raw: string;
  kind: string;
  body: string;
}

type GenericToken = {
  type: string;
  raw: string;
  [key: string]: unknown;
};

const ALERT_KINDS = ["note", "tip", "important", "warning", "caution"];
const ALERT_GLYPH: Record<string, string> = {
  note: "▣",
  tip: "◆",
  important: "▲",
  warning: "▲",
  caution: "✕",
};

function createMarkdownParser(imageBaseUrl?: string, linkBaseUrl?: string) {
  const parser = new Marked();
  parser.use({
    extensions: [
      {
        name: "math",
        level: "inline",
        start(src: string): number {
          const match = /\$\$?/.exec(src);
          return match ? match.index : -1;
        },
        tokenizer(src: string): MathToken | undefined {
          if (src.startsWith("\\$")) return undefined;
          const display = /^\$\$([\s\S]+?)\$\$/.exec(src);
          if (display) {
            return {
              type: "math",
              raw: display[0],
              tex: display[1],
              displayMode: true,
            };
          }
          const inline = /^\$([^\s$](?:[^$\n]*[^$\s])?)\$(?!\$)/.exec(src);
          if (!inline) return undefined;
          return {
            type: "math",
            raw: inline[0],
            tex: inline[1],
            displayMode: false,
          };
        },
        renderer(token: GenericToken): string {
          const math = token as unknown as MathToken;
          return renderMath(math.tex, math.displayMode);
        },
      },
      {
        name: "alert",
        level: "block",
        start(src: string): number {
          const match = /^\s*>\s*\[!/.exec(src);
          return match ? match.index : -1;
        },
        tokenizer(src: string): AlertToken | undefined {
          const match =
            /^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?([\s\S]*?)(?=\n\s*\n|$)/i.exec(
              src,
            );
          if (!match) return undefined;
          const kind = match[1].toLowerCase();
          if (!ALERT_KINDS.includes(kind)) return undefined;
          const body = match[2]
            .split("\n")
            .map((line) => line.replace(/^\s*>\s?/, ""))
            .join("\n")
            .trim();
          return { type: "alert", raw: match[0], kind, body };
        },
        renderer(token: GenericToken): string {
          const alert = token as unknown as AlertToken;
          const body = parser.parse(alert.body, { async: false }) as string;
          return `<div class="md-alert md-alert-${alert.kind}"><div class="md-alert-title">${ALERT_GLYPH[alert.kind]} ${alert.kind.toUpperCase()}</div>${body}</div>`;
        },
      },
    ],
    renderer: {
      html({ text }: { text: string }): string {
        return escapeHtml(text);
      },
      link({ href, title, tokens }: Tokens.Link): string {
        const text = this.parser.parseInline(tokens) as string;
        if (!isSafeUrl(href)) return text;
        const target = linkBaseUrl ? resolveUrl(href, linkBaseUrl) : href;
        if (!isSafeUrl(target)) return text;
        const safeTitle = title ? ` title="${escapeAttribute(title)}"` : "";
        return `<a href="${escapeAttribute(target)}"${safeTitle}>${text}</a>`;
      },
      image({ href, title, text }: Tokens.Image): string {
        if (!isSafeUrl(href)) return escapeHtml(text);
        const target = imageBaseUrl ? resolveUrl(href, imageBaseUrl) : href;
        if (!isSafeUrl(target)) return escapeHtml(text);
        const safeTitle = title ? ` title="${escapeAttribute(title)}"` : "";
        return `<img src="${escapeAttribute(target)}" alt="${escapeAttribute(text)}"${safeTitle}>`;
      },
      code({ text, lang }: { text: string; lang?: string }): string {
        const language = (lang || "").trim().split(/\s+/)[0] || "";
        const source = text;

        if (language === "math" || language === "latex") {
          return `<div class="md-math-block">${renderMath(source, true)}</div>`;
        }

        let highlighted: string;
        if (language && hljs.getLanguage(language)) {
          highlighted = hljs.highlight(source, { language }).value;
        } else if (source.trim().length > 0) {
          highlighted = hljs.highlightAuto(source).value;
        } else {
          highlighted = escapeHtml(source);
        }

        const header = language
          ? `<div class="md-code-header"><span class="md-code-lang">${escapeHtml(language)}</span></div>`
          : "";
        const langClass = language
          ? ` language-${escapeAttribute(language)}`
          : "";
        return `<pre class="md-pre">${header}<code class="hljs${langClass}">${highlighted}</code></pre>`;
      },
    },
  });
  return parser;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

const HEADING = /<h([1-6])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/g;

function stripTags(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function withHeadingIds(html: string): string {
  const used = new Set<string>();
  return html.replace(HEADING, (_match, level: string, inner: string) => {
    const decoded = decodeEntities(stripTags(inner));
    const base = slugify(decoded) || `section-${level}`;
    let id = base;
    let suffix = 1;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

export function extractHeadings(
  html: string,
  levels: number[] = [2, 3],
): Heading[] {
  const headings: Heading[] = [];
  for (const match of html.matchAll(HEADING)) {
    const level = Number(match[1]);
    const id = /\sid="([^"]+)"/.exec(match[0]);
    const text = stripTags(match[2]);
    if (!levels.includes(level) || !id || !text) continue;
    headings.push({ id: id[1], text, level });
  }
  return headings;
}

export function renderMarkdown(
  markdown: string,
  imageBaseUrl?: string,
  linkBaseUrl?: string,
): string {
  const imageBase = imageBaseUrl?.endsWith("/")
    ? imageBaseUrl
    : imageBaseUrl
      ? `${imageBaseUrl}/`
      : undefined;
  const linkBase = linkBaseUrl?.endsWith("/")
    ? linkBaseUrl
    : linkBaseUrl
      ? `${linkBaseUrl}/`
      : undefined;
  const parser = createMarkdownParser(imageBase, linkBase);
  let html = withHeadingIds(parser.parse(markdown, { async: false }) as string);
  html = html.replace(
    /<p>(\s*(?:<a\s[^>]*>)?<img[^>]*>(?:<\/a>)?\s*)<\/p>/gi,
    '<p class="md-img-center">$1</p>',
  );
  return html;
}
