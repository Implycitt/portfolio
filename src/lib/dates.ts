/**
 * GitHub timestamps are UTC and these dates render in server components, so
 * formatting is pinned to UTC with a fixed locale — otherwise the output shifts
 * with the host's timezone and can disagree with the client on hydration.
 */
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--";
  return DATE_FORMAT.format(date);
}
