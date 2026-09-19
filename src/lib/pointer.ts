type PointerListener = (x: number, y: number) => void;

const listeners = new Set<PointerListener>();
let started = false;

function onPointerMove(event: PointerEvent) {
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;
  for (const listener of listeners) listener(x, y);
}

function ensureListener() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
}

export function subscribePointer(listener: PointerListener) {
  ensureListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
