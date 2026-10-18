"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

export interface BlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  readMinutes: string;
  category: string;
}

const MENU_LINKS = [
  { label: "home", href: "/" },
  { label: "projects", href: "/projects" },
  { label: "resume", href: "/resume" },
  { label: "blog", href: "/blog" },
];

export default function BlogDesktop({
  posts,
  feedLabel,
  sourceUrl,
}: {
  posts: BlogListItem[];
  feedLabel: string;
  sourceUrl: string | null;
}) {
  const [folder, setFolder] = useState("all");
  const [startOpen, setStartOpen] = useState(false);
  const startRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const folders = Array.from(
    new Set(posts.map((post) => post.category)),
  ).sort();
  const shown =
    folder === "all" ? posts : posts.filter((post) => post.category === folder);
  const path =
    folder === "all"
      ? "C:\\DREAMDRIVE\\BLOG"
      : `C:\\DREAMDRIVE\\BLOG\\${folder.replaceAll("/", "\\").toUpperCase()}`;

  useEffect(() => {
    if (!startOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setStartOpen(false);
      startRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (startRef.current?.contains(target)) return;
      setStartOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [startOpen]);

  return (
    <div className="os-stack">
      <div className="os-app os-explorer">
        <div className="hud-bar os-titlebar">
          <span className="os-title-icon" aria-hidden />
          <span className="os-filename">~/BLOG — FILE MANAGER</span>
          <span className="os-title-note hidden sm:inline">
            dreamdrive (C:)
          </span>
        </div>

        <nav className="os-menubar" aria-label="Blog">
          <a href="#content" className="os-menu">
            files
          </a>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="os-menu"
            >
              source ↗
            </a>
          ) : null}
          <span className="os-menubar-spacer" />
          <span className="os-menubar-note">
            {String(posts.length).padStart(2, "0")} recovered
          </span>
        </nav>

        <div className="os-addressbar">
          <span className="os-address-icon" aria-hidden />
          <span className="os-address-path">
            <span key={folder} className="os-address-text">
              {path}
            </span>
          </span>
          <span className="os-address-badge">read only</span>
        </div>

        <div className="os-explorer-body">
          <aside className="os-tree" aria-label="Folders">
            <p className="os-tree-heading">folders</p>
            <nav className="os-tree-nav" aria-label="Filter posts by folder">
              <button
                type="button"
                onClick={() => setFolder("all")}
                aria-pressed={folder === "all"}
                aria-controls="post-file-list"
                className="os-folder-row"
              >
                <span className="os-folder os-folder--open" aria-hidden />
                <span className="os-folder-name">all files</span>
                <span className="os-folder-count">{posts.length}</span>
              </button>
              {folders.map((name) => {
                const count = posts.filter(
                  (post) => post.category === name,
                ).length;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFolder(name)}
                    aria-pressed={folder === name}
                    aria-controls="post-file-list"
                    className="os-folder-row"
                  >
                    <span className="os-folder" aria-hidden />
                    <span className="os-folder-name">{name}</span>
                    <span className="os-folder-count">{count}</span>
                  </button>
                );
              })}
            </nav>

            <div className="os-readme">
              <div className="os-readme-bar">
                <span className="os-readme-icon" aria-hidden />
                readme.txt
              </div>
              <p>
                Where I figure things out — math, physics, and code I keep
                rebuilding.
              </p>
              <p className="os-readme-fine">notes, not tutorials</p>
            </div>
          </aside>

          <section className="os-files" aria-label="Blog posts">
            <div className="os-file-head" aria-hidden>
              <span>name</span>
              <span>modified</span>
            </div>

            {shown.length === 0 ? (
              <div id="post-file-list" className="os-empty">
                <p className="os-empty-title">this folder is empty</p>
                <p>The machine is still dreaming about this one.</p>
              </div>
            ) : (
              <ul id="post-file-list" key={folder} className="os-file-list">
                {shown.map((post, index) => (
                  <li
                    key={post.slug}
                    className="os-file-item"
                    style={{ animationDelay: `${Math.min(index, 6) * 55}ms` }}
                  >
                    <Link href={`/blog/${post.slug}`} className="os-file-row">
                      <span className="os-file-icon" aria-hidden />
                      <span className="os-file-main">
                        <span className="os-file-name">
                          {post.title}
                          {post === posts[0] ? (
                            <span className="os-new">latest</span>
                          ) : null}
                        </span>
                        {post.excerpt ? (
                          <span className="os-file-excerpt">
                            {post.excerpt}
                          </span>
                        ) : null}
                        <span className="os-file-tags">
                          <span className="os-chip">{post.tag}</span>
                          <span className="os-file-folder">
                            {post.category}/
                          </span>
                        </span>
                      </span>
                      <span className="os-file-side">
                        <span className="os-file-date">{post.date}</span>
                        <span className="os-file-size">
                          {post.readMinutes} read
                        </span>
                      </span>
                      <span className="os-file-open" aria-hidden>
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="os-files-foot" aria-hidden>
              <span className="os-files-foot-rule" />
              <span className="os-files-foot-title">end of directory</span>
              <span className="os-files-foot-note">
                that&apos;s everything that survived the crash.
              </span>
            </div>
          </section>
        </div>

        <div className="os-statusbar">
          <span
            className="os-status-cell"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="os-status-lamp" aria-hidden />
            {String(shown.length).padStart(2, "0")} object(s)
          </span>
          <span className="os-status-cell os-status-cell--wide">
            {feedLabel}
          </span>
          <span className="os-status-spacer" />
          <span className="os-status-cell">1.44 MB free</span>
        </div>
      </div>

      <div className="os-taskbar">
        <div className="os-start-wrap">
          <button
            ref={startRef}
            type="button"
            onClick={() => setStartOpen((open) => !open)}
            aria-expanded={startOpen}
            aria-controls={menuId}
            className="os-start"
          >
            <span className="os-start-glyph" aria-hidden />
            start
          </button>

          <div
            ref={menuRef}
            id={menuId}
            className="os-start-menu"
            hidden={!startOpen}
          >
            <p className="os-start-head">DREAMDRIVE 98</p>
            <div className="os-start-links">
              {MENU_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="os-start-link"
                  onClick={() => setStartOpen(false)}
                >
                  <span aria-hidden>▸</span>
                  {link.label}
                </Link>
              ))}
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="os-start-link"
                  onClick={() => setStartOpen(false)}
                >
                  <span aria-hidden>▸</span>
                  source ↗
                </a>
              ) : null}
            </div>
            <p className="os-start-foot">all systems dreaming</p>
          </div>
        </div>

        <span className="os-task os-task--active">
          <span className="os-task-icon" aria-hidden />
          ~/BLOG
        </span>
        <span className="os-tray">
          <span className="os-tray-lamp" aria-hidden />
          dreamdrive online
        </span>
      </div>
    </div>
  );
}
