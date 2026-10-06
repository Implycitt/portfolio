import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Panel from "@/components/ui/Panel";
import PageBackdrop from "@/components/ui/PageBackdrop";
import Link from "next/link";
import Icon from "@/components/ui/icons";
import { fetchGitHubRepoDetail } from "@/lib/github-repos";
import {
  fetchGitHubContribution,
  ROLE_LABELS,
} from "@/lib/github-contributions";
import { renderMarkdown } from "@/lib/markdown";
import { tagBar, tagColor } from "@/lib/tag-color";
import { formatDate } from "@/lib/dates";
import "katex/dist/katex.min.css";

interface Props {
  params: Promise<{ owner: string; name: string }>;
}

export const revalidate = 3600;

const GITHUB_USER = process.env.GITHUB_USERNAME ?? "Implycitt";

function fmtBytes(bytes: number): string {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
}

function languagePercent(
  languages: Record<string, number>,
): { name: string; pct: number }[] {
  const total = Object.values(languages).reduce((s, b) => s + b, 0);
  if (total === 0) return [];
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, bytes]) => ({ name, pct: (bytes / total) * 100 }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, name } = await params;
  return { title: `${owner}/${name} — Projects — Quentin Bordelon` };
}

export default async function ProjectDetail({ params }: Props) {
  const { owner, name } = await params;
  const [repo, contribution] = await Promise.all([
    fetchGitHubRepoDetail(owner, name),
    owner.toLowerCase() === GITHUB_USER.toLowerCase()
      ? Promise.resolve(null)
      : fetchGitHubContribution(owner, name, GITHUB_USER),
  ]);

  if (!repo) notFound();

  const readmeHtml = repo.readme
    ? renderMarkdown(
        repo.readme,
        `https://raw.githubusercontent.com/${owner}/${repo.name}/${repo.default_branch ?? "HEAD"}`,
        `https://github.com/${owner}/${repo.name}/blob/${repo.default_branch ?? "HEAD"}`,
      )
    : null;
  const langs = languagePercent(repo.languages);
  const isOwn = owner.toLowerCase() === GITHUB_USER.toLowerCase();

  return (
    <main
      id="content"
      tabIndex={-1}
      className="relative min-h-screen text-foreground overflow-hidden"
    >
      <PageBackdrop top="orbit" bottom="constellation" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <Link
          href="/projects"
          className="group mb-8 inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-mocha-overlay1 transition-colors hover:text-mocha-mauve"
        >
          <Icon
            name="arrowLeft"
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          Projects
        </Link>

        <div className="mb-8 grid gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1fr)_max-content]">
          <div className="flex min-w-0 items-start gap-4 lg:col-start-1">
            <span className="interest-tile flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-mocha-mauve/25 bg-mocha-mauve/10 text-mocha-mauve">
              <Icon name="box" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="font-mono text-2xl font-bold break-words text-mocha-text sm:text-3xl">
                {repo.name}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-wide text-mocha-overlay1">
                <span className="text-mocha-mauve/80">{owner}</span>
                {repo.language && (
                  <>
                    <span className="text-mocha-surface">·</span>
                    <span>{repo.language}</span>
                  </>
                )}
                {contribution && (
                  <>
                    <span className="text-mocha-surface">·</span>
                    <span className="text-mocha-sapphire">
                      {ROLE_LABELS[contribution.role] ?? contribution.role}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <nav
            aria-label="Project links"
            className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:w-max lg:justify-end"
          >
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-mocha-mauve/50 bg-gradient-to-br from-mocha-mauve/20 to-mocha-mauve/5 px-3 py-2.5 font-mono text-xs font-semibold tracking-wide text-mocha-text shadow-[0_0_18px_-9px_rgba(203,166,247,0.8)] transition-[transform,border-color,background-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-mocha-mauve hover:from-mocha-mauve/30 hover:to-mocha-mauve/10 hover:shadow-[0_0_22px_-6px_rgba(203,166,247,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha-mauve motion-reduce:transform-none"
            >
              <Icon name="github" className="h-4 w-4 text-mocha-mauve" />
              GitHub repo
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-mocha-sapphire/50 bg-gradient-to-br from-mocha-sapphire/20 to-mocha-sapphire/5 px-3 py-2.5 font-mono text-xs font-semibold tracking-wide text-mocha-text shadow-[0_0_18px_-9px_rgba(116,199,236,0.8)] transition-[transform,border-color,background-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-mocha-sapphire hover:from-mocha-sapphire/30 hover:to-mocha-sapphire/10 hover:shadow-[0_0_22px_-6px_rgba(116,199,236,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha-sapphire motion-reduce:transform-none"
              >
                <Icon name="external" className="h-4 w-4 text-mocha-sapphire" />
                Live demo
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <a
              href={`${repo.html_url}/releases`}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-mocha-lavender/30 bg-gradient-to-br from-mocha-lavender/10 to-mocha-base/70 px-3 py-2.5 font-mono text-xs font-semibold tracking-wide text-mocha-subtext transition-[transform,border-color,background-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-mocha-lavender hover:text-mocha-lavender hover:shadow-[0_0_18px_-8px_rgba(180,190,254,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha-lavender motion-reduce:transform-none"
            >
              <Icon name="box" className="h-4 w-4" />
              Releases
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={`${repo.html_url}/issues`}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-mocha-teal/30 bg-gradient-to-br from-mocha-teal/10 to-mocha-base/70 px-3 py-2.5 font-mono text-xs font-semibold tracking-wide text-mocha-subtext transition-[transform,border-color,background-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-mocha-teal hover:text-mocha-teal hover:shadow-[0_0_18px_-8px_rgba(148,226,213,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha-teal motion-reduce:transform-none"
            >
              <Icon name="info" className="h-4 w-4" />
              Issues
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="min-w-0 flex-1">
            <Panel
              title="README"
              note={repo.default_branch ?? "main"}
              icon={<Icon name="doc" className="h-3.5 w-3.5" />}
            >
              {readmeHtml ? (
                <div
                  className="md-body"
                  dangerouslySetInnerHTML={{ __html: readmeHtml }}
                />
              ) : (
                <div className="py-12 text-center font-mono text-sm text-mocha-overlay0">
                  No README found — this repo might be sparse.
                </div>
              )}
            </Panel>
          </div>

          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-28 space-y-5">
              {!isOwn && contribution && (
                <Panel
                  title="My contribution"
                  icon={<Icon name="user" className="h-3.5 w-3.5" />}
                >
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-mocha-overlay1">role</span>
                      <span className="text-mocha-mauve">
                        {ROLE_LABELS[contribution.role] ?? contribution.role}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-mocha-overlay1">commits</span>
                      <span className="text-mocha-sapphire">
                        {contribution.commits}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-mocha-overlay1">contributors</span>
                      <span className="text-mocha-subtext">
                        {contribution.totalContributors}
                      </span>
                    </div>
                  </div>
                </Panel>
              )}

              <Panel
                title="Repo stats"
                icon={<Icon name="activity" className="h-3.5 w-3.5" />}
              >
                <div className="space-y-3 font-mono text-xs">
                  {repo.language && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-mocha-overlay1">language</span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] ${tagColor(repo.language)}`}
                      >
                        {repo.language}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-mocha-overlay1">stars</span>
                    <span className="flex items-center gap-1.5 text-mocha-pink">
                      <Icon name="star" className="h-3.5 w-3.5" />
                      {repo.stargazers_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-mocha-overlay1">forks</span>
                    <span className="flex items-center gap-1.5 text-mocha-sapphire">
                      <Icon name="fork" className="h-3.5 w-3.5" />
                      {repo.forks_count}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-mocha-overlay1">watchers</span>
                    <span className="text-mocha-mauve">
                      {repo.watchers_count}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-mocha-overlay1">open issues</span>
                    <span className="text-mocha-subtext">
                      {repo.open_issues_count}
                    </span>
                  </div>
                  {repo.license && (
                    <div className="flex justify-between gap-3">
                      <span className="text-mocha-overlay1">license</span>
                      <span className="text-mocha-subtext">
                        {repo.license.spdx_id}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <span className="text-mocha-overlay1">size</span>
                    <span className="text-mocha-subtext">
                      {fmtBytes(repo.size * 1024)}
                    </span>
                  </div>
                </div>
              </Panel>

              <Panel
                title="Dates"
                icon={<Icon name="clock" className="h-3.5 w-3.5" />}
              >
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-mocha-overlay1">created</span>
                    <span className="text-mocha-subtext">
                      {formatDate(repo.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-mocha-overlay1">updated</span>
                    <span className="text-mocha-subtext">
                      {formatDate(repo.updated_at)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-mocha-overlay1">pushed</span>
                    <span className="text-mocha-subtext">
                      {formatDate(repo.pushed_at)}
                    </span>
                  </div>
                </div>
              </Panel>

              {langs.length > 0 && (
                <Panel
                  title="Languages"
                  icon={<Icon name="globe" className="h-3.5 w-3.5" />}
                >
                  <div className="space-y-2">
                    {langs.map((l) => (
                      <div
                        key={l.name}
                        className="group flex items-center gap-2 font-mono text-[10px]"
                      >
                        <span className="min-w-[5.5rem] text-mocha-overlay1">
                          {l.name}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mocha-surface">
                          <div
                            className={`h-full rounded-full opacity-80 transition-opacity duration-300 group-hover:opacity-100 ${tagBar(l.name)}`}
                            style={{ width: `${Math.max(l.pct, 3)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-mocha-overlay0">
                          {l.pct < 1 ? "<1%" : `${Math.round(l.pct)}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
