import assert from "node:assert/strict";
import test from "node:test";
import { ethers } from "ethers";
import { contractStatus, EXPECTED_PIXIES_CONTRACT } from "../lib/campaign/contracts.mjs";
import { actionAllowed, readFlags } from "../lib/campaign/flags.mjs";
import {
  budgetImpact,
  buildEsimAward,
  ESIM_REDEMPTION_COPY,
  redemptionDeadline,
  finaleTravelPrizes,
  seasonCommitment,
  weeklyPrizeRows,
} from "../lib/campaign/lineup.mjs";
import { campaignDraws, formatDraw, inWindow, zonedTimeToUtc } from "../lib/campaign/schedule.mjs";
import {
  allTimePower,
  assignBoardRanks,
  basePoints,
  compareStandings,
  mintPointsForQuantity,
  pixiesHoldingPercent,
  gameBonusPercent,
  powerTable,
  rankBonusPercent,
  rpepeHoldingPercent,
  weeklyPower,
} from "../lib/campaign/scoring.mjs";
import { acceptRun, bestRunsForWeek, gameRankBonuses } from "../lib/campaign/runs.mjs";
import { claimPrize, freezeEntries, qualifiesForWeeklyDraw, selectWinners } from "../lib/campaign/draw.mjs";
import { buildChallengeMessage, verifyChallenge } from "../lib/campaign/wallet.mjs";
import { sampleStandings } from "../lib/campaign/sampleBoard.mjs";

const UNIT = 10n ** 18n;

test("season commitment is 24 AVAX, eight GamePasses, four GamePass+, and 24 VPN months", () => {
  const commitment = seasonCommitment();
  assert.equal(commitment.avax, 24);
  assert.equal(commitment.gamepassCount, 8);
  assert.equal(commitment.gamepassPlusCount, 4);
  assert.equal(commitment.weeklyEsimCount, 12);
  assert.equal(commitment.finaleEsimCount, 1);
  assert.equal(commitment.vpnMonths, 24);
  assert.equal(commitment.avaxUsd, 200.64);
  assert.equal(commitment.vpnUsd, 48);
  assert.equal(commitment.cashUsd, 248.64);
  assert.equal(commitment.esimCostUsd, null);
  assert.equal(commitment.gamepassRetailUsd, 172);
  assert.equal(commitment.gamepassRetailExcluded, true);
  assert.equal(weeklyPrizeRows().reduce((sum, row) => sum + row.count, 0), 12);
  assert.equal(finaleTravelPrizes().reduce((sum, row) => sum + row.count, 0), 2);
});

test("an eSIM quote changes the cash budget and an empty quote stays unresolved", () => {
  const missing = budgetImpact(null);
  assert.equal(missing.quoted, false);
  assert.equal(missing.cashUsd, 248.64);
  assert.equal(missing.gamepassRetailUsd, 172);
  const quoted = budgetImpact(40);
  assert.equal(quoted.quoted, true);
  assert.equal(quoted.cashUsd, 288.64);
  assert.equal(quoted.gamepassRetailUsd, 172);
});

test("eSIM deadline is six calendar months and month ends clamp", () => {
  assert.equal(redemptionDeadline("2026-11-08"), "2027-05-08");
  assert.equal(redemptionDeadline("2026-01-31"), "2026-07-31");
  assert.equal(redemptionDeadline("2026-08-31"), "2027-02-28");
  assert.equal(redemptionDeadline("2023-08-31"), "2024-02-29");
  const award = buildEsimAward({ issueDate: "2026-11-08", tierGb: 20, zoneCostUsd: 17.5 });
  assert.equal(award.redeemBy, "2027-05-08");
  assert.equal(award.zoneCostUsd, 17.5);
  assert.equal(award.copy, ESIM_REDEMPTION_COPY);
  assert.equal(award.providerWindowConfirmed, false);
});

