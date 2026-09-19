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
  highlighted code
- `/api/stats/*`: JSON and Catppuccin-themed SVG cards, not linked anywhere in
  the UI (see [its own README](src/app/api/stats/README.md))

## Stack

| Layer           | Choice                                                      |
| --------------- | ----------------------------------------------------------- |
| Framework       | Next.js 16 App Router, React 19, React Compiler enabled     |
| Language        | TypeScript, `strict`                                        |
| Styling         | Tailwind CSS v4 (CSS-first `@theme` tokens, no JS config)   |
| Scrolling       | Lenis with proximity snapping on the landing sections       |
| Content         | `marked` + `highlight.js` + KaTeX for blog and repo READMEs |
| Data            | GitHub REST + GraphQL, no database                          |
| Package manager | Bun (`bun.lock`); the npm scripts work too                  |

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
    blog/               synthwave backdrop for the blog routes
    ui/                 shared primitives
  lib/
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
- **There is no test suite yet.** Type checking (`tsc --noEmit`), ESLint and
  Prettier are the current gates, and `bun run build` must stay green.
