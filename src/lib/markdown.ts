import { marked } from "marked";
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

function unescapeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
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

marked.use({
  extensions: [
    {
      name: "math",
      level: "inline",
      start(src: string): number {
        const match = /\$\$?/.exec(src);
        return match ? match.index : -1;
      },
      tokenizer(src: string): MathToken | undefined {
        const display = /^\$\$([\s\S]+?)\$\$/.exec(src);
        if (display) {
          return {
            type: "math",
            raw: display[0],
            tex: display[1],
            displayMode: true,
          };
        }
        const inline = /^\$([^\s$](?:[^$\n]*[^\s$])?)\$(?!\$)/.exec(src);
        if (inline) {
          return {
            type: "math",
            raw: inline[0],
            tex: inline[1],
            displayMode: false,
          };
        }
        return undefined;
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
        return {
          type: "alert",
          raw: match[0],
          kind,
          body,
        };
      },
      renderer(token: GenericToken): string {
        const alert = token as unknown as AlertToken;
        return `<div class="md-alert md-alert-${alert.kind}"><div class="md-alert-title">[!${alert.kind.toUpperCase()}]</div>${marked.parse(
          alert.body,
          { async: false },
        )}</div>`;
      },
    },
  ],
  renderer: {
    code({
      text,
      lang,
      escaped,
    }: {
      text: string;
      lang?: string;
      escaped?: boolean;
    }): string {
      const language = (lang || "").trim().split(/\s+/)[0] || "";
      const raw = escaped ? unescapeHtml(text) : text;

      if (language === "math" || language === "latex") {
        return `<div class="md-math-block">${renderMath(raw, true)}</div>`;
      }

      let highlighted: string;
      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(raw, { language }).value;
      } else if (raw.trim().length > 0) {
        highlighted = hljs.highlightAuto(raw).value;
      } else {
        highlighted = escapeHtml(raw);
      }

      const header = language
        ? `<div class="md-code-header"><span class="md-code-lang">${escapeHtml(language)}</span></div>`
        : "";
      const langClass = language ? ` language-${language}` : "";

      return `<pre class="md-pre">${header}<code class="hljs${langClass}">${highlighted}</code></pre>`;
    },
  },
});

const ABSOLUTE_SRC = /^(?:https?:)?\/\//i;
const DATA_SRC = /^data:/i;

function resolveUrl(value: string, baseUrl: string): string {
  if (!value) return value;
  if (
    ABSOLUTE_SRC.test(value) ||
    DATA_SRC.test(value) ||
    value.startsWith("#")
  ) {
    return value;
  }
  const repoRelative = value.replace(/^\/(?!\/)/, "");
  let resolved: string;
  try {
    resolved = new URL(repoRelative, baseUrl).href;
  } catch {
    return value;
  }
  return ABSOLUTE_SRC.test(resolved) ? resolved : value;
}

export function renderMarkdown(
  markdown: string,
  imageBaseUrl?: string,
  linkBaseUrl?: string,
): string {
  let html = marked.parse(markdown, { async: false }) as string;
  if (imageBaseUrl) {
    const base = imageBaseUrl.endsWith("/") ? imageBaseUrl : `${imageBaseUrl}/`;
    html = html.replace(
      /(<img\b[^>]*\bsrc=)(["'])([^"']*)\2/gi,
      (_match, prefix: string, quote: string, src: string) =>
        `${prefix}${quote}${resolveUrl(src, base)}${quote}`,
    );
  }
  if (linkBaseUrl) {
    const base = linkBaseUrl.endsWith("/") ? linkBaseUrl : `${linkBaseUrl}/`;
    html = html.replace(
      /(<a\b[^>]*\bhref=)(["'])([^"']*)\2/gi,
      (_match, prefix: string, quote: string, href: string) =>
        `${prefix}${quote}${resolveUrl(href, base)}${quote}`,
    );
  }
  html = html.replace(
    /<a\b[^>]*\bhref\s*=\s*(?:""|'')\s*>\s*(<img[^>]*>)\s*<\/a>/gi,
    "$1",
  );
  html = html.replace(
    /<p>(\s*(?:<a\s[^>]*>)?<img[^>]*>(?:<\/a>)?\s*)<\/p>/gi,
    '<p class="md-img-center">$1</p>',
  );
  return html;
}