test("Sunday noon Pacific converts for standard time and daylight time", () => {
  const winter = zonedTimeToUtc("2026-11-08", 12, 0, "America/Los_Angeles");
  assert.equal(winter.toISOString(), "2026-11-08T20:00:00.000Z");
  const summer = zonedTimeToUtc("2026-07-12", 12, 0, "America/Los_Angeles");
  assert.equal(summer.toISOString(), "2026-07-12T19:00:00.000Z");
  const draws = campaignDraws();
  assert.equal(draws.length, 4);
  assert.equal(draws[0].confirmed, false);
  assert.equal(draws[1].cutoff, "2026-11-15T20:00:00.000Z");
  const acrossDst = campaignDraws({ seasonStartDate: "2026-03-08", weeks: 1 });
  assert.equal(acrossDst[0].opensAt, "2026-03-01T20:00:00.000Z");
  assert.equal(acrossDst[0].cutoff, "2026-03-08T19:00:00.000Z");
  assert.match(formatDraw(draws[0].cutoff, "America/Los_Angeles"), /Nov 8, 2026, 12:00 PM/);
});

test("bundle mint points and other quantities", () => {
  assert.equal(mintPointsForQuantity(1), 1);
  assert.equal(mintPointsForQuantity(3), 5);
  assert.equal(mintPointsForQuantity(5), 10);
  assert.equal(mintPointsForQuantity(10), 25);
  assert.equal(mintPointsForQuantity(2), 2);
  assert.equal(mintPointsForQuantity(4), 4);
  assert.equal(mintPointsForQuantity(9), 9);
});

test("confirmed mint events count once and transfers do not", () => {
  const points = basePoints({
    participated: true,
    mintEvents: [
      { id: "a", kind: "mint", confirmed: true, quantity: 10 },
      { id: "a", kind: "mint", confirmed: true, quantity: 10 },
      { id: "b", kind: "transfer", confirmed: true, quantity: 10 },
      { id: "c", kind: "secondary", confirmed: true, quantity: 5 },
      { id: "d", kind: "mint", confirmed: false, quantity: 5 },
    ],
  });
  assert.equal(points, 125);
});

test("holding and rank boundaries", () => {
  assert.deepEqual([0, 1, 5, 6, 10, 11, 20, 21, 60, 61].map(pixiesHoldingPercent), [0, 1, 1, 3, 3, 5, 5, 12, 12, 30]);
  assert.equal(rankBonusPercent(1), 29);
  assert.equal(rankBonusPercent(19), 11);
  assert.equal(rankBonusPercent(20), 10);
  assert.equal(rankBonusPercent(21), 0);
  assert.equal(gameBonusPercent(21), 5);
  assert.equal(gameBonusPercent(null), 0);
  assert.equal(gameBonusPercent(1), 29);
  const edges = [0n, 1n, 250000n * UNIT, 250000n * UNIT + 1n, 500000n * UNIT, 500000n * UNIT + 1n, 1000000n * UNIT, 1000000n * UNIT + 1n, 1500000n * UNIT, 1500000n * UNIT + 1n];
  assert.deepEqual(edges.map((value) => rpepeHoldingPercent(value)), [0, 1, 1, 3, 3, 5, 5, 7, 7, 10]);
});

test("percentage bonuses apply once", () => {
  assert.equal(weeklyPower(100, [10, 10]), 120);
  assert.notEqual(weeklyPower(100, [10, 10]), 121);
});

test("ties sort by power, then base points, then wallet", () => {
  const rows = assignBoardRanks([
    { wallet: "0xb", weeklyPower: 50, basePoints: 100 },
    { wallet: "0xa", weeklyPower: 50, basePoints: 100 },
    { wallet: "0xc", weeklyPower: 50, basePoints: 110 },
    { wallet: "0xd", weeklyPower: 40, basePoints: 200 },
  ]);
  assert.deepEqual(rows.map((row) => row.wallet), ["0xc", "0xa", "0xb", "0xd"]);
  assert.equal(compareStandings(rows[0], rows[1]) < 0, true);
});

