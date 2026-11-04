import { inWindow } from "./schedule.mjs";
import { rankBonusPercent } from "./scoring.mjs";

export const BOARD_GAMES = [
  {
    id: "snake",
    label: "Snake",
    href: "https://www.pepinho.games/snake",
    enabled: true,
    linkage: "verified",
    note: "Ranked Snake does not require GamePass. The first 10 runs each day are free. The board can use one accepted Pepinho run per wallet each week.",
  },
  {
    id: "red-pepe-rocket",
    label: "Red Pepe Rocket",
    href: "https://www.pepinho.games/red-pepe-rocket",
    enabled: true,
    linkage: "verified",
    note: "Uses the shared wallet-bound arcade run and reward checks.",
  },
  {
    id: "frogger",
    label: "Frogger",
    href: "https://www.pepinho.games/frogger",
    enabled: true,
    linkage: "verified",
    note: "Legacy Frogger routes use the same wallet check and reward validation.",
  },
  {
    id: "flappy",
    label: "Flappy",
    href: "https://www.pepinho.games/flappy",
    enabled: false,
    linkage: "verified",
    note: "Also free of a GamePass lock. Held back so the first enabled game is Snake.",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://www.pepinho.games",
    enabled: false,
    linkage: "unverified",
    note: "Needs a signature from the same wallet. This flow never asks for a seed phrase or private key.",
  },
];

export function enabledGames() {
  return BOARD_GAMES.filter((game) => game.enabled);
}

export function normalizeWallet(wallet) {
  return String(wallet || "").trim().toLowerCase();
}

export function acceptRun(run, wallet, gameId, window) {
  if (!run || run.accepted !== true) return { ok: false, reason: "not_accepted" };
  if (run.clientSubmittedFromMint === true) return { ok: false, reason: "client_score_rejected" };
  if (normalizeWallet(run.wallet) !== normalizeWallet(wallet)) return { ok: false, reason: "wrong_wallet" };
  if (run.game !== gameId) return { ok: false, reason: "wrong_game" };
  if (!inWindow(run.playedAt, window.opensAt, window.cutoff)) return { ok: false, reason: "outside_week" };
  return { ok: true };
}

export function bestRunsForWeek(runs, gameId, window) {
  const byWallet = new Map();
  const seen = new Set();
  for (const run of runs) {
    const id = String(run.runId || "");
    if (!id || seen.has(id)) continue;
    const wallet = normalizeWallet(run.wallet);
    const verdict = acceptRun(run, wallet, gameId, window);
    if (!verdict.ok) continue;
    seen.add(id);
    const current = byWallet.get(wallet);
    const candidate = { ...run, wallet, score: Number(run.score) };
    if (!current || betterRun(candidate, current)) byWallet.set(wallet, candidate);
  }
  return [...byWallet.values()].sort(compareRuns);
}

function betterRun(candidate, current) {
  if (candidate.score !== current.score) return candidate.score > current.score;
  const candidateTime = new Date(candidate.acceptedAt).getTime();
  const currentTime = new Date(current.acceptedAt).getTime();
  if (candidateTime !== currentTime) return candidateTime < currentTime;
  return candidate.wallet < current.wallet;
}

function compareRuns(left, right) {
  return betterRun(left, right) ? -1 : 1;
}

export function gameRankBonuses(runs, wallet, window, games = enabledGames()) {
  const bonuses = [];
  for (const game of games) {
    const ranked = bestRunsForWeek(runs, game.id, window);
    const index = ranked.findIndex((run) => run.wallet === normalizeWallet(wallet));
    const rank = index === -1 ? null : index + 1;
    bonuses.push({
      game: game.id,
      rank,
      percent: rank == null ? 0 : rankBonusPercent(rank),
    });
  }
  return bonuses;
}
