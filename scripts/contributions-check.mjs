#!/usr/bin/env bun
/**
 * Contribution discovery checks.
 *
 * `src/lib/github-repos.ts` reads GITHUB_TOKEN at module load and talks to the
 * GitHub API through global fetch, so the module is imported dynamically after
 * the token is set and every request is served from an in-memory fixture.
 *
 * Run with `bun run test:unit`.
 */
import assert from "node:assert/strict";

process.env.GITHUB_TOKEN = "test-token";

const { fetchGitHubContributions, fetchGitHubRepos, sortContributionsByStars } =
  await import("../src/lib/github-repos.ts");

const monthsAgo = (months, day = 15) => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, day),
  );
};

function json(body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", ...headers },
  });
}

function notFound() {
  return new Response("{}", { status: 404 });
}

function repoFixture(id, fullName, extra = {}) {
  const [owner, name] = fullName.split("/");
  return {
    id,
    name,
    full_name: fullName,
    owner: { login: owner },
    description: null,
    html_url: `https://github.com/${fullName}`,
    homepage: null,
    language: "TypeScript",
    languages_url: `https://api.github.com/repos/${fullName}/languages`,
    topics: [],
    stargazers_count: 0,
    forks_count: 0,
    watchers_count: 0,
    open_issues_count: 0,
    default_branch: "main",
    license: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    pushed_at: "2026-01-01T00:00:00Z",
    fork: false,
    archived: false,
    size: 1,
    ...extra,
  };
}

/** Mirrors GitHub's Link header: `rel="last"` is present only when more pages exist. */
function linkHeader(perPage, total) {
  if (total <= perPage) return null;
  const last = Math.ceil(total / perPage);
  return (
    `<https://api.github.com/repositories/1/contributors?per_page=${perPage}&anon=0&page=2>; rel="next", ` +
    `<https://api.github.com/repositories/1/contributors?per_page=${perPage}&anon=0&page=${last}>; rel="last"`
  );
}

function makeApi(fixture = {}) {
  const {
    user = "Implycitt",
    graphql = [],
    repoCommitCounts = [],
    orgs = [],
    search = () => [],
    repos = {},
    contributors = {},
    commits = {},
    profiles = {},
  } = fixture;

  return (url, init) => {
    const parsed = new URL(url);
    const { pathname } = parsed;
    const perPage = Number(parsed.searchParams.get("per_page") ?? "100");

    if (pathname === "/graphql") {
      const body = JSON.parse(init?.body ?? "{}");
      if (body.query?.includes("commitContributionsByRepository")) {
        return json({
          data: {
            user: {
              contributionsCollection: {
                commitContributionsByRepository: graphql.map(
                  ([fullName, total]) => ({
                    repository: { nameWithOwner: fullName },
                    contributions: { totalCount: total },
                  }),
                ),
              },
            },
          },
        });
      }
      if (body.query?.includes("defaultBranchRef")) {
        return json({
          data: {
            user: {
              repositories: {
                nodes: repoCommitCounts.map(([name, totalCount]) => ({
                  name,
                  defaultBranchRef: { target: { history: { totalCount } } },
                })),
              },
            },
          },
        });
      }
      return json({ data: {} });
    }

    if (pathname === "/user") return json({ login: user });
    if (pathname === "/user/orgs")
      return json(orgs.map((login) => ({ login })));
    if (pathname === "/search/commits") {
      const query = parsed.searchParams.get("q") ?? "";
      return json({
        total_count: search(query).length,
        items: search(query).map((full) => ({
          repository: { full_name: full },
        })),
      });
    }

    const repoMatch = /^\/repos\/([^/]+)\/([^/]+)$/.exec(pathname);
    if (repoMatch) {
      const full = `${repoMatch[1]}/${repoMatch[2]}`;
      return repos[full] ? json(repos[full]) : notFound();
    }

    const contributorsMatch = /^\/repos\/([^/]+)\/([^/]+)\/contributors$/.exec(
      pathname,
    );
    if (contributorsMatch) {
      const full = `${contributorsMatch[1]}/${contributorsMatch[2]}`;
      const entry = contributors[full];
      if (!entry) return notFound();
      // The single-item probe only exists to expose the true total in `link`.
      const body = perPage === 1 ? entry.entries.slice(0, 1) : entry.entries;
      const link = linkHeader(perPage, entry.total);
      return link ? json(body, { link }) : json(body);
    }

    const commitsMatch = /^\/repos\/([^/]+)\/([^/]+)\/commits$/.exec(pathname);
    if (commitsMatch) {
      const full = `${commitsMatch[1]}/${commitsMatch[2]}`;
      const dates = commits[full] ?? [];
      return json(dates.map((date) => ({ commit: { author: { date } } })));
    }

    const userReposMatch = /^\/users\/([^/]+)\/repos$/.exec(pathname);
    if (userReposMatch)
      return json(fixture.userRepos?.[userReposMatch[1]] ?? []);

    const userMatch = /^\/users\/([^/]+)$/.exec(pathname);
    if (userMatch) {
      const profile = profiles[userMatch[1]];
      return profile ? json(profile) : notFound();
    }

    return notFound();
  };
}

