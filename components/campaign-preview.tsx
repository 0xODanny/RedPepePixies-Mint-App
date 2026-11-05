"use client";

import { useEffect, useMemo, useState } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { ESIM_REDEMPTION_COPY, finaleTravelPrizes, weeklyPrizeRows } from "../lib/campaign/lineup.mjs";
import { enabledGames } from "../lib/campaign/runs.mjs";
import { campaignDraws, formatDraw } from "../lib/campaign/schedule.mjs";
import { compareStandings, powerTable } from "../lib/campaign/scoring.mjs";
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
  { key: "weeklyPower", label: "Chances" },
  { key: "allTimePower", label: "All-time power" },
  { key: "lastWeekRank", label: "Last week rank" },
  { key: "pixiesHeld", label: "Pixies held" },
  { key: "rpepeHeld", label: "$RPEPE held" },
  { key: "gamepass", label: "GamePass" },
  { key: "entryStatus", label: "Weekly entry" },
];

const PRIZE_ART: Record<string, string> = {
  avax: "/campaign/avax.png",
  gamepass: "/campaign/gamepass.jpg",
  "gamepass-plus": "/campaign/gamepass.jpg",
  esim: "/campaign/esim.jpg",
  vpn: "/campaign/vpn.svg",
};

const GAME_ART: Record<string, string> = {
  snake: "/campaign/snake.jpg",
  "red-pepe-rocket": "/campaign/rocket.jpg",
  frogger: "/campaign/frogger.jpg",
};

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

function PrizeCard({
  kind,
  count,
  title,
  detail,
  featured = false,
}: {
  kind: string;
  count: number;
  title: string;
  detail: string;
  featured?: boolean;
}) {
  return (
    <article style={cardStyle()} className={`prize-card rounded-2xl p-4 ${featured ? "sm:col-span-1" : ""}`}>
      <div className="flex items-center gap-3">
        <img src={PRIZE_ART[kind]} alt="" className="h-14 w-14 rounded-xl object-cover bg-black" />
        <div>
          <p style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-3xl leading-none">
            {count}×
          </p>
          <p className="text-white font-semibold">{title}</p>
          <p className="text-sm text-gray-400">{detail}</p>
        </div>
      </div>
    </article>
  );
}

