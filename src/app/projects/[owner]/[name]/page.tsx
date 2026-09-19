import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Panel from "@/components/ui/Panel";
import PageBackdrop from "@/components/ui/PageBackdrop";
import Link from "next/link";
import Icon from "@/components/ui/icons";
import {
  fetchGitHubRepoDetail,
  fetchGitHubContribution,
} from "@/lib/github-repos";
import { renderMarkdown } from "@/lib/markdown";
import { tagBar, tagColor } from "@/lib/tag-color";
import "katex/dist/katex.min.css";

interface Props {
  params: Promise<{ owner: string; name: string }>;
}

export const revalidate = 3600;

const GITHUB_USER = process.env.GITHUB_USERNAME ?? "Implycitt";

const ROLE_LABELS: Record<string, string> = {
  "sole-author": "sole author",
  lead: "lead contributor",
  contributor: "contributor",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

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
    .map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 100) }));
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

        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-4">
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

          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noreferrer noopener"
              className="ml-auto inline-flex items-center gap-2 rounded-xl border border-mocha-surface bg-mocha-base px-4 py-2 font-mono text-[11px] tracking-widest uppercase text-mocha-subtext transition-colors hover:border-mocha-mauve hover:text-mocha-text"
            >
              <Icon name="external" className="h-3.5 w-3.5" />
              live demo
            </a>
          )}
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
                      {fmtDate(repo.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-mocha-overlay1">updated</span>
                    <span className="text-mocha-subtext">
                      {fmtDate(repo.updated_at)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-mocha-overlay1">pushed</span>
                    <span className="text-mocha-subtext">
                      {fmtDate(repo.pushed_at)}
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
                          {l.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              <Panel
                title="Links"
                icon={<Icon name="link" className="h-3.5 w-3.5" />}
              >
                <div className="space-y-2.5 font-mono text-xs">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center gap-2 text-mocha-subtext transition-colors hover:text-mocha-mauve"
                  >
                    <Icon name="github" className="h-3.5 w-3.5" />
                    GitHub repo
                  </a>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-center gap-2 text-mocha-subtext transition-colors hover:text-mocha-lavender"
                    >
                      <Icon name="external" className="h-3.5 w-3.5" />
                      Live demo
                    </a>
                  )}
                  <a
                    href={`${repo.html_url}/releases`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center gap-2 text-mocha-subtext transition-colors hover:text-mocha-sapphire"
                  >
                    <Icon name="box" className="h-3.5 w-3.5" />
                    Releases
                  </a>
                  <a
                    href={`${repo.html_url}/issues`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center gap-2 text-mocha-subtext transition-colors hover:text-mocha-teal"
                  >
                    <Icon name="info" className="h-3.5 w-3.5" />
                    Issues
                  </a>
                </div>
              </Panel>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
