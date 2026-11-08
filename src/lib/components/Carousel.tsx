"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { Project } from "@/lib/projects";

const CARD_HEIGHT = 256;
const CARD_GAP = 24;
const STEP = CARD_HEIGHT + CARD_GAP;

const COPIES = 3;
const BASE_COPY = 1;

const AUTO_SPEED = 0.014;
const IDLE_DELAY = 1600;
const EASING = 0.02;
const FRICTION = 0.005;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

type DragState = {
  active: boolean;
  captured: boolean;
  moved: boolean;
  pointerId: number;
  startOffset: number;
  startY: number;
  lastY: number;
  lastTime: number;
};

function wrap(value: number, size: number) {
  return ((value % size) + size) % size;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export default function Carousel({ projects }: { projects: Project[] }) {
  const setHeight = Math.max(projects.length * STEP, 1);
  const baseOffset = setHeight * BASE_COPY;

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  const offsetRef = useRef(baseOffset);
  const targetRef = useRef(baseOffset);
  const velocityRef = useRef(0);

  const suppressClickRef = useRef(false);
  const hoveringRef = useRef(false);
  const focusedRef = useRef(false);
  const lastInteractionRef = useRef(0);

  const dragRef = useRef<DragState>({
    active: false,
    captured: false,
    moved: false,
    pointerId: -1,
    startOffset: baseOffset,
    startY: 0,
    lastY: 0,
    lastTime: 0,
  });

  const [dragging, setDragging] = useState(false);

  const paint = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const wrapped =
      baseOffset + wrap(offsetRef.current - baseOffset, setHeight);
    const range = Math.max(container.clientHeight * 0.62, 1);

    track.style.transform = `translate3d(0, ${-wrapped}px, 0)`;

    itemRefs.current.forEach((item) => {
      if (!item) return;

      const itemCenter = item.offsetTop + item.offsetHeight / 2;
      const distance = Math.min(Math.abs(itemCenter - CARD_HEIGHT / 2 - wrapped) / range, 1);

      item.style.setProperty(
        "--project-scale",
        (1 - distance * 0.34).toFixed(3),
      );
      item.style.setProperty(
        "--project-opacity",
        (1 - distance * 0.58).toFixed(3),
      );
    });
  }, [baseOffset, setHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    offsetRef.current = baseOffset;
    targetRef.current = baseOffset;
    velocityRef.current = 0;
    lastInteractionRef.current = performance.now();
    paint();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    let lastTime = performance.now();

    const tick = (time: number) => {
      const dt = Math.min(Math.max(time - lastTime, 0), 50);
      lastTime = time;

      const idle =
        !reduceMotion &&
        !dragRef.current.active &&
        !hoveringRef.current &&
        !focusedRef.current &&
        time - lastInteractionRef.current >= IDLE_DELAY;

      if (idle) {
        targetRef.current -= AUTO_SPEED * dt;
      }

      const velocity = velocityRef.current;
      if (Math.abs(velocity) > 0.002) {
        targetRef.current += velocity * dt;
        velocityRef.current = velocity * Math.exp(-FRICTION * dt);
      } else {
        velocityRef.current = 0;
      }

      const difference = targetRef.current - offsetRef.current;
      if (Math.abs(difference) > 0.01) {
        offsetRef.current += difference * (1 - Math.exp(-EASING * dt));
        paint();
      } else if (difference !== 0) {
        offsetRef.current = targetRef.current;
        paint();
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();

      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? container.clientHeight
            : 1;

      targetRef.current += event.deltaY * multiplier;
      velocityRef.current = 0;
      lastInteractionRef.current = performance.now();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    const observer = new ResizeObserver(() => paint());
    observer.observe(container);
    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      container.removeEventListener("wheel", handleWheel);
      observer.disconnect();
    };
  }, [baseOffset, paint]);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!event.isPrimary || event.button !== 0) return;

    const current = offsetRef.current;

    dragRef.current = {
      active: true,
      captured: false,
      moved: false,
      pointerId: event.pointerId,
      startOffset: current,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: event.timeStamp,
    };

    targetRef.current = current;
    velocityRef.current = 0;
    lastInteractionRef.current = performance.now();
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const delta = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(delta) < 4) return;

    if (!drag.moved) {
      drag.moved = true;
      drag.captured = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }

    const now = performance.now();
    const dt = Math.max(now - drag.lastTime, 1);
    const dy = event.clientY - drag.lastY;

    velocityRef.current = -dy / dt;
    drag.lastY = event.clientY;
    drag.lastTime = now;

    const next = drag.startOffset - delta;
    offsetRef.current = next;
    targetRef.current = next;
    lastInteractionRef.current = now;

    paint();
  };

  const endDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    drag.active = false;

    if (
      drag.captured &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    drag.captured = false;
    setDragging(false);

    if (
      cancelled ||
      !drag.moved ||
      performance.now() - drag.lastTime > 80
    ) {
      velocityRef.current = 0;
    }

    lastInteractionRef.current = performance.now();

    if (drag.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const handlePointerEnter = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType !== "touch") hoveringRef.current = true;
  };

  const handlePointerLeave = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType !== "touch") hoveringRef.current = false;
    if (!dragRef.current.captured) endDrag(event);
  };

  const handleClickCapture = (
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const handleFocus = () => {
    focusedRef.current = true;
  };

  const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      focusedRef.current = false;
      lastInteractionRef.current = performance.now();
    }
  };

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === "ArrowDown") {
      targetRef.current += STEP;
    } else if (event.key === "ArrowUp") {
      targetRef.current -= STEP;
    } else {
      return;
    }

    event.preventDefault();
    velocityRef.current = 0;
    lastInteractionRef.current = performance.now();
  };

  if (projects.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-subtle">
        No public projects right now.
      </div>
    );
  }

  const loopedProjects = Array.from({ length: COPIES }).flatMap(
    (_, copyIndex) =>
      projects.map((project, projectIndex) => ({
        project,
        copyIndex,
        projectIndex,
      })),
  );

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Projects. Drag, scroll, or use the arrow keys to browse."
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={(event) => endDrag(event, true)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
      onClickCapture={handleClickCapture}
      onDragStart={(event) => event.preventDefault()}
      onKeyDown={handleKeyDown}
      className={`relative h-full touch-none select-none overflow-hidden focus-visible:outline-2 focus-visible:outline-rose ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <ul
        ref={trackRef}
        style={{ transform: `translate3d(0, ${-baseOffset}px, 0)` }}
        className="absolute inset-x-0 top-1/2 -mt-32 flex list-none flex-col gap-6 px-4 will-change-transform sm:px-6"
      >
        {loopedProjects.map(
          ({ project, copyIndex, projectIndex }) => {
            const itemIndex =
              copyIndex * projects.length + projectIndex;

            return (
              <li
                key={`${copyIndex}-${project.id}`}
                ref={(node) => {
                  itemRefs.current[itemIndex] = node;
                }}
                className="h-64 shrink-0"
                style={{
                  transform: "scale(var(--project-scale, 1))",
                  opacity: "var(--project-opacity, 1)",
                }}
              >
                <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-rose/25 bg-background/40 p-5 text-left shadow-header transition-colors hover:border-rose hover:bg-background/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-rose">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-subtle">
                      <span className="truncate text-rose">
                        {project.language ?? "Project"}
                      </span>
                      <span className="shrink-0">
                        {formatDate(project.pushedAt)}
                      </span>
                    </div>

                    <h3 className="mt-3 truncate text-2xl font-bold">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        draggable={false}
                        className="block cursor-grab truncate after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none active:cursor-grabbing"
                      >
                        {project.name}
                      </a>
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-subtle">
                      {project.description ?? "No Description"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-rose/15 pt-3 text-xs">
                    <span className="text-gold">
                      {project.stars > 0
                        ? `${project.stars}`
                        : "Github"}
                    </span>
                    <span className="text-subtle transition-colors group-hover:text-rose">
                      Open Repo
                    </span>
                  </div>
                </article>
              </li>
            );
          },
        )}
      </ul>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-b from-overlay to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-overlay to-transparent" />
    </div>
  );
}