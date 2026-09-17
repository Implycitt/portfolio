import type {
  GitHubContributionTotalsData,
  GitHubLanguageData,
  GitHubStatsData,
  GitHubStreakData,
} from "@/lib/github-stats";
import type { CardContent } from "@/lib/svg-card";
import {
  CARD,
  CARD_COLUMNS,
  CARD_W,
  SVG_CYAN,
  SVG_FONT,
  SVG_MAUVE,
  SVG_PINK,
  SVG_VIOLET,
  capsLabel,
  cardFooter,
  divider,
  esc,
  metaLine,
  metric,
  number,
  progressBar,
  promptLine,
  unavailableCard,
} from "@/lib/svg-card";

const EXCLUDED_LANGUAGES = new Set(["C#", "ASP.NET"]);

export function visibleLanguages(
  languages: GitHubLanguageData[] | null,
): GitHubLanguageData[] | null {
  return languages === null
    ? null
    : languages.filter((lang) => !EXCLUDED_LANGUAGES.has(lang.name));
}

export function statsCardContent(stats: GitHubStatsData | null): CardContent {
  if (!stats) {
    return {
      title: "~/stats.sh — bash — tty1",
      body: unavailableCard(
        "./stats.sh --live",
        "stats temporarily unavailable",
        "// github api unreachable — retrying shortly",
      ),
    };
  }

  const [col1, col2, col3] = CARD_COLUMNS;
  return {
    title: `${stats.name} · ~/stats.sh`,
    body: [
      promptLine("./stats.sh --live"),
      metaLine(
        `@${stats.username} · ${stats.profile_url.replace("https://", "")}`,
      ),
      divider(CARD.ruleY),
      metric(col1, CARD.row1, "FOLLOWERS", number(stats.followers), SVG_CYAN),
      metric(
        col2,
        CARD.row1,
        "PUBLIC REPOS",
        number(stats.public_repos),
        SVG_MAUVE,
      ),
      metric(col3, CARD.row1, "STARS", number(stats.total_stars), SVG_PINK),
      metric(col1, CARD.row2, "FORKS", number(stats.total_forks), SVG_VIOLET),
      metric(
        col2,
        CARD.row2,
        "WATCHERS",
        number(stats.total_watchers),
        SVG_CYAN,
      ),
      metric(col3, CARD.row2, "FOLLOWING", number(stats.following), SVG_MAUVE),
      cardFooter(),
    ].join("\n  "),
  };
}

export function streakCardContent(
  streak: GitHubStreakData | null,
): CardContent {
  if (!streak) {
    return {
      title: "~/streak.sh — bash — tty1",
      body: unavailableCard(
        "./streak.sh --live",
        "streak temporarily unavailable",
        "// needs GITHUB_TOKEN to read contribution data",
      ),
    };
  }

  const [col1, col2, col3] = CARD_COLUMNS;
  const activeDays = streak.days.filter((day) => day.count > 0).length;

  return {
    title: "~/streak.sh — bash — tty1",
    body: [
      promptLine("./streak.sh --live"),
      metaLine(`@${streak.username} · last 365 days`),
      divider(CARD.ruleY),
      metric(
        col1,
        104,
        "CURRENT STREAK",
        number(streak.currentStreak),
        SVG_CYAN,
        "days",
      ),
      metric(
        col2,
        104,
        "LONGEST STREAK",
        number(streak.longestStreak),
        SVG_VIOLET,
        "days",
      ),
      metric(
        col3,
        104,
        "LAST 365 DAYS",
        number(streak.totalContributions),
        SVG_MAUVE,
        "contribs",
      ),
      divider(146),
      capsLabel(CARD.inset, 164, `ACTIVE DAYS · ${number(activeDays)}/365`),
      progressBar(172, activeDays / 365),
      cardFooter(),
    ].join("\n  "),
  };
}

const MAX_ROWS = 4;
const ROW_PITCH = 26;
const FIRST_ROW_Y = 100;
const BAR_X = 132;
const BAR_W = 214;

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