let handler = makeApi();
globalThis.fetch = async (input, init) =>
  handler(typeof input === "string" ? input : input.url, init);

const checks = [];
const check = (name, fn) => checks.push({ name, fn });

check("discovers a repo the commit search never surfaces", async () => {
  handler = makeApi({
    graphql: [["spicetify/spicetify-themes", 1]],
    search: () => [],
    repos: {
      "spicetify/spicetify-themes": repoFixture(
        1,
        "spicetify/spicetify-themes",
      ),
    },
    contributors: {
      "spicetify/spicetify-themes": {
        entries: [{ login: "Implycitt", contributions: 1 }],
        total: 113,
      },
    },
    profiles: { spicetify: { login: "spicetify", type: "Organization" } },
  });

  const { contributions } = await fetchGitHubContributions("Implycitt");
  const found = contributions?.find(
    (c) => c.repo.full_name === "spicetify/spicetify-themes",
  );

  assert.ok(found, "expected spicetify/spicetify-themes to be discovered");
  assert.equal(found.commits, 1);
  assert.equal(found.role, "contributor");
});

check(
  "reads the contributor total past the first page instead of capping at 100",
  async () => {
    handler = makeApi({
      graphql: [["org/repo", 52]],
      repos: { "org/repo": repoFixture(2, "org/repo") },
      contributors: {
        "org/repo": {
          entries: [{ login: "Implycitt", contributions: 52 }],
          total: 113,
        },
      },
    });

    const { contributions } = await fetchGitHubContributions("Implycitt");
    const found = contributions?.find((c) => c.repo.full_name === "org/repo");

    assert.ok(found);
    assert.equal(
      found.totalContributors,
      113,
      "expected the Link header total, not the 100-item page length",
    );
    // ceil(113 / 2) = 57, so 52 commits is a contributor; the capped 100 said lead.
    assert.equal(found.role, "contributor");
  },
);

check(
  "falls back to the GraphQL commit count when the user is off the first page",
  async () => {
    handler = makeApi({
      graphql: [["big/project", 3]],
      repos: { "big/project": repoFixture(3, "big/project") },
      contributors: {
        // 113 contributors, but page one belongs to other people.
        "big/project": {
          entries: [{ login: "someone", contributions: 900 }],
          total: 113,
        },
      },
    });

    const { contributions } = await fetchGitHubContributions("Implycitt");
    const found = contributions?.find(
      (c) => c.repo.full_name === "big/project",
    );

    assert.ok(
      found,
      "verified repos must survive a missing contributor page entry",
    );
    assert.equal(found.commits, 3);
    assert.equal(found.totalContributors, 113);
    assert.equal(found.role, "contributor");
  },
);

check("collapses a repo reached through its former owner name", async () => {
  const canonical = repoFixture(42, "GDSCLSU/gdsclsu");
  const contributorEntry = {
    entries: [{ login: "Implycitt", contributions: 55 }],
    total: 8,
  };
  handler = makeApi({
    graphql: [["GDSCLSU/gdsclsu", 55]],
    // Search still indexes the org under the name it used before the rename.
    search: () => ["Google-Developers-Student-Club-LSU/gdsclsu"],
    repos: {
      "GDSCLSU/gdsclsu": canonical,
      // /repos/<old-owner>/<repo> redirects to the same repo.
      "Google-Developers-Student-Club-LSU/gdsclsu": canonical,
    },
    contributors: {
      "GDSCLSU/gdsclsu": contributorEntry,
      "Google-Developers-Student-Club-LSU/gdsclsu": contributorEntry,
    },
  });

  const { contributions } = await fetchGitHubContributions("Implycitt");
  const matches = (contributions ?? []).filter((c) => c.repo.id === 42);

  assert.equal(matches.length, 1, "expected one card for one repo");
  assert.equal(matches[0].commits, 55);
});

