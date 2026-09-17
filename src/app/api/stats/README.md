# Hidden GitHub Stats Endpoint

Endpoints serve aggregate GitHub stats so your GitHub README (or any
external tool) can pull live numbers without exposing a stats page on the
site:

- `GET /api/stats` — JSON
- `GET /api/stats/card` — an SVG card (drop it straight into your README as
  an `<img>`)
- `GET /api/stats/streak` — an SVG contribution-streak card (current streak,
  longest streak, yearly contribution total, active-days bar)
- `GET /api/stats/languages` — an SVG language-share card (top languages by
  bytes of code, rendered as bars)
- `GET /api/stats/contributions` — an SVG contribution-totals card (merged
  PRs, PRs opened, reviews, commits, repos, issues — no streak figures, those
  live on the streak card)
- `GET /api/stats/grid` — all four cards composed into one 2×2 SVG (816×436),
  the form the profile README uses

They are **intentionally not linked anywhere in the UI** — no header link,
no page, no sitemap. `public/robots.txt` disallows `/api/stats` so search
engines won't index them. They only exist for direct URL access.

## JSON response

```json
{
  "username": "Implycitt",
  "name": "Quentin Bordelon",
  "avatar_url": "https://avatars.githubusercontent.com/...",
  "profile_url": "https://github.com/Implycitt",
  "followers": 42,
  "following": 13,
  "public_repos": 21,
  "total_stars": 317,
  "total_forks": 28,
  "total_watchers": 19,
  "top_languages": [
    { "name": "TypeScript", "count": 12 },
    { "name": "Python", "count": 5 }
  ],
  "updated_at": "2026-08-01T12:00:00.000Z"
}
```

## SVG cards

All four cards share one terminal-styled frame (dark background, cyan →
violet → mauve accents, terminal-chrome header) and render as a static SVG —
no SMIL `<animate>` or scripts — so GitHub's image proxy renders them
reliably. Cache headers let GitHub refresh them about every 5 minutes, and
each falls back to a graceful "temporarily unavailable" card instead of
erroring when the GitHub API is down or rate-limited, so the README images
never break.

Every card is **400×210** with the same header, prompt line, divider and
footer rhythm, so they tile into a 2×2 grid without the README growing tall.

### One image keeps the grid (recommended)

`GET /api/stats/grid` returns the four cards already composed into a 2×2 image
(816×436, 16px gutter) from a single request. Because it is one image it cannot
reflow, so the grid holds at _every_ README width — GitHub scales it down
instead of wrapping it.

```markdown
<p align="center">
<img src="https://quentinb.dev/api/stats/grid" width="816" alt="GitHub stats: profile totals, contribution streak, top languages by bytes of code, and contribution totals">
</p>
```

### Four separate images

Useful when you want to link or reorder cards individually, but GitHub wraps
inline images as soon as they stop fitting: two 400px cards plus their gap need
~805px, which the README column only provides above a ~870px browser window.
Below that the four images wrap into a single column ≈864px tall.

```markdown
<p align="center">
<img src="https://quentinb.dev/api/stats/card" width="400" alt="GitHub stats"> <img src="https://quentinb.dev/api/stats/streak" width="400" alt="Contribution streaks">
<br>
<img src="https://quentinb.dev/api/stats/languages" width="400" alt="Language share by bytes of code"> <img src="https://quentinb.dev/api/stats/contributions" width="400" alt="Contribution totals">
</p>
```

Stacked vertically (four rows ≈950px tall) is the older single-column form:

```markdown
![GitHub stats](https://quentinb.dev/api/stats/card)
![Streak](https://quentinb.dev/api/stats/streak)
![Languages](https://quentinb.dev/api/stats/languages)
![Contribution totals](https://quentinb.dev/api/stats/contributions)
```

### Stats card

`GET /api/stats/card` renders the name in the card header plus followers,
following, public repos, stars, forks and watchers in a 3×2 metric grid.

### Streak card

`GET /api/stats/streak` renders current streak, longest streak, and the last-
365-days contribution total, plus an "active days" progress bar. It requires
`GITHUB_TOKEN`
(contribution data only exists behind the authenticated GraphQL API) and
renders a graceful "streak temporarily unavailable" card when the token is
missing or the API is unreachable.

### Languages card

`GET /api/stats/languages` aggregates `bytes` across every non-fork public
repo and renders the top 4 languages as percentage bars, with a "… and N
more" footer for the tail.

It reads that in **one GraphQL query** (repos paginated 100 at a time, capped
at 10 pages, `languages` requested per repo), replacing the one-REST-call-per-
repo scan: on an 18-repo account that is **1 request instead of 19**, and the
cost no longer scales with repo count. Measured after the change, a languages
read for an account that had never been fetched left the REST budget
untouched (delta 0).

