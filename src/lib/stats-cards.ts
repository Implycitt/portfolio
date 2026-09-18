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
  MOCHA,
  SVG_FONT,
  caption,
  divider,
  esc,
  metric,
  number,
  progressBar,
  unavailableCard,
} from "@/lib/svg-card";

const EXCLUDED_LANGUAGES = new Set(["C#", "ASP.NET"]);

const STREAK_WINDOW_DAYS = 365;

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
      title: "GitHub Stats",
      body: unavailableCard(
        "Stats temporarily unavailable",
        "GitHub API unreachable — retrying shortly",
      ),
    };
  }

  const [col1, col2, col3] = CARD_COLUMNS;
  return {
    title: stats.name,
    note: `@${stats.username}`,
    body: [
      metric(col1, CARD.row1, "FOLLOWERS", number(stats.followers)),
      metric(col2, CARD.row1, "REPOS", number(stats.public_repos)),
      metric(col3, CARD.row1, "STARS", number(stats.total_stars)),
      metric(col1, CARD.row2, "FORKS", number(stats.total_forks)),
      metric(col2, CARD.row2, "WATCHERS", number(stats.total_watchers)),
      metric(col3, CARD.row2, "FOLLOWING", number(stats.following)),
    ].join("\n  "),
  };
}

export function streakCardContent(
  streak: GitHubStreakData | null,
): CardContent {
  if (!streak) {
    return {
      title: "Contribution Streak",
      body: unavailableCard(
        "Streak temporarily unavailable",
        "Needs GITHUB_TOKEN to read contribution data",
      ),
    };
  }

  const [col1, col2, col3] = CARD_COLUMNS;
  const activeDays = streak.days.filter((day) => day.count > 0).length;

  return {
    title: "Contribution Streak",
    note: `Last ${STREAK_WINDOW_DAYS} days`,
    body: [
      metric(
        col1,
        CARD.row1,
        "CURRENT STREAK",
        number(streak.currentStreak),
        "days",
      ),
      metric(
        col2,
        CARD.row1,
        "LONGEST STREAK",
        number(streak.longestStreak),
        "days",
      ),
      metric(
        col3,
        CARD.row1,
        "CONTRIBUTIONS",
        number(streak.totalContributions),
      ),
      divider(132),
      caption(
        CARD.inset,
        CARD.captionY,
        `ACTIVE DAYS · ${number(activeDays)}/${STREAK_WINDOW_DAYS}`,
      ),
      progressBar(CARD.barY, activeDays / STREAK_WINDOW_DAYS),
    ].join("\n  "),
  };
}

const MAX_ROWS = 4;
const ROW_PITCH = 30;
const FIRST_ROW_Y = 74;
const BAR_X = 128;
const BAR_W = 210;
const BAR_HEIGHT = 9;

function languageRows(languages: GitHubLanguageData[]): string {
  const total = languages.reduce((sum, lang) => sum + lang.bytes, 0) || 1;

  return languages
    .slice(0, MAX_ROWS)
    .map((lang, i) => {
      const y = FIRST_ROW_Y + i * ROW_PITCH;
      const pct = (lang.bytes / total) * 100;
      const barW = Math.max(3, (lang.bytes / total) * BAR_W);
      const name =
        lang.name.length > 16 ? `${lang.name.slice(0, 15)}…` : lang.name;
      return `
    <text x="${CARD.inset}" y="${y}" font-family="${SVG_FONT}" font-size="11" fill="${MOCHA.subtext0}">${esc(name)}</text>
    <rect x="${BAR_X}" y="${y - BAR_HEIGHT + 1}" width="${BAR_W}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${MOCHA.surface0}"/>
    <rect x="${BAR_X}" y="${y - BAR_HEIGHT + 1}" width="${barW.toFixed(1)}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${MOCHA.mauve}"/>
    <text x="${CARD_W - CARD.inset}" y="${y}" text-anchor="end" font-family="${SVG_FONT}" font-size="10" fill="${MOCHA.overlay1}">${pct.toFixed(1)}%</text>`;
    })
    .join("");
}

function tailNote(languages: GitHubLanguageData[]): string {
  const hidden = languages.length - MAX_ROWS;
  if (hidden <= 0) return "";
  return caption(
    CARD.inset,
    CARD.tailY,
    `+${hidden} more language${hidden === 1 ? "" : "s"}`,
  );
}

export function languagesCardContent(
  languages: GitHubLanguageData[] | null,
  username: string,
): CardContent {
  if (languages === null) {
    return {
      title: "Languages",
      body: unavailableCard(
        "Languages temporarily unavailable",
        "GitHub API unreachable — retrying shortly",
      ),
    };
  }

  if (languages.length === 0) {
    return {
      title: "Languages",
      body: unavailableCard(
        "No language data yet",
        "No bytes to chart — push some code and check back",
      ),
    };
  }

  return {
    title: "Languages",
    note: `@${username}`,
    body: [languageRows(languages), tailNote(languages)]
      .filter(Boolean)
      .join("\n  "),
  };
}

export function contributionsCardContent(
  totals: GitHubContributionTotalsData | null,
): CardContent {
  if (!totals) {
    return {
      title: "Contributions",
      body: unavailableCard(
        "Contribution totals unavailable",
        "Needs GITHUB_TOKEN to read contribution data",
      ),
    };
  }

  const [col1, col2, col3] = CARD_COLUMNS;
  return {
    title: "Contributions",
    note: `Last ${STREAK_WINDOW_DAYS} days`,
    body: [
      metric(
        col1,
        CARD.row1,
        "MERGED PRS",
        totals.mergedPullRequests === null
          ? "—"
          : number(totals.mergedPullRequests),
        totals.mergedPullRequests === null ? undefined : "all time",
      ),
      metric(col2, CARD.row1, "PRS OPENED", number(totals.pullRequests)),
      metric(col3, CARD.row1, "REVIEWS", number(totals.reviews)),
      metric(col1, CARD.row2, "COMMITS", number(totals.commits)),
      metric(col2, CARD.row2, "REPOS CONTRIBUTED", number(totals.repositories)),
      metric(col3, CARD.row2, "ISSUES", number(totals.issues)),
    ].join("\n  "),
  };
}