test("wrong-wallet, duplicate, and client-submitted runs stay off the board", () => {
  const window = campaignDraws()[0];
  const runs = [
    { runId: "ok", wallet: "0xabc", game: "snake", score: 10, accepted: true, playedAt: "2026-11-04T20:00:00.000Z", acceptedAt: "2026-11-04T20:01:00.000Z" },
    { runId: "dup", wallet: "0xabc", game: "snake", score: 99, accepted: true, playedAt: "2026-11-04T20:00:00.000Z", acceptedAt: "2026-11-04T20:02:00.000Z" },
    { runId: "dup", wallet: "0xabc", game: "snake", score: 99, accepted: true, playedAt: "2026-11-04T20:00:00.000Z", acceptedAt: "2026-11-04T20:02:00.000Z" },
    { runId: "wrong", wallet: "0xdef", game: "snake", score: 100, accepted: true, playedAt: "2026-11-04T20:00:00.000Z", acceptedAt: "2026-11-04T20:02:00.000Z" },
    { runId: "client", wallet: "0xabc", game: "snake", score: 500, accepted: true, clientSubmittedFromMint: true, playedAt: "2026-11-04T20:00:00.000Z", acceptedAt: "2026-11-04T20:03:00.000Z" },
    { runId: "next", wallet: "0xabc", game: "snake", score: 80, accepted: true, playedAt: window.cutoff, acceptedAt: window.cutoff },
  ];
  assert.equal(acceptRun(runs[2], "0xabc", "snake", window).ok, true);
  assert.equal(acceptRun(runs[3], "0xabc", "snake", window).reason, "wrong_wallet");
  const best = bestRunsForWeek(runs, "snake", window);
  const mine = best.find((run) => run.wallet === "0xabc");
  assert.equal(mine.score, 99);
  assert.equal(inWindow(window.cutoff, window.opensAt, window.cutoff), false);
  const nextWeek = campaignDraws()[1];
  const rolled = bestRunsForWeek(runs, "snake", nextWeek);
  assert.equal(rolled.find((run) => run.wallet === "0xabc").score, 80);
  const bonuses = gameRankBonuses(runs, "0xabc", window, [{ id: "snake", enabled: true }]);
  assert.equal(bonuses[0].rank, 2);
  assert.equal(bonuses[0].percent, 28);
});

test("a same-week Pixie kept in the buying wallet is required, and a finish outside the top 20 still adds chances", () => {
  const week = campaignDraws()[0];
  const bought = {
    id: "mint-week",
    kind: "mint",
    confirmed: true,
    quantity: 1,
    buyer: "0xAbc",
    mintedAt: "2026-11-04T18:00:00.000Z",
    tokenIds: ["7"],
  };
  assert.equal(qualifiesForWeeklyDraw({ wallet: "0xabc", mintEvents: [bought], heldTokenIds: ["7"], window: week }), true);
  assert.equal(qualifiesForWeeklyDraw({ wallet: "0xabc", mintEvents: [bought], heldTokenIds: [], window: week }), false);
  assert.equal(qualifiesForWeeklyDraw({ wallet: "0xother", mintEvents: [bought], heldTokenIds: ["7"], window: week }), false);
  assert.equal(
    qualifiesForWeeklyDraw({
      wallet: "0xabc",
      mintEvents: [{ ...bought, mintedAt: "2026-10-01T18:00:00.000Z" }],
      heldTokenIds: ["7"],
      window: week,
    }),
    false
  );
  assert.equal(
    qualifiesForWeeklyDraw({
      wallet: "0xabc",
      mintEvents: [{ ...bought, kind: "transfer", id: "moved" }],
      heldTokenIds: ["7"],
      window: week,
    }),
    false
  );
  const outside = Array.from({ length: 21 }, (_, index) => ({
    runId: `run-${index}`,
    wallet: index === 20 ? "0xabc" : `0x${String(index).padStart(40, "0")}`,
    game: "snake",
    score: 100 - index,
    accepted: true,
    playedAt: "2026-11-04T20:00:00.000Z",
    acceptedAt: "2026-11-04T20:01:00.000Z",
  }));
  const finish = gameRankBonuses(outside, "0xabc", week, [{ id: "snake", enabled: true }]);
  assert.equal(finish[0].rank, 21);
  assert.equal(finish[0].percent, 5);
  const table = powerTable().map((row) => `${row.action} ${row.chances}`).join(" ");
  assert.match(table, /Required/);
  assert.match(table, /5% more chances/);
  assert.match(table, /29% more chances/);
  assert.doesNotMatch(table, /free|equal odds/i);
});

test("all-time power uses finalized weeks only", () => {
  assert.equal(allTimePower([10, 15]), 25);
  assert.equal(allTimePower([]), 0);
});