Without `GITHUB_TOKEN` there is no GraphQL, so it falls back to the original
per-repo REST scan, which can exhaust the unauthenticated 60 req/hr budget —
hence the token recommendation. The two paths return equivalent data (same
languages, same order; REST and GraphQL language sizes differ by a fraction of
a percent).

### Contribution totals card

`GET /api/stats/contributions` renders six metrics — merged PRs, PRs opened,
reviews, commits, repos contributed to and issues opened: everything in the
last-365-days contribution window plus the all-time merged-PR count from the
search API.

It deliberately shows **no streak figures**: current and longest streak, the
yearly contribution total and the active-days bar all live on the streak card,
and the two are displayed side by side in the 2×2 grid, so duplicating them
would waste half this card's grid. In their place are `PRS OPENED`
(`totalPullRequestContributions`) and `REVIEWS`
(`totalPullRequestReviewContributions`), which no other card reports. The
streak card's yearly figure is labelled `contribs` rather than `commits`, since
`totalContributions` also counts issues, PRs and reviews — the true commit
count is the `COMMITS · 365D` metric here.

Both cards share one contribution-calendar lookup (see _Caching_ below). It
requires `GITHUB_TOKEN` and renders the graceful unavailable card without one.
The merged-PR figure is independent of that window and shows `—` if the search
API is rate-limited.

### Grid card

`GET /api/stats/grid` fetches all four data sets in parallel and composes the
same four card bodies into one image, so a single request renders the whole
2×2 block. Each quadrant falls back to its own graceful "unavailable" card
independently, and the four standalone endpoints above remain available.

## Caching

A profile readme is a hot path: every view hits these endpoints, and the
languages card alone makes **one request per public repo**. Reads are therefore
memoized in-process for **5 minutes** — matching the "refreshed 5m" note the
cards print and the `s-maxage=300` header they send — in
`src/lib/ttl-cache.ts`.

What that covers:

- `fetchGitHubStats`, `fetchGitHubLanguageBytes`, the GraphQL contribution
  calendar and the merged-PR search are each cached under a `username`-scoped
  key, so the four standalone cards and the grid all share one set of reads.
- Concurrent callers share a single in-flight promise, so the grid's four
  parallel fetches (or a burst of readme views) trigger one upstream call each
  rather than one per caller.
- The composed grid SVG itself is cached, so a repeat readme view never
  touches GitHub.
- Only _successes_ are held for the full window. A `null` result (API down or
  rate-limited) is remembered for just **30 seconds**, so a transient failure
  does not pin every card to "temporarily unavailable" for 5 minutes.
- Keys are capped at 64 entries, evicting the oldest. Every REST read also opts
  into Next's Data Cache (`revalidate: 3600`), including the per-repo
  `/languages` calls on the token-less fallback path; the contribution calendar
  and language queries are GraphQL POSTs, which that cache cannot store, so the
  in-process layer is what covers them.

Measured before and after the languages read moved to GraphQL, using the
GitHub REST budget (which does move; the GraphQL counter does not update for
this token, so GraphQL cost is stated structurally instead):

|                        | upstream work                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| languages card, before | 19 REST requests (1 repos + one per owned repo)                                                   |
| languages card, now    | 1 GraphQL query, REST budget delta **0**                                                          |
| grid, first view       | fixed 3 REST reads + 2 GraphQL queries, independent of repo count (was 18 REST reads and growing) |
| grid, repeat views     | **0**, ~6 ms                                                                                      |

Because this cache is per process, multiple server instances each keep their
own copy — that is intentional (no shared dependency), and the CDN
`s-maxage=300` plus stale-while-revalidate absorb the rest.

## Configuration

- `GITHUB_USERNAME` (env) — default GitHub username. Defaults to
  `Implycitt` if unset.
- `?username=` — optional per-request override (works on all endpoints).
- `GITHUB_TOKEN` (env) — optional token to raise the GitHub API rate limit
  well past the unauthenticated 60 req/hr.

## Using it in your GitHub README

### SVG card (recommended)

```markdown
![GitHub stats](https://quentinb.dev/api/stats/card)
```

### shields.io dynamic badge

```markdown
![stars](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fquentinb.dev%2Fapi%2Fstats&query=%24.total_stars&label=stars&color=2EDFE5)
![followers](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fquentinb.dev%2Fapi%2Fstats&query=%24.followers&label=followers&color=C77DFF)
```

### Direct fetch (workflow / script)

```bash
curl -s https://quentinb.dev/api/stats | jq .total_stars
```
