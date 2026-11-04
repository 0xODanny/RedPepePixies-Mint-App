/**
 * Live draw, documented here and kept off in the preview.
 *
 * 1. Record one free entry per verified wallet per week. Odds are equal.
 *    Power Board rank, scores, NFT buys, holdings, and GamePass do not add entries.
 * 2. At Sunday noon America/Los_Angeles, freeze entries with enteredAt before the cutoff.
 *    Duplicate wallets collapse to one. Later entries wait for the next week.
 * 3. Shuffle the frozen wallet list with a published seed (week id plus a chain block hash).
 *    Take winners from the front of that shuffle and store the seed, list hash, and places.
 * 4. A claim key is week plus place. The same wallet repeating a claim gets the original
 *    award. A second wallet cannot take an awarded place. Fulfillment stores the issue
 *    date, the six-month eSIM deadline, and the zone cost, and it stays off until the
 *    provider confirms that window.
 */

import { normalizeWallet } from "./runs.mjs";

export const DRAW_PLAN = {
  entry: "One free signed-wallet entry per week. Equal odds among the frozen list.",
  separateFromBoard: true,
  freeze: "Eligible entries with enteredAt before Sunday noon America/Los_Angeles.",
  selection: "Seeded shuffle of the frozen wallets. The seed and list hash are stored with the result.",
  claims: "One award per week and place. A repeat claim returns the original award.",
  rulesStatus: "Official rules, eligibility regions, and the launch date are pending review.",
  testDataOnly: true,
};

function hashSeed(seed) {
  let hash = 2166136261;
  const text = String(seed);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(values, seed) {
  const copy = [...values];
  const random = mulberry32(hashSeed(seed));
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

export function freezeEntries(entries, cutoffIso) {
  const cutoff = new Date(cutoffIso).getTime();
  const seen = new Set();
  const frozen = [];
  for (const entry of entries) {
    if (entry.eligible !== true) continue;
    if (new Date(entry.enteredAt).getTime() >= cutoff) continue;
    const wallet = normalizeWallet(entry.wallet);
    const key = `${entry.weekId}:${wallet}`;
    if (seen.has(key)) continue;
    seen.add(key);
    frozen.push({ ...entry, wallet });
  }
  frozen.sort((left, right) => left.wallet.localeCompare(right.wallet));
  return frozen;
}

export function selectWinners(frozen, { seed, count }) {
  const order = seededShuffle(
    frozen.map((entry) => entry.wallet),
    seed
  );
  return order.slice(0, count).map((wallet, index) => ({
    place: index + 1,
    wallet,
    seed: String(seed),
  }));
}

export function claimPrize(ledger, { weekId, place, wallet }) {
  const key = `${weekId}:${place}`;
  const claimant = normalizeWallet(wallet);
  const existing = ledger.get(key);
  if (existing) {
    if (existing.wallet === claimant) return { ok: true, duplicate: true, award: existing };
    return { ok: false, duplicate: false, error: "already_awarded" };
  }
  const award = { weekId, place, wallet: claimant, id: key };
  ledger.set(key, award);
  return { ok: true, duplicate: false, award };
}
