export const DRAW_TIME_ZONE = "America/Los_Angeles";
export const DRAW_HOUR = 12;
export const DRAW_MINUTE = 0;

/** Proposed first draw. Not a confirmed launch date. */
export const PROPOSED_SEASON_START = "2026-11-08";

export function zonedTimeToUtc(dateYmd, hour, minute, timeZone) {
  const [year, month, day] = dateYmd.split("-").map(Number);
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(utc)).map((part) => [part.type, part.value])
    );
    const shown = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
    const delta = desired - shown;
    if (delta === 0) break;
    utc += delta;
  }
  return new Date(utc);
}

export function addCalendarDays(dateYmd, days) {
  const [year, month, day] = dateYmd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

export function campaignDraws({
  seasonStartDate = PROPOSED_SEASON_START,
  weeks = 4,
  confirmed = false,
} = {}) {
  return Array.from({ length: weeks }, (_, index) => {
    const drawDate = addCalendarDays(seasonStartDate, index * 7);
    const cutoff = zonedTimeToUtc(drawDate, DRAW_HOUR, DRAW_MINUTE, DRAW_TIME_ZONE);
    const opensAt = zonedTimeToUtc(addCalendarDays(drawDate, -7), DRAW_HOUR, DRAW_MINUTE, DRAW_TIME_ZONE);
    return {
      week: index + 1,
      opensAt: opensAt.toISOString(),
      cutoff: cutoff.toISOString(),
      confirmed,
      timeZone: DRAW_TIME_ZONE,
    };
  });
}

export function formatDraw(iso, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

export function previewCountdown(cutoffIso, now = new Date()) {
  const target = new Date(cutoffIso).getTime();
  const delta = target - now.getTime();
  const sign = delta >= 0 ? 1 : -1;
  const abs = Math.abs(delta);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  return {
    live: false,
    label: sign > 0 ? `${days}d ${hours}h ${minutes}m` : `${days}d ${hours}h ${minutes}m ago`,
    note: "Preview countdown. The launch date is not confirmed.",
  };
}

export function inWindow(timestamp, opensAt, cutoff) {
  const time = new Date(timestamp).getTime();
  return time >= new Date(opensAt).getTime() && time < new Date(cutoff).getTime();
}
