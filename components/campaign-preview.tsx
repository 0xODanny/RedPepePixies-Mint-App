"use client";

const WEEKLY_PRIZES = [
  { place: "1st", award: "3 AVAX" },
  { place: "2nd", award: "2 AVAX" },
  { place: "3rd", award: "1 AVAX" },
  { place: "Next 10", award: "One-month GamePass" },
  { place: "Next 5", award: "One-month GamePass+" },
] as const;

const TRAVEL_PRIZES = [
  {
    award: "Pepinho Travel eSIM",
    href: "https://www.pepinho.games/travel/esim",
  },
  {
    award: "Pepinho Travel VPN",
    href: "https://www.pepinho.games/travel/vpn",
  },
] as const;

const SAMPLE_BOARD = [
  { rank: "1", wallet: "Sample wallet", score: "—", prize: "3 AVAX" },
  { rank: "2", wallet: "Sample wallet", score: "—", prize: "2 AVAX" },
  { rank: "3", wallet: "Sample wallet", score: "—", prize: "1 AVAX" },
] as const;

function shortWallet(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function CampaignPreview({ address }: { address?: string }) {
  return (
    <section id="campaign" className="max-w-7xl mx-auto px-6 py-20">
      <p
        style={{ color: "var(--rpepe-red)" }}
        className="text-center text-sm font-semibold uppercase tracking-widest mb-3"
      >
        Four-week preview
      </p>
      <h2
        style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
        className="text-center text-5xl md:text-6xl mb-4"
      >
        SUNDAY PRIZE <span style={{ color: "var(--rpepe-red)" }}>LINEUP</span>
      </h2>
      <p className="text-center text-gray-400 max-w-2xl mx-auto mb-8">
        Play with the same wallet you connect on this mint. Each Sunday pays the
        lineup below. This preview keeps entry and payouts off.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        <a
          href="https://www.pepinho.games"
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundColor: "var(--rpepe-red)" }}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
        >
          Pepinho Games
        </a>
        <a
          href="https://www.pepinho.games/basketball"
          target="_blank"
          rel="noopener noreferrer"
          style={{ border: "1px solid rgba(232,53,58,0.5)", color: "var(--rpepe-red)" }}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold hover:bg-red-950 transition-colors"
        >
          Balln Free Throw
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
        {[1, 2, 3, 4].map((week) => (
          <article
            key={week}
            style={{ backgroundColor: "var(--rpepe-card)", border: "1px solid var(--rpepe-border)" }}
            className="rounded-2xl p-6"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Sunday</p>
            <h3
              style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
              className="text-3xl mb-4"
            >
              Week {week}
              {week === 4 ? (
                <span style={{ color: "var(--rpepe-red)" }}> Finale</span>
              ) : null}
            </h3>
            <ul className="space-y-2">
              {WEEKLY_PRIZES.map((prize) => (
                <li key={prize.place} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-gray-500">{prize.place}</span>
                  <span className="text-white font-semibold text-right">{prize.award}</span>
                </li>
              ))}
            </ul>
            {week === 4 ? (
              <div
                style={{ borderTop: "1px solid var(--rpepe-border)" }}
                className="mt-4 pt-4"
              >
                <p
                  style={{ color: "var(--rpepe-red)" }}
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                >
                  Travel prizes
                </p>
                <ul className="space-y-2">
                  {TRAVEL_PRIZES.map((prize) => (
                    <li key={prize.award}>
                      <a
                        href={prize.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white font-semibold hover:text-red-400 transition-colors"
                      >
                        {prize.award} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div
        style={{ backgroundColor: "var(--rpepe-card)", border: "1px solid var(--rpepe-border)" }}
        className="rounded-2xl p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p
              style={{ color: "var(--rpepe-red)" }}
              className="text-xs font-semibold uppercase tracking-widest mb-2"
            >
              Preview
            </p>
            <h3
              style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
              className="text-4xl"
            >
              POWER BOARD
            </h3>
          </div>
          <p className="text-sm text-gray-500 max-w-sm">
            {address
              ? `Connected ${shortWallet(address)}. Your row stays empty until entry is turned on.`
              : "Connect the wallet in the header to preview your row. Entry stays off."}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-gray-500">
                <th className="pb-3 pr-4 font-semibold">Rank</th>
                <th className="pb-3 pr-4 font-semibold">Wallet</th>
                <th className="pb-3 pr-4 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Prize</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: "1px solid var(--rpepe-border)" }}>
                <td className="py-3 pr-4 text-gray-400">—</td>
                <td className="py-3 pr-4 text-white">
                  {address ? shortWallet(address) : "Not connected"}
                </td>
                <td className="py-3 pr-4 text-gray-500">Not entered</td>
                <td className="py-3 text-gray-500">—</td>
              </tr>
              {SAMPLE_BOARD.map((row) => (
                <tr key={row.rank} style={{ borderTop: "1px solid var(--rpepe-border)" }}>
                  <td className="py-3 pr-4 text-gray-400">{row.rank}</td>
                  <td className="py-3 pr-4 text-gray-500">{row.wallet}</td>
                  <td className="py-3 pr-4 text-gray-500">{row.score}</td>
                  <td className="py-3 text-gray-300">{row.prize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            disabled
            aria-disabled="true"
            data-campaign-control="entry"
            style={{ backgroundColor: "#555" }}
            className="px-6 py-3 rounded-xl font-bold text-white cursor-not-allowed opacity-60"
          >
            Enter this week
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            data-campaign-control="payout"
            style={{ border: "1px solid var(--rpepe-border)", color: "#888" }}
            className="px-6 py-3 rounded-xl font-bold cursor-not-allowed opacity-60"
          >
            Claim payout
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Preview only. Entry and payouts are disabled.
        </p>
      </div>
    </section>
  );
}
