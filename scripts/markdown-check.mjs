#!/usr/bin/env bun

import assert from "node:assert/strict";
import { extractHeadings, renderMarkdown } from "../src/lib/markdown.ts";

const checks = [
  [
    "escapes raw HTML instead of injecting executable markup",
    () => {
      const html = renderMarkdown('<img src=x onerror="alert(1)">');
      assert.match(html, /&lt;img/);
      assert.doesNotMatch(html, /<img\b/);
    },
  ],
  [
    "rejects unsafe URL schemes, including entity-obfuscated schemes",
    () => {
      for (const href of [
        "javascript:alert(1)",
        "java&#x73;cript:alert(1)",
        "data:text/html,hi",
      ]) {
        const html = renderMarkdown(`[open](${href})`);
        assert.doesNotMatch(html, /<a\b/);
      }
    },
  ],
  [
    "keeps safe URL schemes and resolves repository-relative URLs",
    () => {
      const html = renderMarkdown(
        '[mail](mailto:dev@example.test) [doc](../guide.md?q=1#part) ![diagram](img/plot.svg "Plot")',
        "https://raw.example/repo/main/docs",
        "https://github.com/owner/repo/blob/main/docs",
      );
      assert.match(html, /href="mailto:dev@example\.test"/);
      assert.match(
        html,
        /href="https:\/\/github\.com\/owner\/repo\/blob\/main\/guide\.md\?q=1#part"/,
      );
      assert.match(
        html,
        /src="https:\/\/raw\.example\/repo\/main\/docs\/img\/plot\.svg"/,
      );
      assert.match(html, /alt="diagram" title="Plot"/);
    },
  ],
  [
    "preserves code text without double-escaping its literal entities",
    () => {
      const html = renderMarkdown(
        "```text\n&lt;em&gt;Hello &amp; goodbye&lt;/em&gt;\n```",
      );
      assert.match(html, /&amp;lt;/);
      assert.match(html, /Hello &amp;amp; goodbye/);
      assert.ok(html.includes("&amp;lt;/em&amp;gt;"));
    },
  ],
  [
    "renders math and recursively renders alert Markdown",
    () => {
      const html = renderMarkdown(
        "> [!TIP]\n> Evaluate $x^2$.\n>\n> More text.",
      );
      assert.match(html, /class="md-alert md-alert-tip"/);
      assert.match(html, /class="katex/);
      assert.match(html, /<p>More text\.<\/p>/);
    },
  ],
  [
    "creates distinct heading ids for duplicate and non-ASCII headings",
    () => {
      const html = renderMarkdown("## Café\n## Café\n## ★");
      assert.deepEqual(
        extractHeadings(html).map(({ id }) => id),
        ["caf", "caf-1", "section-2"],
      );
    },
  ],
];

let failures = 0;
for (const [name, run] of checks) {
  try {
    run();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}\n  ${error.message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} of ${checks.length} Markdown checks failed`);
  process.exit(1);
}
console.log(`\n✓ ${checks.length} Markdown checks passed`);
