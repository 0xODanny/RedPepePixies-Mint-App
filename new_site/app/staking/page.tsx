"use client";

import Link from "next/link";
import { useState } from "react";

// Mock data for the "connected" preview state
const MOCK_WALLET = {
  address: "0x216b...c0C7",
  avaxBalance: "0.784 AVAX",
  rpepeBalance: "1,637,908.265",
  pixieNFTs: 1,
  pointsPerDay: 235.27,
  baseCap: 234.1,
  timeUntilNFT: 0.0,
  progress: 100,
  alreadyReceived: true,
};

export default function StakingPage() {
  const [connected, setConnected] = useState(false);
  const [registered, setRegistered] = useState(false);

  return (
    <div
      style={{ backgroundColor: "#050505", color: "#fff", minHeight: "100vh" }}
      className="font-[var(--font-geist-sans)]"
    >
      {/* ── SCANLINE OVERLAY ─ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav
        style={{
          backgroundColor: "rgba(5,5,5,0.96)",
          borderBottom: "1px solid #0a2a0a",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://www.redpepe.meme/red_pepe_mini_logo.png"
              alt="Red Pepe logo"
              className="w-7 h-7 object-contain"
            />
            <span
              style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.05em", color: "var(--rpepe-red)" }}
              className="text-xl"
            >
              RED PEPE PIXIES
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
              Mint
            </Link>
            <span style={{ color: "var(--rpepe-green)" }} className="text-sm font-semibold">
              Staking
            </span>
            <a
              href="https://t.me/redpepeavax1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Community
            </a>
          </div>

          {/* Wallet connect */}
          {!connected ? (
            <button
              onClick={() => setConnected(true)}
              style={{
                border: "1px solid rgba(0,255,65,0.5)",
                color: "var(--rpepe-green)",
                backgroundColor: "transparent",
                fontFamily: "var(--font-pixel)",
              }}
              className="px-4 py-2 rounded text-sm hover:bg-green-950 transition-colors"
            >
              CONNECT WALLET
            </button>
          ) : (
            <div
              style={{
                backgroundColor: "#0a1a0a",
                border: "1px solid rgba(0,255,65,0.3)",
              }}
              className="flex items-center gap-2 px-3 py-2 rounded"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                alt="MetaMask"
                className="w-5 h-5"
              />
              <span style={{ color: "var(--rpepe-green)", fontFamily: "var(--font-pixel)" }} className="text-xs">
                {MOCK_WALLET.address}
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <div
          style={{
            display: "inline-block",
            backgroundColor: "rgba(0,255,65,0.08)",
            border: "1px solid rgba(0,255,65,0.25)",
            color: "var(--rpepe-green)",
            fontFamily: "var(--font-pixel)",
            letterSpacing: "0.1em",
          }}
          className="px-4 py-1.5 rounded text-sm mb-5"
        >
          $RPEPE SELF-CUSTODY STAKING
        </div>

        <h1
          style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
          className="text-6xl md:text-7xl xl:text-8xl leading-none mb-4"
        >
          HOLD.{" "}
          <span style={{ color: "var(--rpepe-green)" }}>EARN.</span>
          <br />
          REPEAT.
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Keep your <strong className="text-white">$RPEPE</strong> in your own wallet.
          Register for tracking. Earn points passively. Hit the threshold — get a free Pixie NFT.
        </p>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">

        {!connected ? (
          /* ── DISCONNECTED STATE ── */
          <div className="max-w-xl mx-auto text-center py-16">
            <div
              style={{
                backgroundColor: "#0a0a0a",
                border: "1px solid #111",
              }}
              className="rounded-3xl p-12"
            >
              <div
                style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }}
                className="text-4xl mb-6"
              >
                🐸
              </div>
              <p
                style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }}
                className="text-lg mb-2"
              >
                CONNECT YOUR WALLET
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Connect your wallet to view your staking status, $RPEPE balance, and progress toward your next free Pixie.
              </p>
              <button
                onClick={() => setConnected(true)}
                style={{
                  backgroundColor: "var(--rpepe-green)",
                  color: "#000",
                  fontFamily: "var(--font-pixel)",
                }}
                className="w-full py-4 rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
              >
                CONNECT WALLET
              </button>
              <p className="text-xs text-gray-600 mt-4">
                No lockup. Your tokens stay in your wallet.
              </p>
            </div>
          </div>
        ) : (
          /* ── CONNECTED STATE ── */
          <div className="space-y-6">

            {/* Register Banner */}
            {!registered && (
              <div
                style={{
                  backgroundColor: "rgba(0,255,65,0.06)",
                  border: "1px solid rgba(0,255,65,0.3)",
                }}
                className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div>
                  <p
                    style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }}
                    className="text-sm mb-1"
                  >
                    WALLET NOT REGISTERED YET
                  </p>
                  <p className="text-gray-500 text-sm">
                    Register your wallet to start earning staking points toward free Pixies.
                  </p>
                </div>
                <button
                  onClick={() => setRegistered(true)}
                  style={{
                    border: "2px solid var(--rpepe-green)",
                    color: "var(--rpepe-green)",
                    fontFamily: "var(--font-pixel)",
                    backgroundColor: "transparent",
                    whiteSpace: "nowrap",
                  }}
                  className="px-5 py-2.5 rounded-lg text-sm hover:bg-green-950 transition-colors green-glow"
                >
                  REGISTER FOR TRACKING
                </button>
              </div>
            )}

            {registered && (
              <div
                style={{
                  backgroundColor: "rgba(0,255,65,0.06)",
                  border: "1px solid rgba(0,255,65,0.3)",
                }}
                className="rounded-2xl p-4 flex items-center gap-3"
              >
                <span style={{ color: "var(--rpepe-green)" }} className="text-xl">✓</span>
                <p style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }} className="text-sm">
                  WALLET REGISTERED — EARNING POINTS
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Wallet Status",
                  value: "✓ Connected",
                  sub: MOCK_WALLET.address,
                  highlight: false,
                  green: true,
                },
                {
                  label: "$RPEPE Balance",
                  value: MOCK_WALLET.rpepeBalance,
                  sub: "tokens held",
                  highlight: true,
                  green: false,
                },
                {
                  label: "Pixie NFTs",
                  value: String(MOCK_WALLET.pixieNFTs),
                  sub: "owned",
                  highlight: false,
                  green: false,
                },
                {
                  label: "Earning",
                  value: `${MOCK_WALLET.pointsPerDay}`,
                  sub: `pts/day (cap: ${MOCK_WALLET.baseCap}/day)`,
                  highlight: false,
                  green: true,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    backgroundColor: "#0a0a0a",
                    border: `1px solid ${stat.green ? "rgba(0,255,65,0.2)" : "#111"}`,
                  }}
                  className="p-5 rounded-2xl"
                >
                  <p
                    style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)", opacity: 0.6 }}
                    className="text-xs mb-2"
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-pixel)",
                      color: stat.highlight
                        ? "var(--rpepe-red)"
                        : stat.green
                        ? "var(--rpepe-green)"
                        : "#fff",
                      wordBreak: "break-all",
                    }}
                    className="text-xl mb-1 leading-tight"
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Progress Card */}
            <div
              style={{
                backgroundColor: "#0a0a0a",
                border: "1px solid rgba(0,255,65,0.15)",
              }}
              className="rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p
                    style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }}
                    className="text-sm mb-1"
                  >
                    PROGRESS TOWARD NEXT NFT
                  </p>
                  <p className="text-gray-500 text-sm">
                    Time until next Pixie:{" "}
                    <span style={{ color: "var(--rpepe-red)" }} className="font-bold">
                      {MOCK_WALLET.timeUntilNFT} days
                    </span>
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: "rgba(0,255,65,0.1)",
                    border: "1px solid rgba(0,255,65,0.3)",
                    color: "var(--rpepe-green)",
                    fontFamily: "var(--font-pixel)",
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm"
                >
                  {MOCK_WALLET.progress}%
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  backgroundColor: "#111",
                  borderRadius: "4px",
                  height: "28px",
                  overflow: "hidden",
                  border: "1px solid #1a1a1a",
                }}
                className="relative"
              >
                <div
                  style={{
                    width: `${MOCK_WALLET.progress}%`,
                    backgroundColor: "var(--rpepe-green)",
                    height: "100%",
                    borderRadius: "4px",
                    boxShadow: "0 0 16px rgba(0,255,65,0.6)",
                    transition: "width 1s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-pixel)",
                      color: "#000",
                      fontSize: "12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {MOCK_WALLET.progress}%
                  </span>
                </div>
              </div>

              {MOCK_WALLET.alreadyReceived && (
                <p
                  style={{ color: "var(--rpepe-green)", fontFamily: "var(--font-pixel)" }}
                  className="text-sm mt-4"
                >
                  ✓ This wallet has already received a free Pixie via $RPEPE staking!
                </p>
              )}
            </div>

            {/* Warning */}
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid #181818",
              }}
              className="rounded-2xl p-5"
            >
              <p
                style={{ fontFamily: "var(--font-pixel)", color: "rgba(0,255,65,0.5)" }}
                className="text-xs leading-relaxed text-center"
              >
                ⚠ Once registered, removal of $RPEPE or NFTs from this wallet will reset your earnings.
                Self-custody staking that allows the earning of another Red Pepe Pixie by the loyal $RPEPE and NFT hodler.
              </p>
            </div>
          </div>
        )}

        {/* ── HOW IT WORKS ────────────────────────────────────── */}
        <div className="mt-20">
          <p
            style={{ color: "var(--rpepe-green)", fontFamily: "var(--font-pixel)" }}
            className="text-center text-sm mb-4 opacity-70"
          >
            HOW DOES IT WORK?
          </p>
          <h2
            style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
            className="text-center text-5xl md:text-6xl mb-12"
          >
            THE{" "}
            <span style={{ color: "var(--rpepe-green)" }}>STAKING</span>{" "}
            SYSTEM
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "HOLD $RPEPE",
                desc: "Keep $RPEPE tokens in your wallet. The more you hold, the more points you earn per day — up to the daily cap.",
                icon: "💰",
              },
              {
                step: "02",
                title: "REGISTER WALLET",
                desc: "Register your wallet address on this page. This activates daily point tracking without moving your tokens.",
                icon: "📋",
              },
              {
                step: "03",
                title: "EARN FREE PIXIES",
                desc: "Once you hit the threshold, a free Pixie NFT is sent to your wallet. Keep holding and earn another one.",
                icon: "🐸",
              },
            ].map((step) => (
              <div
                key={step.step}
                style={{
                  backgroundColor: "#0a0a0a",
                  border: "1px solid rgba(0,255,65,0.1)",
                }}
                className="p-7 rounded-2xl hover:border-green-800 transition-colors"
              >
                <div
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "rgba(0,255,65,0.15)",
                    fontSize: "4rem",
                    lineHeight: 1,
                  }}
                  className="mb-4 select-none"
                >
                  {step.step}
                </div>
                <div className="text-2xl mb-3">{step.icon}</div>
                <h3
                  style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }}
                  className="text-base mb-3"
                >
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BACK TO MINT CTA ─────────────────────────────── */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4 text-sm">
            Don&apos;t have a Pixie yet?
          </p>
          <Link
            href="/"
            style={{
              border: "1px solid rgba(232,53,58,0.5)",
              color: "var(--rpepe-red)",
            }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base hover:bg-red-950 transition-colors"
          >
            ← MINT A PIXIE
          </Link>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid #0d1a0d",
          backgroundColor: "#050505",
          position: "relative",
          zIndex: 10,
        }}
        className="py-10"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="https://www.redpepe.meme/red_pepe_mini_logo.png"
              alt="Red Pepe"
              className="w-5 h-5"
            />
            <span
              style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.05em", color: "var(--rpepe-red)" }}
              className="text-base"
            >
              RED PEPE PIXIES
            </span>
          </div>
          <p className="text-xs text-gray-700 max-w-lg mx-auto">
            $RPEPE is a meme token with no intrinsic value. Self-custody staking is experimental. Always do your own research.
          </p>
        </div>
      </footer>
    </div>
  );
}
