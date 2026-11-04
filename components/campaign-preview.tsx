"use client";

import { useEffect, useMemo, useState } from "react";
import { EXPECTED_PIXIES_CONTRACT, MINT_URL, RPEPE_TOKEN } from "../lib/campaign/contracts.mjs";
import { ESIM_REDEMPTION_COPY, finaleTravelPrizes, seasonCommitment, weeklyPrizeRows } from "../lib/campaign/lineup.mjs";
import { DRAW_PLAN } from "../lib/campaign/draw.mjs";
import { enabledGames } from "../lib/campaign/runs.mjs";
import { campaignDraws, formatDraw, previewCountdown } from "../lib/campaign/schedule.mjs";
import { compareStandings } from "../lib/campaign/scoring.mjs";
import { sampleStandings } from "../lib/campaign/sampleBoard.mjs";

type SortKey =
  | "weeklyPower"
  | "allTimePower"
  | "lastWeekRank"
  | "pixiesHeld"
  | "rpepeHeld"
  | "gamepass"
  | "entryStatus";

type StatusPayload = {
  contract?: {
    chainId: number;
    serverContract: string;
    expectedContract: string;
    matchesExpected: boolean;
  };
};

const SORTS: { key: SortKey; label: string }[] = [
  { key: "weeklyPower", label: "Weekly power" },
  { key: "allTimePower", label: "All-time power" },
  { key: "lastWeekRank", label: "Last week rank" },
  { key: "pixiesHeld", label: "Pixies held" },
  { key: "rpepeHeld", label: "$RPEPE held" },
  { key: "gamepass", label: "GamePass" },
  { key: "entryStatus", label: "Weekly entry" },
];

