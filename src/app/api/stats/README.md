# Hidden GitHub Stats Endpoint

`GET /api/stats` returns aggregate GitHub stats as JSON so your GitHub
README (or any external tool) can pull live numbers without exposing a
stats page on the site.

It is **intentionally not linked anywhere in the UI** — no header link, no
page, no sitemap. `public/robots.txt` also disallows it so search engines
won't index it. It only exists for direct URL access.

## Response

```json
{
  "username": "Implycitt",
  "name": "Quentin Bordelon",
  "avatar_url": "https://avatars.githubusercontent.com/...",
  "profile_url": "https://github.com/quentinbordelon",
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

## Configuration

- `GITHUB_USERNAME` (env) — default GitHub username. Defaults to
  `Implycitt` if unset.
- `?username=` — optional per-request override.
- `GITHUB_TOKEN` (env) — optional token to raise the GitHub API rate limit
  well past the unauthenticated 60 req/hr.

## Using it in your GitHub README

### shields.io dynamic badge

```
![stars](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fquentinb.dev%2Fapi%2Fstats&query=%24.total_stars&label=stars&color=2EDFE5)
![followers](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fquentinb.dev%2Fapi%2Fstats&query=%24.followers&label=followers&color=C77DFF)
```

### Direct fetch (workflow / script)

```bash
curl -s https://your-domain.com/api/stats | jq .total_stars
```