export default function CampaignPreview() {
  const address = useAddress();
  const draws = campaignDraws();
  const prizes = weeklyPrizeRows();
  const travel = finaleTravelPrizes();
  const games = enabledGames();
  const chances = powerTable();
  const board = sampleStandings();
  const avaxPrizes = prizes.filter((prize) => prize.kind === "avax");
  const otherPrizes = prizes.filter((prize) => prize.kind !== "avax");
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
    <main className="relative max-w-5xl mx-auto px-6 py-10 md:py-16 overflow-hidden">
      <img src="/campaign/pixie.png" alt="" aria-hidden="true" className="pixie-float pointer-events-none absolute left-0 top-8 hidden w-16 opacity-80 md:block" />
      <img src="/campaign/pixie-float.png" alt="" aria-hidden="true" className="pixie-float pointer-events-none absolute right-0 top-24 hidden w-24 opacity-90 md:block" style={{ animationDelay: "1.2s" }} />

      <section className="campaign-rise relative text-center">
        <div className="mb-5 flex items-center justify-center gap-3">
          <img src="/campaign/pepe-logo.png" alt="Red Pepe" className="h-14 w-14 rounded-full object-cover" />
          <span style={{ color: "var(--rpepe-red)" }} className="text-2xl">×</span>
          <img src="/campaign/pepinho-logo.png" alt="Pepinho Games" className="h-14 w-14 rounded-full object-cover" />
        </div>
        <p style={{ color: "var(--rpepe-red)" }} className="text-sm font-semibold uppercase tracking-widest mb-3">
          Red Pepe Pixies × Pepinho Games
        </p>
        <h1 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-5xl md:text-7xl leading-none mb-4">
          Mint. Play. Power up.
        </h1>
        <p className="text-xl text-white max-w-xl mx-auto mb-3">
          Your weekly Pixie. Your next high score. Your shot at Sunday prizes.
        </p>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Mint at least one Pixie this week and keep it in the same wallet until Sunday noon Pacific to qualify. Play games to boost your Power. Your Pixies and $RPEPE holdings add bonuses too.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="https://www.redpepemint.xyz" style={{ backgroundColor: "var(--rpepe-red)" }} className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white hover:opacity-90">
            Mint a Pixie
          </a>
          <a href="https://www.pepinho.games" style={cardStyle()} className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white hover:border-red-700">
            Play on Pepinho
          </a>
        </div>
      </section>

      <section className="campaign-rise mt-14" style={{ animationDelay: "0.08s" }}>
        <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-4xl mb-4">
          Every Sunday
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {avaxPrizes.map((prize) => (
            <PrizeCard key={prize.id} {...prize} featured />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {otherPrizes.map((prize) => (
            <PrizeCard key={prize.id} {...prize} />
          ))}
        </div>
      </section>

      <section className="campaign-rise mt-14" style={{ animationDelay: "0.12s" }}>
        <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-4xl mb-4">
          How you get in
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <li style={cardStyle()} className="rounded-2xl p-5">
            <img src="/campaign/pixie.png" alt="" className="h-16 w-16 rounded-xl mb-3" />
            <p style={{ color: "var(--rpepe-red)" }} className="text-sm font-semibold">1 · Mint</p>
            <p className="text-white mt-1">Mint at least one new Pixie this week and keep that NFT in the same wallet through Sunday noon Pacific.</p>
          </li>
          <li style={cardStyle()} className="rounded-2xl p-5">
            <div className="flex gap-2 mb-3">
              {games.map((game) => (
                <img key={game.id} src={GAME_ART[game.id]} alt="" className="h-16 w-16 rounded-xl object-cover" />
              ))}
            </div>
            <p style={{ color: "var(--rpepe-red)" }} className="text-sm font-semibold">2 · Play</p>
            <p className="text-white mt-1">Play the ranked games with that same wallet. A finish adds Power. A top-20 finish adds more.</p>
          </li>
          <li style={cardStyle()} className="rounded-2xl p-5">
            <img src="/campaign/avax.png" alt="" className="h-16 w-16 rounded-xl mb-3 bg-black object-contain" />
            <p style={{ color: "var(--rpepe-red)" }} className="text-sm font-semibold">3 · Enter</p>
            <p className="text-white mt-1">Enter that week’s draw when entries open. Weekly Power is the wallet’s draw weight.</p>
          </li>
        </ol>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button type="button" disabled aria-disabled="true" data-campaign-control="entry" style={{ backgroundColor: "#555" }} className="px-6 py-3 rounded-xl font-bold text-white cursor-not-allowed opacity-60">
            Enter
          </button>
          <button type="button" disabled aria-disabled="true" data-campaign-control="payout" style={{ border: "1px solid var(--rpepe-border)", color: "#888" }} className="px-6 py-3 rounded-xl font-bold cursor-not-allowed opacity-60">
            Claim
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-3">Entries and claims aren’t open yet.</p>
      </section>

      <section className="campaign-rise mt-14" style={{ animationDelay: "0.16s" }}>
        <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-4xl mb-1">
          Week 4 Power-Up
        </h2>
        <p className="text-gray-400 mb-4">Two extra prizes join the full Sunday lineup.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {travel.map((prize) => (
            <PrizeCard key={prize.id} {...prize} />
          ))}
        </div>
      </section>

      <section style={cardStyle()} className="campaign-rise rounded-2xl p-6 mt-14">
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
        <p className="text-sm text-gray-400 mb-4">All-time Power is a season total. Only this week’s eligible Power counts in the draw.</p>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-gray-500">
                {["Rank", "Wallet", "Chances", "All-time", "Last week", "Pixies", "$RPEPE", "GamePass", "Entry"].map((heading) => (
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
      </section>

      <section className="campaign-rise mt-10">
        <p className="text-white font-semibold mb-3">Mint, play, and hold to boost your weekly chances.</p>
        <details className="cheat-sheet group rounded-2xl" style={cardStyle()}>
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-5 py-4 text-white font-semibold">
            <span>Power Point Cheat Sheet 🐸</span>
            <span aria-hidden="true" className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="px-5 pb-5 text-sm text-gray-300 space-y-4">
            <p>You start with 100 Power once you qualify, plus points for the Pixies you mint and keep. Bonus percents add together once, then apply to that base. The result is your weekly Power.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-gray-500">
                    <th className="pb-2 pr-3">Action</th>
                    <th className="pb-2 pr-3">Power</th>
                    <th className="pb-2">Chances</th>
                  </tr>
                </thead>
                <tbody>
                  {chances.map((row) => (
                    <tr key={row.action} style={{ borderTop: "1px solid var(--rpepe-border)" }}>
                      <td className="py-2 pr-3 text-white">{row.action}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{row.power}</td>
                      <td className="py-2">{row.chances}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>If eligible wallets have 1,000 Power combined and you have 284 Power, your chance of winning the first prize draw is 28.4%.</p>
            <p>That is the chance for the first prize only. After a wallet wins, it leaves the draw and the next prize uses the Power that is still in.</p>
          </div>
        </details>
      </section>

      <section className="campaign-rise mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
          <h2 style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }} className="text-3xl">Draw schedule</h2>
          <p className="text-sm text-gray-400" data-dates-notice="proposed">Dates to be confirmed.</p>
        </div>
        <ol className="space-y-2">
          {draws.map((draw) => (
            <li key={draw.week} style={cardStyle()} className="rounded-xl px-4 py-3" data-draw-week={draw.week}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <p className="text-white font-semibold">Week {draw.week}{draw.week === 4 ? " Power-Up" : ""}</p>
                <p className="text-sm text-white" data-draw-pacific={draw.week}>{formatDraw(draw.cutoff, "America/Los_Angeles")}</p>
              </div>
              <p className="text-sm text-gray-400 mt-1" data-draw-local={draw.week}>
                {localZone ? `Your time: ${formatDraw(draw.cutoff, localZone)}` : "Your local time appears after this page loads."}
              </p>
            </li>
          ))}
        </ol>
        <div style={cardStyle()} className="rounded-2xl p-5 mt-4 text-sm text-gray-300 space-y-2">
          <p className="text-white font-semibold">Prize terms</p>
          <p>Sunday prizes are drawn at noon Pacific. Older Pixies can add a holding bonus, but only a Pixie minted that week, and still in that wallet, gets you into the draw.</p>
          <p>{ESIM_REDEMPTION_COPY}</p>
        </div>
      </section>

      <section style={cardStyle()} className="campaign-rise rounded-2xl p-5 mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <img src="/campaign/balln.jpg" alt="Balln Free Throw" className="h-24 w-24 rounded-xl object-cover" />
        <div className="flex-1">
          <p className="text-white font-semibold">Balln Free Throw</p>
          <p className="text-sm text-gray-400 mt-1">Its own $6 weekly competition, with its own entry and prizes.</p>
        </div>
        <a href="https://www.pepinho.games/basketball" style={{ border: "1px solid rgba(232,53,58,0.5)", color: "var(--rpepe-red)" }} className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold">
          Play Free Throw
        </a>
      </section>
    </main>
  );
}
