import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchGitHubRepoDetail,
  fetchGitHubContribution,
} from "@/lib/github-repos";
import { renderMarkdown } from "@/lib/markdown";

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
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="terminal-grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[130px]" />
      <div
        aria-hidden
        className="scanlines pointer-events-none fixed inset-0 z-40"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <Link
          href="/projects"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-cyan"
        >
          <span className="text-cyan">←</span> cd ../projects
        </Link>

        <div className="mb-2 flex items-baseline gap-3 font-mono text-xs text-white/40">
          <span className="text-cyan">$</span>
          <span className="text-white/60">
            gh repo view {owner}/{repo.name}
          </span>
          <span className="terminal-caret inline-block h-3.5 w-2 bg-cyan" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-6 sm:p-8">
              {readmeHtml ? (
                <div
                  className="md-body"
                  dangerouslySetInnerHTML={{ __html: readmeHtml }}
                />
              ) : (
                <div className="py-12 text-center font-mono text-sm text-white/35">
                  <span className="text-amber-400/70">!</span> No README found —
                  this repo might be sparse.
                </div>
              )}
            </div>
          </div>

          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-28 space-y-5">
              {!isOwn && contribution && (
                <div className="rounded-lg border border-amber-400/20 bg-black/30 backdrop-blur-sm p-5">
                  <h3 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-amber-300/70 uppercase">
                    my contribution
                  </h3>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">role</span>
                      <span className="text-amber-300/90">
                        {ROLE_LABELS[contribution.role] ?? contribution.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">commits</span>
                      <span className="text-cyan/80">
                        {contribution.commits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">contributors</span>
                      <span className="text-white/60">
                        {contribution.totalContributors}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-5">
                <h3 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
                  repo stats
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  {repo.language && (
                    <div className="flex justify-between">
                      <span className="text-white/40">language</span>
                      <span className="text-cyan/80">{repo.language}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/40">stars</span>
                    <span className="text-yellow-400/80">
                      ★ {repo.stargazers_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">forks</span>
                    <span className="text-cyan/80">⑂ {repo.forks_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">watchers</span>
                    <span className="text-mauve/80">{repo.watchers_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">open issues</span>
                    <span className="text-white/60">
                      {repo.open_issues_count}
                    </span>
                  </div>
                  {repo.license && (
                    <div className="flex justify-between">
                      <span className="text-white/40">license</span>
                      <span className="text-white/60">
                        {repo.license.spdx_id}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/40">size</span>
                    <span className="text-white/60">
                      {fmtBytes(repo.size * 1024)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-5">
                <h3 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
                  dates
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">created</span>
                    <span className="text-white/60">
                      {fmtDate(repo.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">updated</span>
                    <span className="text-white/60">
                      {fmtDate(repo.updated_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">pushed</span>
                    <span className="text-white/60">
                      {fmtDate(repo.pushed_at)}
                    </span>
                  </div>
                </div>
              </div>

              {langs.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-5">
                  <h3 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
                    languages
                  </h3>
                  <div className="space-y-2">
                    {langs.map((l) => (
                      <div
                        key={l.name}
                        className="flex items-center gap-2 font-mono text-[10px]"
                      >
                        <span className="min-w-[5.5rem] text-white/50">
                          {l.name}
                        </span>
                        <div className="h-1.5 flex-1 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
                            style={{ width: `${Math.max(l.pct, 3)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-white/30">
                          {l.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-5">
                <h3 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
                  links
                </h3>
                <div className="space-y-2.5 font-mono text-xs">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 text-white/50 transition-colors hover:text-cyan"
                  >
                    <span className="text-cyan">→</span> github repo
                  </a>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-2 text-white/50 transition-colors hover:text-mauve"
                    >
                      <span className="text-mauve">→</span> live demo
                    </a>
                  )}
                  <a
                    href={`${repo.html_url}/releases`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 text-white/50 transition-colors hover:text-violet"
                  >
                    <span className="text-violet">→</span> releases
                  </a>
                  <a
                    href={`${repo.html_url}/issues`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 text-white/50 transition-colors hover:text-amber-400/70"
                  >
                    <span className="text-amber-400/70">→</span> issues
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
