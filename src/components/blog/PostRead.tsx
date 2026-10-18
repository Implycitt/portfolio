"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import type { Heading } from "@/lib/markdown";
import { scrollToTarget } from "@/lib/scroller";

interface ReadState {
  progress: number;
  active: string | null;
  complete: boolean;
}

const ReadContext = createContext<ReadState>({
  progress: 0,
  active: null,
  complete: false,
});

interface Metrics {
  start: number;
  end: number;
  tops: number[];
}

const READING_LINE = 140;
const SWIPE_DISTANCE = 56;
const SWIPE_RATIO = 1.8;
const SWIPE_WINDOW = 700;

export function PostRead({
  headings,
  fileName,
  filePath,
  dateLabel,
  sourceUrl,
  children,
}: {
  headings: Heading[];
  fileName: string;
  filePath: string;
  dateLabel: string;
  sourceUrl: string | null;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const metrics = useRef<Metrics>({ start: 0, end: 1, tops: [] });
  const activeRef = useRef<string | null>(null);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [focus, setFocus] = useState(false);

  const goTo = useCallback((id: string) => {
    setOutlineOpen(false);
    requestAnimationFrame(() => {
      const node = document.getElementById(id);
      if (!node) return;
      history.replaceState(null, "", `#${id}`);
      scrollToTarget(node);
    });
  }, []);
  const [state, setState] = useState<ReadState>({
    progress: 0,
    active: null,
    complete: false,
  });

  useEffect(() => {
    const root = rootRef.current;
    const article = root?.querySelector("article");
    if (!root || !article) return;

    const nodes = headings.map((heading) =>
      root.querySelector<HTMLElement>(`#${heading.id}`),
    );
    let frame = 0;

    const apply = () => {
      frame = 0;
      const { start, end, tops } = metrics.current;
      const y = window.scrollY;
      const progress = Math.min(
        1,
        Math.max(0, (y - start) / Math.max(1, end - start)),
      );
      const complete = progress > 0.995;

      let index = -1;
      for (let i = 0; i < tops.length; i += 1) {
        if (tops[i] <= y + READING_LINE) index = i;
      }
      const active =
        headings.length > 0 ? headings[Math.max(0, index)].id : null;
      activeRef.current = active;

      root.style.setProperty("--read", progress.toFixed(4));
      root.dataset.read = complete ? "complete" : "reading";
      setState((previous) =>
        previous.progress === progress &&
        previous.active === active &&
        previous.complete === complete
          ? previous
          : { progress, active, complete },
      );
    };

    const measure = () => {
      const rect = article.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const start = top - window.innerHeight * 0.35;
      const scrollable = Math.max(
        0,
        window.document.documentElement.scrollHeight - window.innerHeight,
      );
      metrics.current = {
        start,
        end: Math.max(start + 1, scrollable),
        tops: nodes.map((node) =>
          node ? node.getBoundingClientRect().top + window.scrollY : Infinity,
        ),
      };
      apply();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const resizes = new ResizeObserver(measure);
    resizes.observe(article);
    resizes.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    document.fonts?.ready.then(measure).catch(() => {});
    measure();

    return () => {
      resizes.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let start: { id: number; x: number; y: number; at: number } | null = null;
    let fired = false;

    const insideHorizontalScroller = (node: EventTarget | null) => {
      let el = node instanceof Element ? node : null;
      while (el && el !== root) {
        if (el.scrollWidth > el.clientWidth + 2) {
          const { overflowX } = getComputedStyle(el);
          if (overflowX === "auto" || overflowX === "scroll") return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    const onDown = (event: TouchEvent) => {
      start = null;
      fired = false;

      const touch = event.touches[0];
      if (!touch || !(event.target instanceof Element)) return;
      if (event.touches.length > 1) return;
      if (event.target.closest("a, button, nav, aside")) return;
      if (insideHorizontalScroller(event.target)) return;

      start = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        at: performance.now(),
      };
    };

    const go = (dx: number) => {
      const current = headings.findIndex(
        (heading) => heading.id === activeRef.current,
      );
      const next = Math.max(0, current) + (dx < 0 ? 1 : -1);
      const heading = headings[next];

      if (next < 0) {
        setOutlineOpen(false);
        history.replaceState(null, "", window.location.pathname);
        requestAnimationFrame(() => scrollToTarget(0));
        return;
      }

      if (heading) goTo(heading.id);
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!start || fired || !touch || touch.identifier !== start.id) return;
      if (performance.now() - start.at > SWIPE_WINDOW) {
        start = null;
        return;
      }

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) < SWIPE_DISTANCE) return;
      if (Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return;

      fired = true;
      go(dx);
    };

    const onEnd = () => {
      start = null;
    };

    root.addEventListener("touchstart", onDown, { passive: true });
    root.addEventListener("touchmove", onMove, { passive: true });
    root.addEventListener("touchend", onEnd, { passive: true });
    root.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      root.removeEventListener("touchstart", onDown);
      root.removeEventListener("touchmove", onMove);
      root.removeEventListener("touchend", onEnd);
      root.removeEventListener("touchcancel", onEnd);
    };
  }, [headings, goTo]);

  useEffect(() => {
    setOutlineOpen(false);
    if (focus) document.body.dataset.readFocus = "true";
    else delete document.body.dataset.readFocus;
    return () => {
      delete document.body.dataset.readFocus;
    };
  }, [focus]);

  return (
    <ReadContext.Provider value={state}>
      <div
        ref={rootRef}
        data-read="reading"
        data-focus={focus ? "true" : "false"}
        className="os-app os-read"
      >
        <div className="hud-bar os-titlebar">
          <span className="os-title-icon" aria-hidden />
          <span className="os-filename">{fileName} — DREAMREADER</span>
          <span className="os-title-note hidden sm:inline">{dateLabel}</span>
          <span className="os-title-progress">
            <span className="os-progress-meter" aria-hidden>
              <span />
            </span>
            <span className="os-progress-text">
              <ReadPercent />
            </span>
          </span>
          <span className="os-controls">
            <button
              type="button"
              onClick={() => setFocus((value) => !value)}
              aria-pressed={focus}
              aria-label="Focus mode"
              title="Hide the outline and widen the page"
              className="os-control os-control--max"
            >
              <span className="sr-only">Focus mode</span>
            </button>
            <Link
              href="/blog"
              aria-label="Close and return to all posts"
              title="Close and return to all posts"
              className="os-control os-control--close"
            >
              <span aria-hidden>×</span>
            </Link>
          </span>
        </div>

        <nav className="os-menubar" aria-label="Post">
          <Link href="/blog" className="os-menu">
            ← files
          </Link>
          <a href="#top" className="os-menu">
            top
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
            {focus ? "focus mode" : "read only"}
          </span>
        </nav>

        <div className="os-addressbar">
          <span className="os-address-icon" aria-hidden />
          <span className="os-address-path">{filePath}</span>
          <span className="os-address-badge">{dateLabel}</span>
        </div>

        <div className="os-read-body">
          <Outline
            headings={headings}
            fileName={fileName}
            open={outlineOpen}
            onOpenChange={setOutlineOpen}
            onSelect={goTo}
          />
          <div className="os-read-column">
            <div className="hud-panel os-paper">{children}</div>
          </div>
        </div>

        <div className="os-statusbar">
          <span className="os-status-cell">
            <span className="os-status-lamp" aria-hidden />
            <ReadStatusLine />
          </span>
          <span className="os-status-cell os-status-cell--wide">
            {headings.length > 0
              ? `${headings.length} section(s)`
              : "single pass"}
          </span>
          <span className="os-status-spacer" />
          <Link href="/blog" className="os-status-link">
            all posts <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </ReadContext.Provider>
  );
}

function ReadPercent() {
  const { progress } = useContext(ReadContext);
  return <>{Math.round(progress * 100)}%</>;
}

function ReadStatusLine() {
  const { progress, complete } = useContext(ReadContext);
  return (
    <>{complete ? "end of file" : `reading ${Math.round(progress * 100)}%`}</>
  );
}

function Outline({
  headings,
  fileName,
  open,
  onOpenChange,
  onSelect,
}: {
  headings: Heading[];
  fileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
}) {
  const { active, progress } = useContext(ReadContext);
  const current = headings.find((heading) => heading.id === active);
  const percent = `${Math.round(progress * 100)}%`;

  return (
    <aside className="os-outline" aria-label="Contents">
      <div className="os-outline-head">
        <span className="os-outline-title">contents</span>
        <span className="os-outline-percent">{percent}</span>
      </div>

      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="post-outline"
        className="os-outline-toggle"
      >
        <span className="os-outline-label">contents</span>
        {current ? (
          <>
            <span className="os-outline-slash" aria-hidden>
              /
            </span>
            <span className="os-outline-current">{current.text}</span>
          </>
        ) : (
          <span className="os-outline-current">start of file</span>
        )}
        <span className="os-outline-percent">{percent}</span>
        <span
          className={`os-outline-caret${open ? " is-open" : ""}`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      <div
        id="post-outline"
        className={`os-outline-panel${open ? " is-open" : ""}`}
      >
        <div className="os-outline-meter">
          <span className="os-meter" aria-hidden>
            <span />
          </span>
          <span className="os-outline-count">
            {headings.length > 0
              ? `${String(headings.length).padStart(2, "0")} sections`
              : "single pass"}
          </span>
        </div>

        <nav className="os-outline-nav" aria-label="Sections">
          {headings.map((heading, index) => {
            const isCurrent = heading.id === active;
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                aria-current={isCurrent ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(heading.id);
                }}
                className={`os-outline-row${isCurrent ? " is-current" : ""}${
                  heading.level > 2 ? " os-outline-row--sub" : ""
                }`}
              >
                <span className="os-outline-number" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="os-outline-text">{heading.text}</span>
                <span className="os-outline-arrow" aria-hidden>
                  ▸
                </span>
              </a>
            );
          })}
        </nav>

        <div className="os-outline-file">
          <span className="os-outline-file-label">file</span>
          <span className="os-outline-file-name">{fileName}</span>
        </div>
      </div>
    </aside>
  );
}
