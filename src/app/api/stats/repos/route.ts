import { fetchGitHubRepos, type GitHubRepoInfo } from "@/lib/github-stats";
import {
  SVG_CYAN,
  SVG_FONT,
  SVG_MAUVE,
  esc,
  number,
  svgDocument,
  svgResponse,
} from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

const W = 520;
const H = 420;
const TILE_W = 234;
const TILE_H = 84;
const COL_X = [20, 266];
const ROW_Y = [86, 182, 278];

function wrap(text: string, maxChars: number, maxLines: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  let truncated = false;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) {
        truncated = true;
        break;
      }
    } else {
      line = next;
    }
  }
  if (!truncated && line) lines.push(line);
  const out = lines.join("\n");
  return truncated ? `${out}…` : out;
}

function tile(repo: GitHubRepoInfo, x: number, y: number): string {
  const name = repo.name.length > 26 ? `${repo.name.slice(0, 24)}…` : repo.name;
  const desc = wrap(repo.description, 34, 2).split("\n");
  const bottom = `★ ${number(repo.stars)} · forks ${number(repo.forks)}`;
  return `
  <g>
    <rect x="${x}" y="${y}" width="${TILE_W}" height="${TILE_H}" rx="8" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.12"/>
    <text x="${x + 12}" y="${y + 20}" font-family="${SVG_FONT}" font-size="12" font-weight="700" fill="${SVG_CYAN}">${esc(name)}</text>
    ${desc
      .map(
        (line, i) =>
          `<text x="${x + 12}" y="${y + 38 + i * 13}" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.6">${esc(line)}</text>`
      )
      .join("")}
    <circle cx="${x + 13}" cy="${y + 68}" r="3" fill="${SVG_MAUVE}"/>
    <text x="${x + 22}" y="${y + 72}" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.6">${repo.language ? esc(repo.language) : "—"}</text>
    <text x="${x + TILE_W - 12}" y="${y + 72}" text-anchor="end" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.6">${esc(bottom)}</text>
  </g>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;
  const repos = await fetchGitHubRepos(username);

  const grid = repos
    ? repos
        .map((repo, i) => tile(repo, COL_X[i % 2], ROW_Y[Math.floor(i / 2)]))
        .join("")
    : "";

  const body = repos === null
    ? `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./repos.sh --top 6</text>
       <text x="20" y="110" font-family="${SVG_FONT}" font-size="15" fill="#ffffff" opacity="0.8">repos temporarily unavailable</text>
       <text x="20" y="134" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">// github api unreachable — retrying shortly</text>
       <text x="20" y="400" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`
    : repos.length === 0
      ? `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
         <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./repos.sh --top 6</text>
         <text x="20" y="110" font-family="${SVG_FONT}" font-size="15" fill="#ffffff" opacity="0.8">no public repos yet</text>
         <text x="20" y="134" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">// push something shiny and it will appear here</text>
         <text x="20" y="400" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`
      : `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
         <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./repos.sh --top ${repos.length}</text>
         ${grid}
         <text x="20" y="400" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// top repos by stars · refreshed 5m</text>`;

  return svgResponse(svgDocument(W, H, "~/repos.sh — bash — tty1", body));
}