function shortWallet(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function cardStyle() {
  return { backgroundColor: "var(--rpepe-card)", border: "1px solid var(--rpepe-border)" };
}

export default function CampaignPreview({ address }: { address?: string }) {
  const draws = campaignDraws();
  const commitment = seasonCommitment();
  const prizes = weeklyPrizeRows();
  const travel = finaleTravelPrizes();
  const games = enabledGames();
  const board = sampleStandings();
  const [sortKey, setSortKey] = useState<SortKey>("weeklyPower");
  const [localZone, setLocalZone] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusPayload | null>(null);

  useEffect(() => {
    setLocalZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    fetch("/api/campaign/status")
      .then((response) => response.json())
      .then((payload) => setStatus(payload))
      .catch(() => setStatus(null));
    return () => window.clearInterval(timer);
  }, []);

  const rows = useMemo(() => {
    const copy = [...board.rows];
    copy.sort((left, right) => {
      if (sortKey === "weeklyPower") return compareStandings(left, right);
      if (sortKey === "allTimePower") return right.allTimePower - left.allTimePower || compareStandings(left, right);
      if (sortKey === "lastWeekRank") {
        const leftRank = left.lastWeekRank ?? 999;
        const rightRank = right.lastWeekRank ?? 999;
        return leftRank - rightRank || compareStandings(left, right);
      }
      if (sortKey === "pixiesHeld") return right.pixiesHeld - left.pixiesHeld || compareStandings(left, right);
      if (sortKey === "rpepeHeld") {
        const leftRaw = BigInt(left.rpepeRaw);
        const rightRaw = BigInt(right.rpepeRaw);
        if (rightRaw > leftRaw) return 1;
        if (rightRaw < leftRaw) return -1;
        return compareStandings(left, right);
      }
      if (sortKey === "gamepass") return String(left.gamepass).localeCompare(String(right.gamepass)) || compareStandings(left, right);
      return String(left.entryStatus).localeCompare(String(right.entryStatus)) || compareStandings(left, right);
    });
    return copy;
  }, [board.rows, sortKey]);

  const contract = status?.contract;
  const countdown = now == null ? null : previewCountdown(draws[0].cutoff, new Date(now));

  return (
    <section id="campaign" data-preview-mode="true" className="max-w-7xl mx-auto px-6 py-20">
      <p style={{ color: "var(--rpepe-red)" }} className="text-center text-sm font-semibold uppercase tracking-widest mb-3">
        Four-week preview
      </p>
      <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-center text-5xl md:text-6xl mb-4">
        SUNDAY PRIZE <span style={{ color: "var(--rpepe-red)" }}>LINEUP</span>
      </h2>
      <p className="text-center text-gray-400 max-w-2xl mx-auto mb-4">
        Free weekly draw on {MINT_URL}. Every eligible entry has the same chance. Power Board position, scores, Pixies, $RPEPE, and GamePass do not buy extra entries.
      </p>
      <p className="text-center text-xs text-gray-500 max-w-2xl mx-auto mb-8">
        {DRAW_PLAN.rulesStatus} Dates and the countdown stay in preview until that date is confirmed.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <a href="https://www.pepinho.games" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "var(--rpepe-red)" }} className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity">
          Pepinho Games
        </a>
        <a href={MINT_URL} className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white" style={{ border: "1px solid rgba(232,53,58,0.5)", color: "var(--rpepe-red)" }}>
          redpepemint.xyz
        </a>
      </div>

      <div style={cardStyle()} className="rounded-2xl p-6 mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Season commitment</p>
        <p className="text-white text-lg font-semibold">{commitment.avax} AVAX and {commitment.passes} one-month passes</p>
        <p className="text-sm text-gray-400 mt-2">
          {commitment.gamepassCount} GamePass and {commitment.gamepassPlusCount} GamePass+ months. GamePass retail value is separate from the cash prize budget.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Finale model: {commitment.modeled}. The $320 figure is an internal planning target with operating headroom, not the prize total. No eSIM provider quote is loaded, so that target is not reconciled yet.
        </p>
        <p className="text-sm text-gray-500 mt-3" data-contract-status={contract ? String(contract.matchesExpected) : "loading"}>
          Chain {contract?.chainId ?? 43114}. This deployment mints{" "}
          <span className="text-gray-300 break-all">{contract?.serverContract || "…"}</span>. Expected Pixies contract{" "}
          <span className="text-gray-300 break-all">{EXPECTED_PIXIES_CONTRACT}</span>.
          {contract ? (contract.matchesExpected ? " Contract matches." : " Contract does not match. Do not test a mint here.") : " Checking the server contract."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {draws.map((draw) => (
          <article key={draw.week} style={cardStyle()} className="rounded-2xl p-6" data-draw-week={draw.week}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Proposed Sunday draw</p>
            <h3 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-3xl mb-2">
              Week {draw.week}
              {draw.week === 4 ? <span style={{ color: "var(--rpepe-red)" }}> Finale</span> : null}
            </h3>
            <p className="text-sm text-white mb-1" data-draw-pacific={draw.week}>{formatDraw(draw.cutoff, "America/Los_Angeles")}</p>
            <p className="text-sm text-gray-400 mb-4" data-draw-local={draw.week}>
              {localZone ? `Your time: ${formatDraw(draw.cutoff, localZone)}` : "Your local time appears after this page loads."}
            </p>
            <ul className="space-y-2">
              {prizes.map((prize) => (
                <li key={prize.place} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-gray-500">{prize.place}</span>
                  <span className="text-white font-semibold text-right">{prize.award}</span>
                </li>
              ))}
            </ul>
            {draw.week === 4 ? (
              <div style={{ borderTop: "1px solid var(--rpepe-border)" }} className="mt-4 pt-4 space-y-3">
                <p style={{ color: "var(--rpepe-red)" }} className="text-xs font-semibold uppercase tracking-widest">Travel prizes</p>
                {travel.map((prize) => (
                  <div key={prize.award}>
                    <p className="text-sm text-white font-semibold">{prize.award}</p>
                    <p className="text-xs text-gray-400 mt-1">{prize.detail}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mb-10" data-countdown="preview">
        {countdown ? `Preview countdown to the proposed first draw: ${countdown.label}. ${countdown.note}` : "Preview countdown loads with your clock."}
      </p>

      <div style={cardStyle()} className="rounded-2xl p-6 md:p-8 mb-8">
        <h3 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-4xl mb-3">HOW POWER IS SCORED</h3>
        <p className="text-sm text-gray-400 mb-4">
          Base is 100 points for participating, plus mint points. A single transaction of 1, 3, 5, or 10 Pixies earns 1, 5, 10, or 25 points. Any other quantity earns 1 point per Pixie. Confirmed Pixies mints count once. Transfers and secondary purchases do not.
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Each enabled game is ranked on its own. Rank 20 adds 10%, rank 19 adds 11%, and rank 1 adds 29%. Pixies holdings add 0% at zero, 1% for 1–5, 3% for 6–10, 5% for 11–20, 12% for 21–60, and 30% for 61 or more. $RPEPE holdings add 0% at zero, 1% through 250,000, 3% through 500,000, 5% through 1 million, 7% through 1.5 million, and 10% above that. Token decimals set the exact boundaries.
        </p>
        <p className="text-sm text-gray-400 mb-4">
          The percentage bonuses are added together and applied once to base points. Final scores and holdings use the Sunday noon Pacific cutoff. Ties go to the higher base, then the lower wallet address. {RPEPE_TOKEN} is the $RPEPE token.
        </p>
        <ul className="space-y-2 text-sm text-gray-300">
          {games.map((game) => (
            <li key={game.id}>
              <a href={game.href} target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-red-400">{game.label}</a>
              <span className="text-gray-500">. {game.note}</span>
            </li>
          ))}
          <li className="text-gray-500">Telegram stays off until a same-wallet signature is verified. Seed phrases and private keys are never requested.</li>
        </ul>
      </div>

      <div style={cardStyle()} className="rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p style={{ color: "var(--rpepe-red)" }} className="text-xs font-semibold uppercase tracking-widest mb-2">Sample data</p>
            <h3 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-4xl">POWER BOARD</h3>
          </div>
          <p className="text-sm text-gray-500 max-w-sm">{board.note}</p>
        </div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
          Sort
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="mt-2 block w-full sm:w-64 bg-black text-white border border-neutral-700 rounded-lg px-3 py-2"
          >
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </label>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-gray-500">
                {["Rank", "Wallet", "Weekly power", "All-time", "Last week", "Pixies", "$RPEPE", "GamePass", "Entry"].map((heading) => (
                  <th key={heading} className="pb-3 pr-4 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: "1px solid var(--rpepe-border)" }}>
                <td className="py-3 pr-4 text-gray-400">—</td>
                <td className="py-3 pr-4 text-white">{address ? shortWallet(address) : "Not connected"}</td>
                <td className="py-3 pr-4 text-gray-500" colSpan={7}>Your wallet is not on the sample board. Connecting does not enter the draw.</td>
              </tr>
              {rows.map((row) => (
                <tr key={row.wallet} style={{ borderTop: "1px solid var(--rpepe-border)" }} data-sample-row="true">
                  <td className="py-3 pr-4 text-gray-400">{row.rank}</td>
                  <td className="py-3 pr-4 text-gray-300">Sample {shortWallet(row.wallet)}</td>
                  <td className="py-3 pr-4 text-white">{row.weeklyPower}</td>
                  <td className="py-3 pr-4 text-gray-300">{row.allTimePower}</td>
                  <td className="py-3 pr-4 text-gray-300">{row.lastWeekRank ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-300">{row.pixiesHeld}</td>
                  <td className="py-3 pr-4 text-gray-300">{row.rpepeHeld}</td>
                  <td className="py-3 pr-4 text-gray-300">{row.gamepass}</td>
                  <td className="py-3 text-gray-300">{row.entryStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button type="button" disabled aria-disabled="true" data-campaign-control="entry" style={{ backgroundColor: "#555" }} className="px-6 py-3 rounded-xl font-bold text-white cursor-not-allowed opacity-60">
            Enter this week
          </button>
          <button type="button" disabled aria-disabled="true" data-campaign-control="payout" style={{ border: "1px solid var(--rpepe-border)", color: "#888" }} className="px-6 py-3 rounded-xl font-bold cursor-not-allowed opacity-60">
            Claim payout
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">Preview only. Entry and payouts are disabled. {ESIM_REDEMPTION_COPY} The provider has not confirmed that six-month window, so fulfillment stays off.</p>
      </div>

      <div style={cardStyle()} className="rounded-2xl p-6 mt-8">
        <p style={{ color: "var(--rpepe-red)" }} className="text-xs font-semibold uppercase tracking-widest mb-2">Separate competition</p>
        <h3 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-3xl mb-2">BALLN FREE THROW</h3>
        <p className="text-sm text-gray-400 mb-4">
          $6 weekly competition. Its entry, rules, and prizes stay on Pepinho and are separate from this Pixies draw.
        </p>
        <a href="https://www.pepinho.games/basketball" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "var(--rpepe-red)" }} className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white">
          Balln Free Throw
        </a>
      </div>
    </section>
  );
}
