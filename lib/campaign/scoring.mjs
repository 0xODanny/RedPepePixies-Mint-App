import { RPEPE_DECIMALS } from "./contracts.mjs";

const BUNDLE_POINTS = { 1: 1, 3: 5, 5: 10, 10: 25 };

export function mintPointsForQuantity(quantity) {
  const count = Number(quantity);
  if (!Number.isInteger(count) || count <= 0) return 0;
  if (Object.prototype.hasOwnProperty.call(BUNDLE_POINTS, count)) return BUNDLE_POINTS[count];
  return count;
}

export function basePoints({ participated, mintEvents = [] }) {
  const participation = participated ? 100 : 0;
  const seen = new Set();
  let mintPoints = 0;
  for (const event of mintEvents) {
    if (!event || event.kind !== "mint" || event.confirmed !== true) continue;
    const id = String(event.id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    mintPoints += mintPointsForQuantity(event.quantity);
  }
  return participation + mintPoints;
}

/** Rank 1 is +29%. Rank 20 is +10%. Outside the top 20 is 0%. */
export function rankBonusPercent(rank) {
  const place = Number(rank);
  if (!Number.isInteger(place) || place < 1 || place > 20) return 0;
  return 30 - place;
}

export function pixiesHoldingPercent(count) {
  const held = Number(count);
  if (!Number.isFinite(held) || held <= 0) return 0;
  if (held <= 5) return 1;
  if (held <= 10) return 3;
  if (held <= 20) return 5;
  if (held <= 60) return 12;
  return 30;
}

export function formatTokenAmount(rawAmount, decimals = RPEPE_DECIMALS) {
  const amount = BigInt(rawAmount);
  const unit = 10n ** BigInt(decimals);
  const whole = amount / unit;
  const fraction = amount % unit;
  if (fraction === 0n) return whole.toString();
  const digits = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole.toString()}.${digits}`;
}

export function rpepeHoldingPercent(rawAmount, decimals = RPEPE_DECIMALS) {
  const amount = BigInt(rawAmount);
  const unit = 10n ** BigInt(decimals);
  const whole = (tokens) => BigInt(tokens) * unit;
  if (amount <= 0n) return 0;
  if (amount <= whole(250000)) return 1;
  if (amount <= whole(500000)) return 3;
  if (amount <= whole(1000000)) return 5;
  if (amount <= whole(1500000)) return 7;
  return 10;
}

export function weeklyPower(base, bonusPercents) {
  const percent = bonusPercents.reduce((sum, value) => sum + Number(value || 0), 0);
  return (Number(base) * (100 + percent)) / 100;
}

export function compareStandings(left, right) {
  if (right.weeklyPower !== left.weeklyPower) return right.weeklyPower - left.weeklyPower;
  if (right.basePoints !== left.basePoints) return right.basePoints - left.basePoints;
  return left.wallet.localeCompare(right.wallet);
}

export function assignBoardRanks(rows) {
  return [...rows].sort(compareStandings).map((row, index) => ({ ...row, rank: index + 1 }));
}

export function allTimePower(finalizedWeekPowers) {
  return finalizedWeekPowers.reduce((sum, value) => sum + Number(value || 0), 0);
}
