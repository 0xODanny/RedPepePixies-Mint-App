/**
 * Live draw, documented here and kept off in the preview.
 *
 * 1. A wallet enters a week only by minting at least one Pixie during that week and
 *    still holding one of those minted token IDs at Sunday noon America/Los_Angeles.
 *    The token has to stay in the minting wallet. Last week's Pixie does not carry over.
 * 2. Weekly power is the number of chances. Finishing a game adds chances. A top-20
 *    finish adds more. Freeze qualifying entries before the cutoff. One wallet, once.
 * 3. Draw without replacement, weighted by chances, from a published seed. Store the
 *    seed, the chance list, and the places.
 * 4. A claim key is week plus place. The same wallet repeating a claim gets the original
 *    award. A second wallet cannot take an awarded place. Fulfillment stores the issue
 *    date, the six-month eSIM deadline, and the zone cost, and it stays off until the
 *    provider confirms that window.
 */

import { inWindow } from "./schedule.mjs";
import { normalizeWallet } from "./runs.mjs";

export const DRAW_PLAN = {
  entry: "Mint at least one Pixie during the draw week and keep that token in the minting wallet until Sunday noon Pacific. A new mint is required every week.",
  separateFromBoard: false,
  chances: "Weekly power is the number of chances. Games, top-20 finishes, mint size, and holdings change that power.",
  freeze: "Qualifying wallets only, frozen at Sunday noon America/Los_Angeles.",
  selection: "Weighted by weekly power. A drawn wallet is removed so it takes one place.",
  claims: "One award per week and place. A repeat claim returns the original award.",
  rulesStatus: "Official rules, eligibility regions, and the launch date are pending review.",
  testDataOnly: true,
};

export function qualifiesForWeeklyDraw({ wallet, mintEvents = [], heldTokenIds = [], window }) {
  const buyer = normalizeWallet(wallet);
  const held = new Set(heldTokenIds.map((id) => String(id)));
  return mintEvents.some((event) => {
    if (!event || event.kind !== "mint" || event.confirmed !== true) return false;
    if (normalizeWallet(event.buyer || event.wallet) !== buyer) return false;
    if (!event.mintedAt || !inWindow(event.mintedAt, window.opensAt, window.cutoff)) return false;
    const minted = event.tokenIds || [];
    return minted.some((id) => held.has(String(id)));
  });
}

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
  const remaining = frozen
    .map((entry) => ({ ...entry, chances: Number(entry.chances ?? 1) }))
    .filter((entry) => entry.chances > 0);
  const random = mulberry32(hashSeed(seed));
  const winners = [];
  while (winners.length < count && remaining.length > 0) {
    const total = remaining.reduce((sum, entry) => sum + entry.chances, 0);
    let ticket = random() * total;
    let index = remaining.length - 1;
    for (let cursor = 0; cursor < remaining.length; cursor += 1) {
      ticket -= remaining[cursor].chances;
      if (ticket < 0) {
        index = cursor;
        break;
      }
    }
    const [picked] = remaining.splice(index, 1);
    winners.push({
      place: winners.length + 1,
      wallet: picked.wallet,
      chances: picked.chances,
      seed: String(seed),
    });
  }
  return winners;
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
