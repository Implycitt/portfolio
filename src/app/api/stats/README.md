# Hidden GitHub Stats Endpoint

Endpoints serve aggregate GitHub stats so your GitHub README (or any
external tool) can pull live numbers without exposing a stats page on the
site:

- `GET /api/stats` — JSON
- `GET /api/stats/card` — an SVG card (drop it straight into your README as
  an `<img>`)
- `GET /api/stats/streak` — an SVG contribution-streak card (current streak,
  longest streak, yearly commits, active-days bar)
- `GET /api/stats/languages` — an SVG language-share card (top languages by
  bytes of code, rendered as bars)

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

All three cards share one terminal-styled frame (dark background, cyan →
violet → mauve accents, blinking-caret header) and render as a static SVG —
no SMIL `<animate>` or scripts — so GitHub's image proxy renders them
reliably. Cache headers let GitHub refresh them about every 5 minutes, and
each falls back to a graceful "temporarily unavailable" card instead of
erroring when the GitHub API is down or rate-limited, so the README images
never break.

```markdown
![GitHub stats](https://quentinb.dev/api/stats/card)
![Streak](https://quentinb.dev/api/stats/streak)
![Languages](https://quentinb.dev/api/stats/languages)
```

### Stats card

`GET /api/stats/card` renders name, handle, followers, repos, stars, forks,
watchers, and top languages.

### Streak card

`GET /api/stats/streak` renders current streak, longest streak, and last-365-
days commits, plus an "active days" progress bar. It requires `GITHUB_TOKEN`
(contribution data only exists behind the authenticated GraphQL API) and
renders a graceful "streak temporarily unavailable" card when the token is
missing or the API is unreachable.

### Languages card

`GET /api/stats/languages` aggregates `bytes` across every non-fork public
repo (one call per repo) and renders the top 8 languages as percentage bars,
with a "… and N more" footer for the tail. Without `GITHUB_TOKEN` the
per-repo calls can hit the unauthenticated rate limit (60 req/hr), so a
token is strongly recommended.

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
