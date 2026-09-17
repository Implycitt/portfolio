export const STATS_TTL_MS = 5 * 60 * 1000;

const FAILURE_TTL_MS = 30 * 1000;

const MAX_ENTRIES = 64;

interface Entry {
  value: unknown;
  expires: number;
}

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  load: () => Promise<T>,
  ttlMs: number = STATS_TTL_MS,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;
  if (hit) store.delete(key);

  const running = inflight.get(key);
  if (running) return running as Promise<T>;

  const pending = load()
    .then((value) => {
      const failed = value === null || value === undefined;
      if (store.size >= MAX_ENTRIES) {
        const oldest = store.keys().next();
        if (!oldest.done) store.delete(oldest.value);
      }
      store.set(key, {
        value,
        expires: Date.now() + (failed ? FAILURE_TTL_MS : ttlMs),
      });
      return value;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, pending);
  return pending;
}
