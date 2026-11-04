import { RPEPE_DECIMALS } from "./contracts.mjs";
import { campaignDraws } from "./schedule.mjs";
import {
  allTimePower,
  assignBoardRanks,
  basePoints,
  formatTokenAmount,
  pixiesHoldingPercent,
  rankBonusPercent,
  rpepeHoldingPercent,
  weeklyPower,
} from "./scoring.mjs";

const UNIT = 10n ** BigInt(RPEPE_DECIMALS);

function row(input) {
  const bonuses = [
    rankBonusPercent(input.snakeRank),
    rankBonusPercent(input.rocketRank),
    rankBonusPercent(input.froggerRank),
    pixiesHoldingPercent(input.pixies),
    rpepeHoldingPercent(input.rpepeRaw),
  ];
  const base = basePoints({ participated: true, mintEvents: input.mintEvents });
  const current = weeklyPower(base, bonuses);
  return {
    sample: true,
    wallet: input.wallet,
    label: "Sample",
    basePoints: base,
    weeklyPower: current,
    allTimePower: allTimePower(input.finalized || []),
    lastWeekRank: input.lastWeekRank,
    pixiesHeld: input.pixies,
    rpepeRaw: input.rpepeRaw.toString(),
    rpepeHeld: formatTokenAmount(input.rpepeRaw),
    gamepass: input.gamepass,
    entryStatus: input.entryStatus,
    snakeRank: input.snakeRank,
    rocketRank: input.rocketRank,
    froggerRank: input.froggerRank,
  };
}

export function sampleStandings() {
  const draws = campaignDraws();
  const rows = assignBoardRanks([
    row({
      wallet: "0x00000000000000000000000000000000000000a1",
      mintEvents: [{ id: "sample-mint-a", kind: "mint", confirmed: true, quantity: 10 }],
      snakeRank: 1,
      rocketRank: 20,
      froggerRank: 5,
      pixies: 61,
      rpepeRaw: 1_500_000n * UNIT + 1n,
      finalized: [180],
      lastWeekRank: 2,
      gamepass: "GamePass+",
      entryStatus: "Sample entry",
    }),
    row({
      wallet: "0x00000000000000000000000000000000000000b2",
      mintEvents: [{ id: "sample-mint-b", kind: "mint", confirmed: true, quantity: 3 }],
      snakeRank: 19,
      rocketRank: 2,
      froggerRank: 20,
      pixies: 6,
      rpepeRaw: 250_000n * UNIT,
      finalized: [90, 40],
      lastWeekRank: 1,
      gamepass: "None",
      entryStatus: "Not entered",
    }),
    row({
      wallet: "0x00000000000000000000000000000000000000c3",
      mintEvents: [{ id: "sample-mint-c", kind: "mint", confirmed: true, quantity: 2 }],
      snakeRank: 21,
      rocketRank: null,
      froggerRank: 1,
      pixies: 0,
      rpepeRaw: 0n,
      finalized: [],
      lastWeekRank: null,
      gamepass: "GamePass",
      entryStatus: "Sample entry",
    }),
  ]);
  return {
    source: "sample",
    verified: false,
    week: draws[0],
    rows,
    note: "Sample data. These rows are not verified runs, entries, holdings, or winners.",
  };
}
