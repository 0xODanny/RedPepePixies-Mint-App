import { RPEPE_DECIMALS } from "./contracts.mjs";
import { qualifiesForWeeklyDraw } from "./draw.mjs";
import { campaignDraws } from "./schedule.mjs";
import {
  allTimePower,
  assignBoardRanks,
  basePoints,
  formatTokenAmount,
  pixiesHoldingPercent,
  gameBonusPercent,
  rpepeHoldingPercent,
  weeklyPower,
} from "./scoring.mjs";

const UNIT = 10n ** BigInt(RPEPE_DECIMALS);

function row(input, window) {
  const mintEvents = input.mintEvents.map((event) => ({
    ...event,
    buyer: input.wallet,
    mintedAt: input.mintedAt,
    tokenIds: input.tokenIds,
  }));
  const eligible = qualifiesForWeeklyDraw({
    wallet: input.wallet,
    mintEvents,
    heldTokenIds: input.heldTokenIds,
    window,
  });
  const bonuses = [
    gameBonusPercent(input.snakeRank),
    gameBonusPercent(input.rocketRank),
    gameBonusPercent(input.froggerRank),
    pixiesHoldingPercent(input.pixies),
    rpepeHoldingPercent(input.rpepeRaw),
  ];
  const base = eligible ? basePoints({ participated: true, mintEvents }) : 0;
  const current = eligible ? weeklyPower(base, bonuses) : 0;
  return {
    sample: true,
    eligible,
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
    entryStatus: eligible ? "Eligible" : "Not eligible",
    snakeRank: input.snakeRank,
    rocketRank: input.rocketRank,
    froggerRank: input.froggerRank,
  };
}

export function sampleStandings() {
  const draws = campaignDraws();
  const window = draws[0];
  const mintedAt = "2026-11-04T18:00:00.000Z";
  const rows = assignBoardRanks([
    row({
      wallet: "0x00000000000000000000000000000000000000a1",
      mintedAt,
      tokenIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      heldTokenIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      mintEvents: [{ id: "sample-mint-a", kind: "mint", confirmed: true, quantity: 10 }],
      snakeRank: 1,
      rocketRank: 20,
      froggerRank: 5,
      pixies: 61,
      rpepeRaw: 1_500_000n * UNIT + 1n,
      finalized: [180],
      lastWeekRank: 2,
      gamepass: "GamePass+",
    }, window),
    row({
      wallet: "0x00000000000000000000000000000000000000b2",
      mintedAt,
      tokenIds: ["11", "12", "13"],
      heldTokenIds: ["11", "12", "13"],
      mintEvents: [{ id: "sample-mint-b", kind: "mint", confirmed: true, quantity: 3 }],
      snakeRank: 19,
      rocketRank: 2,
      froggerRank: 20,
      pixies: 6,
      rpepeRaw: 250_000n * UNIT,
      finalized: [90, 40],
      lastWeekRank: 1,
      gamepass: "None",
    }, window),
    row({
      wallet: "0x00000000000000000000000000000000000000c3",
      mintedAt,
      tokenIds: ["14", "15"],
      heldTokenIds: [],
      mintEvents: [{ id: "sample-mint-c", kind: "mint", confirmed: true, quantity: 2 }],
      snakeRank: 21,
      rocketRank: null,
      froggerRank: 1,
      pixies: 0,
      rpepeRaw: 0n,
      finalized: [],
      lastWeekRank: null,
      gamepass: "GamePass",
    }, window),
  ]);
  return {
    source: "sample",
    verified: false,
    week: draws[0],
    rows,
    note: "Sample data. These rows are not verified runs, entries, holdings, or winners.",
  };
}
