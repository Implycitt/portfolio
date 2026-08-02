# Hidden GitHub Stats Endpoint

Two endpoints serve aggregate GitHub stats so your GitHub README (or any
external tool) can pull live numbers without exposing a stats page on the
site:

- `GET /api/stats` — JSON
- `GET /api/stats/card` — an SVG card (drop it straight into your README as
  an `<img>`)
- `GET /api/stats/streak` — an SVG contribution-streak card (current streak,
  longest streak, yearly commits, mini heatmap)
- `GET /api/stats/repos` — an SVG showcase card of your top-6 starred repos

Both are **intentionally not linked anywhere in the UI** — no header link,
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

## SVG card

`GET /api/stats/card` renders a terminal-styled stats card (name, handle,
followers, repos, stars, forks, watchers, top languages) as an SVG image,
matching the portfolio's dark terminal aesthetic. When the GitHub API is
unreachable it renders a graceful "temporarily unavailable" card instead of
erroring, so the README image never breaks.

It is deliberately kept static (no SMIL `<animate>` or scripts) so GitHub's
image proxy renders it reliably, and its cache headers let GitHub refresh it
about every 5 minutes.

```markdown
![GitHub stats](https://quentinb.dev/api/stats/card)
![Streak](https://quentinb.dev/api/stats/streak)
![Top repos](https://quentinb.dev/api/stats/repos)
```

## Streak card

`GET /api/stats/streak` renders current streak, longest streak, and yearly
total commits with a last-26-weeks contribution heatmap. It requires
`GITHUB_TOKEN` (contribution data only exists behind the authenticated
GraphQL API) and renders a graceful "streak temporarily unavailable" card
when the token is missing or the API is unreachable.

## Repos card

`GET /api/stats/repos` renders your top 6 public repos (by stars) as a
terminal-styled grid with name, description, language, stars, and forks.
Falls back gracefully when the API is unreachable.

## Configuration

- `GITHUB_USERNAME` (env) — default GitHub username. Defaults to
  `Implycitt` if unset.
- `?username=` — optional per-request override (works on both endpoints).
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