function languageRows(languages: GitHubLanguageData[]): string {
  const total = languages.reduce((sum, lang) => sum + lang.bytes, 0) || 1;

  return languages
    .slice(0, MAX_ROWS)
    .map((lang, i) => {
      const y = FIRST_ROW_Y + i * ROW_PITCH;
      const pct = (lang.bytes / total) * 100;
      const barW = Math.max(3, (lang.bytes / total) * BAR_W);
      const label =
        lang.name.length > 18 ? `${lang.name.slice(0, 16)}…` : lang.name;
      return `
    <text x="${CARD.inset}" y="${y}" font-family="${SVG_FONT}" font-size="10.5" fill="${SVG_MAUVE}">${esc(label)}</text>
    <rect x="${BAR_X}" y="${y - 8}" width="${BAR_W}" height="8" rx="4" fill="#ffffff" fill-opacity="0.06"/>
    <rect x="${BAR_X}" y="${y - 8}" width="${barW.toFixed(1)}" height="8" rx="4" fill="url(#accent)" fill-opacity="0.85"/>
    <text x="${CARD_W - CARD.inset}" y="${y}" text-anchor="end" font-family="${SVG_FONT}" font-size="9.5" fill="${SVG_CYAN}">${pct.toFixed(1)}%</text>`;
    })
    .join("");
}

function tailNote(languages: GitHubLanguageData[]): string {
  const rest = languages.slice(MAX_ROWS);
  const restBytes = rest.reduce((sum, lang) => sum + lang.bytes, 0);
  if (restBytes === 0) return "// bytes of code per language · refreshed 5m";
  return `// +${formatBytes(restBytes)} across ${rest.length} more language${
    rest.length === 1 ? "" : "s"
  } · refreshed 5m`;
}

export function languagesCardContent(
  languages: GitHubLanguageData[] | null,
  username: string,
): CardContent {
  if (languages === null) {
    return {
      title: "~/langs.sh — bash — tty1",
      body: unavailableCard(
        "./langs.sh --bytes",
        "languages temporarily unavailable",
        "// github api unreachable — retrying shortly",
      ),
    };
  }

  if (languages.length === 0) {
    return {
      title: "~/langs.sh — bash — tty1",
      body: unavailableCard(
        "./langs.sh --bytes",
        "no language data yet",
        "// no bytes to chart — push some code and check back",
      ),
    };
  }

  return {
    title: "~/langs.sh — bash — tty1",
    body: [
      promptLine("./langs.sh --bytes"),
      metaLine(`@${username} · share by bytes of code`),
      divider(CARD.ruleY),
      languageRows(languages),
      cardFooter(tailNote(languages)),
    ].join("\n  "),
  };
}

export function contributionsCardContent(
  totals: GitHubContributionTotalsData | null,
): CardContent {
  if (!totals) {
    return {
      title: "~/contrib.sh — bash — tty1",
      body: unavailableCard(
        "./contrib.sh --totals",
        "contribution totals unavailable",
        "// needs GITHUB_TOKEN to read contribution data",
      ),
    };
  }

  const [col1, col2, col3] = CARD_COLUMNS;
  return {
    title: "~/contrib.sh — bash — tty1",
    body: [
      promptLine("./contrib.sh --totals"),
      metaLine(`@${totals.username} · contributions, last 365 days`),
      divider(CARD.ruleY),
      metric(
        col1,
        CARD.row1,
        "MERGED PRS · ALL",
        totals.mergedPullRequests === null
          ? "—"
          : number(totals.mergedPullRequests),
        SVG_PINK,
      ),
      metric(
        col2,
        CARD.row1,
        "PRS OPENED · 365D",
        number(totals.pullRequests),
        SVG_CYAN,
      ),
      metric(
        col3,
        CARD.row1,
        "REVIEWS · 365D",
        number(totals.reviews),
        SVG_VIOLET,
      ),
      metric(
        col1,
        CARD.row2,
        "COMMITS · 365D",
        number(totals.commits),
        SVG_CYAN,
      ),
      metric(
        col2,
        CARD.row2,
        "REPOS · 365D",
        number(totals.repositories),
        SVG_MAUVE,
      ),
      metric(
        col3,
        CARD.row2,
        "ISSUES · 365D",
        number(totals.issues),
        SVG_MAUVE,
      ),
      cardFooter("// contributions + merged PRs · refreshed 5m"),
    ].join("\n  "),
  };
}
