"use client";

import { useEffect, useMemo, useState } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { ESIM_REDEMPTION_COPY, finaleTravelPrizes, weeklyPrizeRows } from "../lib/campaign/lineup.mjs";
import { enabledGames } from "../lib/campaign/runs.mjs";
import { campaignDraws, formatDraw } from "../lib/campaign/schedule.mjs";
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

function formatReadableAmount(exact: string) {
  const [whole, fraction = ""] = exact.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const shown = fraction.slice(0, 2).replace(/0+$/, "");
  return shown ? `${withCommas}.${shown}` : withCommas;
}

function formatPower(value: number) {
  return Number.isInteger(value) ? value.toLocaleString("en-US") : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function cardStyle() {
  return { backgroundColor: "var(--rpepe-card)", border: "1px solid var(--rpepe-border)" };
}

export default function CampaignPreview() {
  const address = useAddress();
  const draws = campaignDraws();
  const prizes = weeklyPrizeRows();
  const travel = finaleTravelPrizes();
  const games = enabledGames();
  const board = sampleStandings();
  const [sortKey, setSortKey] = useState<SortKey>("weeklyPower");
  const [localZone, setLocalZone] = useState<string | null>(null);

  useEffect(() => {
    setLocalZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
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

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <p style={{ color: "var(--rpepe-red)" }} className="text-sm font-semibold uppercase tracking-widest mb-3">
        Free Sunday draw
      </p>
      <h1 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-5xl md:text-6xl leading-none mb-4">
        Red Pepe Pixies <span style={{ color: "var(--rpepe-red)" }}>×</span> Pepinho Games
      </h1>
      <p className="text-gray-300 text-lg max-w-2xl mb-6">
        Enter once each week for a free Sunday draw. Every eligible entrant has the same chance. Buying Pixies, holding tokens, having GamePass, and placing on the Power Board do not change the draw.
      </p>
      <a
        href="https://www.pepinho.games"
        target="_blank"
        rel="noopener noreferrer"
        style={{ backgroundColor: "var(--rpepe-red)" }}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
      >
        Pepinho Games
      </a>

      <section style={cardStyle()} className="rounded-2xl p-6 mt-10">
        <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-4xl mb-4">
          Every Sunday
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {prizes.map((prize) => (
            <li key={prize.place} className="flex items-baseline justify-between gap-3 text-sm border-b border-neutral-800 pb-2">
              <span className="text-gray-400">{prize.place}</span>
              <span className="text-white font-semibold text-right">{prize.award}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button type="button" disabled aria-disabled="true" data-campaign-control="entry" style={{ backgroundColor: "#555" }} className="px-6 py-3 rounded-xl font-bold text-white cursor-not-allowed opacity-60">
            Enter
          </button>
          <button type="button" disabled aria-disabled="true" data-campaign-control="payout" style={{ border: "1px solid var(--rpepe-border)", color: "#888" }} className="px-6 py-3 rounded-xl font-bold cursor-not-allowed opacity-60">
            Claim
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">Entries and claims aren’t open yet.</p>
      </section>

      <section className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
          <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-3xl">
            Draw schedule
          </h2>
          <p className="text-sm text-gray-400" data-dates-notice="proposed">These dates are proposed.</p>
        </div>
        <ol className="space-y-3">
          {draws.map((draw) => (
            <li key={draw.week} style={cardStyle()} className="rounded-xl px-4 py-3" data-draw-week={draw.week}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <p className="text-white font-semibold">Week {draw.week}{draw.week === 4 ? " finale" : ""}</p>
                <p className="text-sm text-white" data-draw-pacific={draw.week}>{formatDraw(draw.cutoff, "America/Los_Angeles")}</p>
              </div>
              <p className="text-sm text-gray-400 mt-1" data-draw-local={draw.week}>
                {localZone ? `Your time: ${formatDraw(draw.cutoff, localZone)}` : "Your local time appears after this page loads."}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section style={cardStyle()} className="rounded-2xl p-6 mt-8">
        <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-3xl mb-4">
          Week 4 extras
        </h2>
        <div className="space-y-4">
          {travel.map((prize) => (
            <div key={prize.award}>
              <p className="text-white font-semibold">{prize.award}</p>
              {prize.award.startsWith("One eSIM") ? (
                <p className="text-sm text-gray-400 mt-1">{ESIM_REDEMPTION_COPY}</p>
              ) : (
                <p className="text-sm text-gray-400 mt-1">{prize.detail}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={cardStyle()} className="rounded-2xl p-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-4xl">Power Board</h2>
            <p className="text-sm text-gray-400 mt-1">Sample standings</p>
          </div>
          <label className="text-xs uppercase tracking-widest text-gray-500">
            Sort
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="mt-2 block w-full sm:w-56 bg-black text-white border border-neutral-700 rounded-lg px-3 py-2 normal-case tracking-normal text-sm"
            >
              {SORTS.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-gray-500">
                {["Rank", "Wallet", "Weekly power", "All-time", "Last week", "Pixies", "$RPEPE", "GamePass", "Entry"].map((heading) => (
                  <th key={heading} className="pb-3 pr-4 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.wallet} style={{ borderTop: "1px solid var(--rpepe-border)" }} data-sample-row="true">
                  <td className="py-3 pr-4 text-gray-400">{row.rank}</td>
                  <td className="py-3 pr-4 text-gray-300">{shortWallet(row.wallet)}</td>
                  <td className="py-3 pr-4 text-white">{formatPower(row.weeklyPower)}</td>
                  <td className="py-3 pr-4 text-gray-300">{formatPower(row.allTimePower)}</td>
                  <td className="py-3 pr-4 text-gray-300">{row.lastWeekRank ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-300">{row.pixiesHeld.toLocaleString("en-US")}</td>
                  <td className="py-3 pr-4 text-gray-300" title={row.rpepeHeld} data-rpepe-exact={row.rpepeRaw}>{formatReadableAmount(row.rpepeHeld)}</td>
                  <td className="py-3 pr-4 text-gray-300">{row.gamepass}</td>
                  <td className="py-3 text-gray-300">{row.entryStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ol className="md:hidden space-y-3">
          {rows.map((row) => (
            <li key={row.wallet} style={{ borderTop: "1px solid var(--rpepe-border)" }} className="pt-3" data-sample-row="true">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-white font-semibold">#{row.rank} {shortWallet(row.wallet)}</p>
                <p className="text-white">{formatPower(row.weeklyPower)}</p>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-sm text-gray-400">
                <div>All-time <span className="text-gray-200">{formatPower(row.allTimePower)}</span></div>
                <div>Last week <span className="text-gray-200">{row.lastWeekRank ?? "—"}</span></div>
                <div>Pixies <span className="text-gray-200">{row.pixiesHeld.toLocaleString("en-US")}</span></div>
                <div>$RPEPE <span className="text-gray-200" title={row.rpepeHeld} data-rpepe-exact={row.rpepeRaw}>{formatReadableAmount(row.rpepeHeld)}</span></div>
                <div>GamePass <span className="text-gray-200">{row.gamepass}</span></div>
                <div>Entry <span className="text-gray-200">{row.entryStatus}</span></div>
              </dl>
            </li>
          ))}
        </ol>

        {address ? <p className="text-sm text-gray-500 mt-4">{shortWallet(address)} is connected. It is not listed in these standings.</p> : null}

        <details className="mt-6">
          <summary className="cursor-pointer text-white font-semibold">How Power works</summary>
          <div className="text-sm text-gray-400 mt-3 space-y-3">
            <p>You start with 100 points for taking part, plus points for confirmed Pixies mints. A single mint of 1, 3, 5, or 10 Pixies earns 1, 5, 10, or 25 points. Any other quantity earns 1 point per Pixie. Each mint counts once. Transfers and later purchases do not.</p>
            <p>Snake, Red Pepe Rocket, and Frogger are ranked separately. Rank 20 adds 10%, rank 19 adds 11%, and rank 1 adds 29%. Those bonuses are added to the holding bonuses, then applied once to the base points.</p>
            <p>Pixies add 0% at zero, 1% for 1–5, 3% for 6–10, 5% for 11–20, 12% for 21–60, and 30% for 61 or more. $RPEPE adds 0% at zero, 1% through 250,000, 3% through 500,000, 5% through 1 million, 7% through 1.5 million, and 10% above that.</p>
            <p>Scores and holdings are taken at Sunday noon Pacific. If weekly power matches, the higher base ranks first, then the lower wallet address.</p>
            <p>
              {games.map((game, index) => (
                <span key={game.id}>
                  {index > 0 ? " · " : ""}
                  <a href={game.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-400">{game.label}</a>
                </span>
              ))}
            </p>
          </div>
        </details>
      </section>

      <section style={cardStyle()} className="rounded-2xl p-5 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-white font-semibold">Balln Free Throw</p>
          <p className="text-sm text-gray-400 mt-1">A separate $6 weekly competition. Its entry, rules, and prizes are not part of this draw.</p>
        </div>
        <a href="https://www.pepinho.games/basketball" target="_blank" rel="noopener noreferrer" style={{ border: "1px solid rgba(232,53,58,0.5)", color: "var(--rpepe-red)" }} className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold">
          Play Free Throw
        </a>
      </section>
    </main>
  );
}