test("draw freeze drops late and duplicate entries, and claims do not double award", () => {
  const cutoff = "2026-11-08T20:00:00.000Z";
  const frozen = freezeEntries(
    [
      { weekId: "w1", wallet: "0xB", eligible: true, enteredAt: "2026-11-07T00:00:00.000Z" },
      { weekId: "w1", wallet: "0xb", eligible: true, enteredAt: "2026-11-06T00:00:00.000Z" },
      { weekId: "w1", wallet: "0xA", eligible: true, enteredAt: "2026-11-07T00:00:00.000Z" },
      { weekId: "w1", wallet: "0xC", eligible: false, enteredAt: "2026-11-07T00:00:00.000Z" },
      { weekId: "w1", wallet: "0xD", eligible: true, enteredAt: cutoff },
    ],
    cutoff
  );
  assert.deepEqual(frozen.map((entry) => entry.wallet), ["0xa", "0xb"]);
  const winners = selectWinners(frozen, { seed: "week-1", count: 1 });
  assert.equal(winners.length, 1);
  assert.deepEqual(selectWinners(frozen, { seed: "week-1", count: 1 }), winners);
  const counts = { "0xa": 0, "0xb": 0 };
  for (let seed = 0; seed < 4000; seed += 1) {
    counts[selectWinners(frozen, { seed, count: 1 })[0].wallet] += 1;
  }
  assert.ok(counts["0xa"] > 1800 && counts["0xa"] < 2200);
  assert.ok(counts["0xb"] > 1800 && counts["0xb"] < 2200);
  const weighted = frozen.map((entry) => ({ ...entry, chances: entry.wallet === "0xb" ? 300 : 100 }));
  const weightedCounts = { "0xa": 0, "0xb": 0 };
  for (let seed = 0; seed < 4000; seed += 1) {
    weightedCounts[selectWinners(weighted, { seed, count: 1 })[0].wallet] += 1;
  }
  assert.ok(weightedCounts["0xb"] > 2800 && weightedCounts["0xb"] < 3200);
  const ledger = new Map();
  const first = claimPrize(ledger, { weekId: "w1", place: 1, wallet: "0xA" });
  const repeat = claimPrize(ledger, { weekId: "w1", place: 1, wallet: "0xa" });
  const other = claimPrize(ledger, { weekId: "w1", place: 1, wallet: "0xB" });
  assert.equal(first.duplicate, false);
  assert.equal(repeat.duplicate, true);
  assert.equal(repeat.award.id, first.award.id);
  assert.equal(other.ok, false);
});

test("signed challenge matches the wallet and does not record an entry", async () => {
  const wallet = ethers.Wallet.createRandom();
  const issuedAt = new Date().toISOString();
  const message = buildChallengeMessage({ address: wallet.address, nonce: "n1", issuedAt });
  const signature = await wallet.signMessage(message);
  const verdict = verifyChallenge({ address: wallet.address, message, signature });
  assert.equal(verdict.ok, true);
  assert.equal(verdict.entryRecorded, false);
  const other = ethers.Wallet.createRandom();
  const mismatch = verifyChallenge({ address: other.address, message, signature });
  assert.equal(mismatch.ok, false);
});

test("preview lock keeps live actions off even when flags are set", () => {
  assert.equal(actionAllowed("entry"), false);
  assert.equal(actionAllowed("claim", { CAMPAIGN_CLAIMS_ENABLED: "true" }), false);
  assert.equal(actionAllowed("payout", { CAMPAIGN_PAYOUTS_ENABLED: "true" }, false), true);
  assert.equal(readFlags({}).entriesEnabled, false);
});

test("sample board is labeled and the local Balln contract does not match Pixies", () => {
  const board = sampleStandings();
  assert.equal(board.source, "sample");
  assert.equal(board.verified, false);
  assert.ok(board.rows.every((row) => row.sample === true));
  assert.equal(board.rows.filter((row) => row.eligible).length, 2);
  assert.equal(board.rows.find((row) => !row.eligible).weeklyPower, 0);
  const status = contractStatus({ CONTRACT_ADDRESS: "0x6b2B14002614292F99f9E09B94B59af396EAc27d" });
  assert.equal(status.matchesExpected, false);
  assert.equal(status.expectedContract, EXPECTED_PIXIES_CONTRACT);
  const live = contractStatus({ CONTRACT_ADDRESS: EXPECTED_PIXIES_CONTRACT });
  assert.equal(live.matchesExpected, true);
});
