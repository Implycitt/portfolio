# Quentin Bordelon — Portfolio

Personal site for a computer science and physics undergraduate at LSU: a
terminal/ASCII-flavoured portfolio built on Next.js 16, plus a hidden GitHub
stats API that powers the cards in my GitHub profile README.

Live at **[quentinb.dev](https://quentinb.dev)**.

- Landing page: name rendered as ASCII art on canvas, drift-and-reveal on scroll
- `/projects`: every repo I own plus the ones I contribute to, collapsed into
  deep-linkable sections
- `/resume`: printable, with a PDF download
- `/blog`: posts pulled straight out of a GitHub repo, with KaTeX math and
  highlighted code, dressed as a System Shock station terminal — a fixed
  space backdrop with a static grain/vignette/bezel CRT pass, HUD panels, an
  outline console that follows your position and a progress meter that fills as
  you read
- `/api/stats/*`: JSON and Catppuccin-themed SVG cards, not linked anywhere in
  the UI (see [its own README](src/app/api/stats/README.md))
- Every route ends with the same footer — site links, GitHub, LinkedIn and email
  — so contact details never require a trip back to the landing page

## Stack

| Layer           | Choice                                                       |
| --------------- | ------------------------------------------------------------ |
| Framework       | Next.js 16 App Router, React 19, React Compiler enabled      |
| Language        | TypeScript, `strict`                                         |
| Styling         | Tailwind CSS v4 (CSS-first `@theme` tokens, no JS config)    |
| Scrolling       | Lenis; proximity snapping on landing sections, off at footer |
| Content         | `marked` + `highlight.js` + KaTeX for blog and repo READMEs  |
| Data            | GitHub REST + GraphQL, no database                           |
| Package manager | Bun (`bun.lock`); the npm scripts work too                   |

## Routes

| Route                      | Rendering   | Notes                                               |
| -------------------------- | ----------- | --------------------------------------------------- |
| `/`                        | Static, 1h  | GitHub stats + featured repos fetched server-side   |
| `/projects`                | Static, 1h  | Repos, orgs and contributions in collapsed sections |
| `/projects/[owner]/[name]` | Dynamic     | Repo detail with its rendered README                |
| `/resume`                  | Dynamic     | `force-dynamic` so print/PDF output stays current   |
| `/blog`                    | Static, 60s | Post index grouped by category                      |
| `/blog/[...slug]`          | SSG, 60s    | One page per post, math and code highlighted        |
| `/sitemap.xml`             | Static      | Generated in `src/app/sitemap.ts`                   |
| `/api/stats` and friends   | Dynamic     | JSON + SVG, excluded in `robots.txt`                |

## Architecture

```
src/
  app/
    api/stats/          JSON + SVG stats endpoints and their README
    blog/               post index and article routes
    projects/           project index and repo detail routes
    resume/             resume route
    layout.tsx          fonts, metadata, header, skip link, page transition
    page.tsx            landing page composition
    globals.css         design tokens and the classes Tailwind can't express
    sitemap.ts          sitemap generation
  components/
    home/               landing sections (about, featured, interests, socials)
    ui/                 shared primitives
  lib/
    backdrop.ts         backdrop layer vocabulary, presets and seeded layouts
    github-repos.ts     repo, org and contribution queries
    github-stats.ts     profile stats, streaks and language bytes
    posts.ts            blog source resolution and frontmatter parsing
    markdown.ts         marked pipeline with math, alerts and highlighting
    stats-cards.ts      SVG card composition for the readme grid
    svg-card.ts         shared Catppuccin frame and drawing helpers
    ttl-cache.ts        in-memory cache for the API routes
    reveal-observer.ts  one IntersectionObserver shared by every reveal
    pointer.ts          one pointer listener shared by every pointer-reactive glow
    tag-color.ts        deterministic Catppuccin colour per repository tag
  content/blog/         local post source, used when BLOG_REPO is unset
```

The `content/blog/` directory is committed but empty: this deployment publishes
from a separate blog repo. Drop `.md` files into it (with `title`, `date`,
`tag`, `excerpt` frontmatter) to run the blog with no GitHub dependency at all.

### Data flow

Every route renders on the server; the browser only receives the motion
islands. The landing page and `/projects` read GitHub during render with
`next: { revalidate: 3600 }`, so a page view is served from the Next data cache
instead of hitting the API. Blog posts come from a GitHub repo's tree API
(`revalidate: 60`) and fall back to `content/blog/` if that repo is
unreachable, so the site never breaks when GitHub is down or rate-limited.
With that directory empty, posts arrive from the blog repo in practice.

The `/api/stats/*` endpoints are the only thing built for external traffic. They
sit behind `src/lib/ttl-cache.ts`: a 5-minute success TTL, a 30-second failure
TTL, at most 64 entries, and in-flight request deduplication so a burst of
profile-README views collapses into one GitHub call. Each card falls back to a
"temporarily unavailable" frame rather than a 500, so a broken image never ends
up in a README.

### Motion

Three shared primitives keep the animation budget flat as the page grows:

- `lib/reveal-observer.ts` — a single `IntersectionObserver` for all reveals;
  elements are unobserved the moment they fire.
- `lib/pointer.ts` — a single passive `pointermove` listener, consumed by the
  aurora glows through `requestAnimationFrame`.
- The ASCII hero runs one `requestAnimationFrame` loop that stops once you
  scroll past it and resumes on `visibilitychange`.

Everything above is disabled under `prefers-reduced-motion: reduce`.

### Styling

Catppuccin Mocha is the only palette, declared as CSS variables in the
`@theme` block of `globals.css` (`--color-mocha-*`). Pieces that Tailwind
can't express are plain classes in the same file: the pointer-tracking
`.spotlight` light, the rotating conic `.live-card` ring, `.tilt-frame`,
`.dust` / `.background-glyph`, `.social-card`, `.heading-rule`, `.skip-link`
and the `.md-body` typography for rendered markdown.

Custom CSS is deliberately thin. Content routes ship ~94 KB of CSS; the KaTeX
stylesheet is imported by the two routes that render math rather than by the
root layout, so `/`, `/projects` and the blog index never download it.

### Accessibility

A skip link (`#content`) and a global `:focus-visible` ring on every page, `alt`
text and `aria-label`s on icon-only links, `aria-expanded` / `aria-controls` on
the expandable project sections, a polite live region for the section
indicator, tabular figures for animated counters, and full
`prefers-reduced-motion` coverage.

## Environment variables

Copy `.env.example` to `.env` and fill in what you need. Nothing here is
required: the site runs with defaults, it just does more with a token.

| Variable               | Default                | Purpose                                                             |
| ---------------------- | ---------------------- | ------------------------------------------------------------------- |
| `GITHUB_USERNAME`      | `Implycitt`            | Account whose repos and stats are shown                             |
| `GITHUB_TOKEN`         | unset                  | Raises the GitHub rate limit and enables the GraphQL language query |
| `BLOG_REPO`            | unset                  | `owner/repo` (or a GitHub URL) to read posts from                   |
| `BLOG_PATH`            | `posts`                | Directory inside `BLOG_REPO` holding the markdown files             |
| `BLOG_BRANCH`          | `main`                 | Branch to read posts from                                           |
| `NEXT_PUBLIC_SITE_URL` | `https://quentinb.dev` | Absolute origin used by metadata, Open Graph tags and the sitemap   |

Without `GITHUB_TOKEN` the GitHub API allows 60 requests per hour per IP, which
is enough for local work but not for production traffic. The language card uses
one GraphQL query when a token is present and falls back to per-repo REST calls
when it is not.

## Running it locally

```bash
bun install
cp .env.example .env
bun dev
```

Then open <http://localhost:3000>.

| Script                 | Does                       |
| ---------------------- | -------------------------- |
| `bun dev`              | Dev server on port 3000    |
| `bun run build`        | Production build           |
| `bun run start`        | Serve the production build |
| `bun run lint`         | ESLint + TypeScript rules  |
| `bun run format`       | Prettier, write            |
| `bun run format:check` | Prettier, check only       |
| `bun run test:smoke`   | Rendered checks in Chrome  |
| `bun run test:blog`    | Blog readability audit     |

### `bun run test:smoke`

Drives a headless Chrome over the DevTools protocol, with no test-runner or
browser dependency to install. It reuses a dev server already listening on
`SMOKE_PORT` (default 3000) and starts one if there is none. Point it somewhere
else with `SMOKE_URL`, or hand it a browser with `CHROME_PATH`; otherwise it
finds Chrome, Chromium or a Playwright download itself.

For `/`, `/projects`, `/resume` and `/blog`, plus the first article it finds on
the blog index, at 390, 768 and 1440px wide it asserts: no horizontal overflow,
no reveal left stuck invisible, no console or page errors, every backdrop field
carrying an edge mask, and — the point of the whole thing — **no seam in the
backdrop at a section or field boundary**. It hides all page content, walks the
boundaries of the backdrop scope, captures the viewport at each one and
compares row luminance across the boundary. A step of 3 or more across at least
60% of the width fails; narrower steps are field art and are reported as notes.

The blog's backdrop is `position: fixed` rather than sectioned, so it gets its
own pass: the same full-width band check, sampled at four scroll offsets.

`SMOKE_SELF_TEST=1 bun run test:smoke` paints a deliberate 2px line across
every field and requires the check to catch it, which is how you know the
detector itself still works.

### `bun run test:blog`

Walks every blog route — the index plus every article it finds linked from it —
at 390 and 1440px, and audits the reading experience from computed styles only.
It fails on:

- **fonts** — `--font-fira-code-nerd` missing from `<html>`, a webfont face in
  `error` state (Next's synthetic `* Fallback` faces exempt), or `.md-body` /
  `.hud-bar` resolving to a family that is not a loaded webfont, which is what a
  broken font file looks like.
- **anchors** — any `a[href^="#"]` with no matching id, duplicate ids, and any
  drift between the outline panel and the article's `h2`/`h3` ids.
- **contrast** — composited foreground against the composited ancestor
  background stack. Prose needs 4.5:1 (3:1 for large text), HUD chrome and meta
  labels need 3:1. It also asserts the reading panel itself is ≥0.9 opaque, so
  backdrop art cannot reach the prose.
- **overflow** — maths, code, tables or images reaching past the prose column,
  and any horizontal page scroll. Blocks that scroll inside their own box are
  reported as notes instead.
- **outline** — on a narrow viewport the section panel has to start collapsed,
  expand to exactly the article's `h2`/`h3` ids, report `aria-expanded`, land a
  picked section on the `scroll-padding-top` mark with the URL and the collapsed
  bar following along, then close again — and land just as accurately on a
  second pick after the page has shifted underneath the jump.

`BLOG_SELF_TEST=1 bun run test:blog` injects a faint paragraph, a dangling
anchor, an oversized maths block and a broken font stack, then requires the
check to report all four. `OUTLINE_SELF_TEST=1 bun run test:blog` strips a row's
href and renders the last heading away from its layout position, and requires
the listing and landing checks to catch both. `BLOG_LIMIT` caps how many
articles it walks.

## Deploying

### Vercel (what the site uses)

1. Import the repository; the framework preset, install command and build
   command are all detected automatically.
2. Add the environment variables from the table above. `GITHUB_TOKEN` and
   `NEXT_PUBLIC_SITE_URL` are the two that matter in production.
3. Deploy. `/sitemap.xml` and the metadata URLs are generated from
   `NEXT_PUBLIC_SITE_URL`, so set it before the first deploy if the domain is
   not `quentinb.dev`.

### Anywhere else

```bash
bun install
bun run build
bun run start   # PORT and HOSTNAME are respected
```

Two runtime notes for self-hosting:

- Image optimization needs `sharp`, which is a normal dependency and installs
  with the rest.
- The stats endpoints cache in process memory, so run a single instance or
  accept a cold GitHub fetch per instance after a restart.

After deploying, check that `/api/stats/grid` returns an SVG, that
`/sitemap.xml` lists absolute URLs on the real domain, and that a link preview
shows the right title and description.

## Notes

- **Dev server and CSS.** Turbopack occasionally serves a stale CSS chunk after
  edits to `globals.css`; restart the dev server with `.next` removed if a new
  rule appears not to apply.
- **Image qualities** must be listed in `next.config.ts` (`images.qualities`) or
  `next/image` rejects them at runtime.
- **The stats endpoints are intentionally unlinked** — no nav entry, no page,
  and `robots.txt` disallows them. They exist for direct URL access.
- **Gates.** Type checking (`tsc --noEmit`), ESLint, Prettier,
  `bun run test:smoke`, `bun run test:blog` and `bun run build` all have to
  stay green.
- **Blog atmosphere stays behind the prose and holds still.** Everything that
  dresses a blog route — grain, vignette, the corner bezel ticks, the planet
  limb, headings' phosphor glow — is a `dressing` layer or a `text-shadow`, all
  static, all inside the `aria-hidden` backdrop scope, all underneath the
  content layer. Nothing animates but the backdrop's own slow sweep, so the
  reading column never moves, and the reading panel stays `hud-panel-solid`
  (≥0.9 alpha) so texture cannot reach the text. The blog check enforces that
  opacity and the contrast of every label.
- **The footer is chrome, not page content.** `SiteFooter` renders once in the
  root layout, after `PageTransition`, so every route ends with the same contact
  block and the footer never replays a page transition. It owns its `horizon`
  backdrop and its ASCII sign-off, so a page renders it by doing nothing.
  `print:hidden` keeps it out of the resume's printed PDF.
- **Snapping stops where the footer starts.** Landing sections opt in with
  `data-lenis-snap`, and the footer deliberately does not. Every scroll also
  checks whether the reader has passed the last snap target; if so the `Snap`
  instance is stopped, so the tail of the page can be read without a proximity
  snap yanking the reader back up to the section above. It restarts above the
  last target, so section-to-section snapping is unchanged. The breakpoint is
  the target's layout offset, the same number Lenis snaps to, so the two never
  disagree.
- **Backdrop continuity is enforced, not eyeballed.** Any new route that wants
  the shared backdrop renders `PageBackdrop` (which tags itself
  `data-backdrop-scope`) and puts `page-flow` on its `<main>`; the smoke test
  then covers its boundaries automatically. Sections keep their own
  `SectionField`, and the smoke test fails if a field loses its edge mask.
- **Backdrops are data, not components.** Everything decorative is one of eight
  layer kinds (`wash`, `dressing`, `blob`, `particles`, `rings`, `ripples`,
  `sweep`, `shooting`) declared in `src/lib/backdrop.ts`, rendered by the single
  `SectionField`. A section passes a preset name, a page passes a spec — usually
  a preset with different layers, e.g. a page spreads `PRESETS.station` and adds
  a `shooting` layer for a meteor shower. Adding art means adding entries plus,
  at most, one CSS class for a new `dressing`, never a new React component.
  Particles and rings are generated from ranges with a seeded PRNG, so the same
  spec always renders the same layout on the server and the client.
- **Depth is declared, not hand-animated.** A `group` layer takes `pointer` and
  `drift` numbers, so the station backdrop is three nested frames: the nebula
  glow drifts 8px against the cursor, the stars 15px, the horizon band and the
  scan sweep 28px, and each frame also travels a little as the reader scrolls
  (`--field-read`, set once per frame by the shared loop in `src/lib/field.ts`).
  All of it is transform-only, and everything still shares one
  IntersectionObserver, one scroll listener and one pointer subscription.
- **The brand link skips the hero.** The header's top-left mark points at
  `#about` rather than `/`, so a click from any route lands on the About section
  instead of replaying the event-horizon hero. On the landing page a click is
  handled directly (`scrollToTarget`) rather than through the hash, so it lands
  the same way every time — including when the URL already reads `#about`.
  `SmoothScroll` covers the cross-route case: it reads the hash after the
  route's streamed sections exist, targets the section's layout offset through
  `sectionTop()` (the reveal transform would otherwise bias the measurement)
  and re-applies until the position sticks, because Next resets the scroll when
  the shell commits. Both paths go through the same `sectionTop()` resolution,
  so a section lands at the same offset however you arrive at it.
- **Article progress has one source of truth.** `src/lib/markdown.ts` gives every
  `h2`/`h3` an id and hands the same list to the page, so the outline panel and
  the heading ids cannot drift. `PostRead` measures the article once per resize
  and then per frame on scroll, writes `--read` (0–1) plus `data-read` on its
  root, and every reader of that state — outline highlighting, HUD lamps, the
  header status and the read meter — derives from it rather than measuring
  again. One panel serves both breakpoints: it is always open and translucent
  from `lg` up, and on phones it collapses into a sticky opaque bar showing the
  current section and progress, expanding into the same list (capped at 55vh)
  and closing again when a section is picked. The header's mobile variant and
  the desktop one are separate elements behind `lg:hidden` / `hidden lg:block`
  wrappers, because the unlayered HUD classes outrank Tailwind's `display`
  utilities.
- **Sections are reachable by swipe.** On touch devices a horizontal drag of at
  least 56px, with the horizontal travel ≥1.8× the vertical and within 700ms,
  moves to the next (left) or previous (right) heading, or to the article top
  when already on the first. It closes the outline if it was open, then measures
  the target on the next frame so the collapse cannot skew the landing, and it
  lands on the same offset a link click would because Lenis honours
  `scroll-padding-top`. The gesture reads touch events rather than cancelling
  pans, so vertical scrolling, pinch-zoom and horizontally scrollable children
  (code, tables, maths) are untouched — and `overscroll-behavior-x: none` on
  `html` stops the browser reading the drag as a history swipe.
  `src/lib/scroller.ts` is the one place that knows how to scroll to a section:
  `SmoothScroll` registers its Lenis instance there, and anything without a
  registered scroller falls back to a native scroll that respects reduced
  motion. It resolves the section from its layout offset (never its transformed
  rect) and re-resolves it once the scroll settles, re-applying immediately if
  the page moved underneath — on phones the outline panel sits above the
  article, so picking a section collapses it and shortens the document
  mid-jump. A wheel, touch or key press during the flight cancels the
  correction, so the reader always wins.
