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
  children,
}: {
  headings: Heading[];
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const metrics = useRef<Metrics>({ start: 0, end: 1, tops: [] });
  const activeRef = useRef<string | null>(null);
  const [outlineOpen, setOutlineOpen] = useState(false);

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

  return (
    <ReadContext.Provider value={state}>
      <div
        ref={rootRef}
        data-read="reading"
        className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-10"
      >
        <Outline
          headings={headings}
          open={outlineOpen}
          onOpenChange={setOutlineOpen}
          onSelect={goTo}
        />
        <div className="min-w-0 lg:order-1">{children}</div>
      </div>
    </ReadContext.Provider>
  );
}

function Outline({
  headings,
  open,
  onOpenChange,
  onSelect,
}: {
  headings: Heading[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
}) {
  const { active, progress } = useContext(ReadContext);
  const current = headings.find((heading) => heading.id === active);
  const percent = `${Math.round(progress * 100)}%`;

  return (
    <aside className="sticky top-20 z-20 order-2 mt-8 lg:top-24 lg:z-auto lg:mt-0">
      <div className="hud-panel hud-frame">
        <div className="bg-mocha-crust lg:bg-transparent">
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => onOpenChange(!open)}
              aria-expanded={open}
              aria-controls="post-outline"
              className="hud-bar w-full cursor-pointer text-left text-mocha-overlay1 transition-colors hover:text-mocha-text"
            >
              <span className="hud-lamp text-mocha-teal" />
              <span className="text-mocha-teal normal-case tracking-normal">
                outline
              </span>
              {current ? (
                <>
                  <span className="text-mocha-overlay0">/</span>
                  <span className="min-w-0 flex-1 truncate normal-case tracking-normal text-mocha-subtext">
                    {current.text}
                  </span>
                </>
              ) : null}
              <span className="ml-auto tabular-nums">{percent}</span>
              <span aria-hidden className="text-mocha-teal">
                {open ? "▴" : "▾"}
              </span>
            </button>
          </div>

          <div className="hidden lg:block">
            <div className="hud-bar text-mocha-overlay1">
              <span className="hud-lamp text-mocha-teal" />
              <span className="text-mocha-teal normal-case tracking-normal">
                outline
              </span>
              <span className="ml-auto">{percent}</span>
            </div>
          </div>

          <div id="post-outline" className={open ? "block" : "hidden lg:block"}>
            <div className="p-4">
              <ReadMeter />
              <span className="mt-3 block font-mono text-[10px] tracking-[0.24em] text-mocha-overlay1 uppercase">
                {headings.length > 0
                  ? `${headings.length} sections`
                  : "single pass"}
              </span>
            </div>

            <nav className="max-h-[55vh] overflow-y-auto overscroll-contain border-t border-mocha-surface lg:max-h-none lg:overflow-visible">
              {headings.map((heading) => {
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
                    className={`hud-row flex items-center gap-3 pr-4 font-mono text-[11px] transition-colors ${
                      heading.level > 2 ? "pl-8" : "pl-4"
                    } ${isCurrent ? "text-mocha-teal" : "text-mocha-subtext hover:text-mocha-text"}`}
                  >
                    <span
                      className={`hud-lamp ${isCurrent ? "text-mocha-teal" : "hud-lamp-idle text-mocha-overlay1"}`}
                    />
                    <span className="min-w-0 flex-1 truncate py-3">
                      {heading.text}
                    </span>
                    {isCurrent ? (
                      <span className="text-mocha-teal">▸</span>
                    ) : null}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ReadMeter() {
  return (
    <span className="hud-meter read-meter block w-full text-mocha-teal">
      <span />
    </span>
  );
}

export function ReadStatus() {
  const { progress, complete } = useContext(ReadContext);
  return (
    <span className="ml-auto flex items-center gap-2">
      <span
        className={`hud-lamp ${complete ? "text-mocha-teal" : "hud-lamp-idle text-mocha-overlay1"}`}
      />
      <span>
        {complete ? "decoded" : `${Math.round(progress * 100)}% read`}
      </span>
    </span>
  );
}

export function ReadOutro() {
  const { progress, complete } = useContext(ReadContext);
  return (
    <>
      <span
        className={`hud-lamp ${complete ? "text-mocha-teal" : "hud-lamp-idle text-mocha-overlay1"}`}
      />
      <span>
        {complete ? "transmission complete" : "transmission in progress"}
      </span>
      <span className="text-mocha-overlay1 normal-case tracking-normal">
        {Math.round(progress * 100)}%
      </span>
    </>
  );
}