check(
  "buckets commit activity into monthly bars for the last year",
  async () => {
    handler = makeApi({
      graphql: [["org/active", 4]],
      repos: { "org/active": repoFixture(4, "org/active") },
      contributors: {
        "org/active": {
          entries: [{ login: "Implycitt", contributions: 4 }],
          total: 1,
        },
      },
      commits: {
        "org/active": [
          monthsAgo(0).toISOString(),
          monthsAgo(2).toISOString(),
          monthsAgo(2).toISOString(),
          monthsAgo(14).toISOString(),
        ],
      },
    });

    const { contributions } = await fetchGitHubContributions("Implycitt");
    const found = contributions?.find((c) => c.repo.full_name === "org/active");

    assert.ok(found?.activity, "expected activity buckets");
    assert.equal(found.activity.length, 12);
    assert.equal(
      found.activity.reduce((sum, count) => sum + count, 0),
      3,
      "commits older than the window must be dropped",
    );
    assert.equal(found.activity[11], 1, "newest month is last");
    assert.equal(found.activity[9], 2);
  },
);

check(
  "deduplicates orgs by canonical login and marks the relationship",
  async () => {
    handler = makeApi({
      orgs: ["GDSCLSU"],
      profiles: {
        // Renamed orgs: the old login still resolves to the new account.
        SASELSU: { login: "GDSCLSU", name: "GDSC", type: "Organization" },
        GDSCLSU: { login: "GDSCLSU", name: "GDSC", type: "Organization" },
        spicetify: {
          login: "spicetify",
          name: "spicetify",
          type: "Organization",
        },
      },
      graphql: [["spicetify/spicetify-themes", 1]],
      repos: {
        "spicetify/spicetify-themes": repoFixture(
          1,
          "spicetify/spicetify-themes",
        ),
      },
      contributors: {
        "spicetify/spicetify-themes": { entries: [], total: 113 },
      },
    });

    const { orgs } = await fetchGitHubContributions("Implycitt");
    const logins = (orgs ?? []).map((o) => o.login);

    assert.equal(
      logins.filter((login) => login === "GDSCLSU").length,
      1,
      "expected one entry per canonical login",
    );
    assert.equal(orgs.find((o) => o.login === "GDSCLSU").member, true);
    assert.equal(orgs.find((o) => o.login === "spicetify").member, false);
    assert.equal(
      logins.indexOf("GDSCLSU") < logins.indexOf("spicetify"),
      true,
      "members sort ahead of contributed-only orgs",
    );
  },
);

check("orders owned repos by commit count and drops forks", async () => {
  handler = makeApi({
    repoCommitCounts: [
      ["quiet", 3],
      ["busy", 46],
      // A fork can out-commit everything and must still be filtered out.
      ["forked", 900],
    ],
    userRepos: {
      Implycitt: [
        repoFixture(1, "Implycitt/quiet"),
        repoFixture(2, "Implycitt/busy"),
        repoFixture(3, "Implycitt/forked", { fork: true }),
        repoFixture(4, "Implycitt/archived", { archived: true }),
        repoFixture(5, "Implycitt/Blog"),
      ],
    },
  });

  const repos = await fetchGitHubRepos("Implycitt", ["Blog"]);

  assert.deepEqual(
    (repos ?? []).map((repo) => repo.name),
    ["busy", "quiet"],
    "expected commit order with forks, archived and excluded repos removed",
  );
  assert.equal(repos[0].commitCount, 46);
  assert.equal(repos[1].commitCount, 3);
});

check("orders contributions by stars, then commits", async () => {
  handler = makeApi({
    graphql: [
      ["tiny/unstarred", 80],
      ["mid/popular", 9],
      ["big/famous", 2],
    ],
    repos: {
      "tiny/unstarred": repoFixture(11, "tiny/unstarred", {
        stargazers_count: 0,
      }),
      "mid/popular": repoFixture(12, "mid/popular", {
        stargazers_count: 40,
      }),
      "big/famous": repoFixture(13, "big/famous", {
        stargazers_count: 6086,
      }),
    },
    contributors: {
      "tiny/unstarred": {
        entries: [{ login: "Implycitt", contributions: 80 }],
        total: 4,
      },
      "mid/popular": {
        entries: [{ login: "Implycitt", contributions: 9 }],
        total: 4,
      },
      "big/famous": {
        entries: [{ login: "Implycitt", contributions: 2 }],
        total: 4,
      },
    },
  });

  const { contributions } = await fetchGitHubContributions("Implycitt");
  const sorted = sortContributionsByStars(contributions ?? []);

  assert.deepEqual(
    sorted.map((c) => c.repo.full_name),
    ["big/famous", "mid/popular", "tiny/unstarred"],
    "stars lead the ordering, commit count settles the starless tail",
  );
});

let failed = 0;
for (const { name, fn } of checks) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}\n    ${error.message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} of ${checks.length} checks failed`);
  process.exit(1);
}
console.log(`\n✓ ${checks.length} contribution checks passed`);
