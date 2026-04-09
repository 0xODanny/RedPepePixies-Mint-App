"use client";

import Link from "next/link";
import { useState } from "react";

const CONTRACT_ADDRESS = "0x694207A9f708355Ee3119F11E55bc5c0B1845Ba2";

const TICKER_TEXT =
  "RED PEPE PIXIES • MINT ON AVALANCHE • 1.33 AVAX EACH • EARN MORE BY STAKING $RPEPE • OG NFT SINCE 2023 • HOLD. STAKE. EARN. • RED PEPE PIXIES • MINT ON AVALANCHE • 1.33 AVAX EACH • EARN MORE BY STAKING $RPEPE • OG NFT SINCE 2023 • HOLD. STAKE. EARN. • ";

export default function Home() {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  function copyContract() {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{ backgroundColor: "var(--rpepe-dark)", color: "#fff" }}
      className="min-h-screen font-[var(--font-geist-sans)]"
    >
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav
        style={{
          backgroundColor: "rgba(8,8,8,0.95)",
          borderBottom: "1px solid var(--rpepe-border)",
          backdropFilter: "blur(12px)",
        }}
        className="sticky top-0 z-50 w-full"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

          {/* Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#about"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="#how-to-mint"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              How to Mint
            </Link>
            <Link
              href="/staking"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Staking
            </Link>
            <Link
              href="https://t.me/redpepeavax1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Community
            </Link>
          </div>

          {/* CTA */}
          <a
            href="https://www.redpepemint.xyz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: "var(--rpepe-red)" }}
            className="px-4 py-2 rounded text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            MINT NOW
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-8 md:pt-28 md:pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left – copy */}
          <div className="flex-1 text-center lg:text-left">
            <span
              style={{
                backgroundColor: "rgba(232,53,58,0.15)",
                border: "1px solid rgba(232,53,58,0.4)",
                color: "var(--rpepe-red)",
              }}
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest mb-6"
            >
              AVALANCHE C-CHAIN
            </span>

            <h1
              style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
              className="text-6xl md:text-7xl xl:text-8xl leading-none mb-6"
            >
              RED PEPE
              <br />
              <span style={{ color: "var(--rpepe-red)" }}>PIXIES</span>
            </h1>

            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto lg:mx-0">
              The OG NFT collection of the Red Pepe swamp. Mint a Pixie, stake
              your <strong className="text-white">$RPEPE</strong>, and earn more
              for free — no wallet lockup required.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-8 justify-center lg:justify-start mb-10">
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-bangers)",
                    color: "var(--rpepe-red)",
                    letterSpacing: "0.03em",
                  }}
                  className="text-3xl"
                >
                  1.33
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">
                  AVAX / Pixie
                </div>
              </div>
              <div
                style={{ width: "1px", height: "36px", backgroundColor: "var(--rpepe-border)" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-bangers)",
                    color: "var(--rpepe-red)",
                    letterSpacing: "0.03em",
                  }}
                  className="text-3xl"
                >
                  1:1
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">
                  Classic & Rare
                </div>
              </div>
              <div
                style={{ width: "1px", height: "36px", backgroundColor: "var(--rpepe-border)" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-bangers)",
                    color: "var(--rpepe-red)",
                    letterSpacing: "0.03em",
                  }}
                  className="text-3xl"
                >
                  AVAX
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">
                  Network
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="https://www.redpepemint.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: "var(--rpepe-red)" }}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded font-bold text-white text-base hover:opacity-90 transition-opacity"
              >
                MINT A PIXIE
              </a>
              <Link
                href="/staking"
                style={{
                  border: "1px solid rgba(232,53,58,0.5)",
                  color: "var(--rpepe-red)",
                }}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded font-bold text-base hover:bg-red-950 transition-colors"
              >
                🎮 STAKE TO EARN
              </Link>
            </div>
          </div>

          {/* Right – Mint widget */}
          <div className="flex-shrink-0 w-full max-w-sm">
            <div
              style={{
                backgroundColor: "var(--rpepe-card)",
                border: "1px solid var(--rpepe-border)",
              }}
              className="rounded-2xl overflow-hidden pixel-glow"
            >
              {/* Widget header */}
              <div
                style={{ backgroundColor: "#0f0f0f", borderBottom: "1px solid var(--rpepe-border)" }}
                className="px-5 py-3 flex items-center justify-between"
              >
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  Live Mint
                </span>
                <span
                  style={{ color: "var(--rpepe-red)" }}
                  className="text-xs font-semibold"
                >
                  ● Avalanche
                </span>
              </div>

              {/* NFT preview */}
              <div className="p-5 pb-0">
                <img
                  src="https://www.redpepemint.xyz/pixies-preview.png"
                  alt="Red Pepe Pixies NFT"
                  className="w-full rounded-xl object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              {/* Widget body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Price per Pixie</span>
                  <span className="font-bold text-white text-lg">1.33 AVAX</span>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid var(--rpepe-border)",
                      }}
                      className="w-8 h-8 rounded flex items-center justify-center text-white hover:border-red-700 transition-colors font-bold"
                    >
                      −
                    </button>
                    <span className="text-white font-bold w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid var(--rpepe-border)",
                      }}
                      className="w-8 h-8 rounded flex items-center justify-center text-white hover:border-red-700 transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span style={{ color: "var(--rpepe-red)" }} className="font-bold text-xl">
                    {(quantity * 1.33).toFixed(2)} AVAX
                  </span>
                </div>

                <a
                  href="https://www.redpepemint.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: "var(--rpepe-red)" }}
                  className="block w-full text-center py-3.5 rounded-lg font-bold text-white text-base hover:opacity-90 transition-opacity"
                >
                  MINT NOW →
                </a>

                <p className="text-center text-xs text-gray-600">
                  Connect wallet on{" "}
                  <a
                    href="https://www.redpepemint.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 underline hover:text-white"
                  >
                    redpepemint.xyz
                  </a>
                </p>
              </div>
            </div>

            {/* Telegram nudge */}
            <a
              href="https://t.me/redpepeavax1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "rgba(232,53,58,0.08)",
                border: "1px solid rgba(232,53,58,0.2)",
              }}
              className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
            >
              💬 Chat in Telegram while you mint
            </a>
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ──────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--rpepe-red)",
          borderTop: "1px solid #ff4444",
          borderBottom: "1px solid #bb2222",
          overflow: "hidden",
        }}
        className="py-3 my-10"
      >
        <div className="flex whitespace-nowrap animate-marquee">
          <span
            style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.08em" }}
            className="text-white text-base"
          >
            {TICKER_TEXT}{TICKER_TEXT}
          </span>
        </div>
      </div>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Pepe character */}
          <div className="flex-shrink-0 relative">
            <img
              src="https://www.redpepe.meme/red_pepe_chibi_style.png"
              alt="Red Pepe holding diamond hands"
              className="w-64 h-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <p
              style={{ color: "var(--rpepe-red)" }}
              className="text-sm font-semibold uppercase tracking-widest mb-3"
            >
              WTF IS A RED PEPE PIXIE?
            </p>
            <h2
              style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
              className="text-5xl md:text-6xl leading-none mb-6"
            >
              THE SWAMP&apos;S OWN{" "}
              <span style={{ color: "var(--rpepe-red)" }}>NFT</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl">
              Red Pepe Pixies are the official NFT collection of the $RPEPE
              ecosystem on Avalanche. Each Pixie is a pixel-art frog with a
              unique look — and every single one earns you more through
              self-custody staking.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: "🐸",
                  title: "Pixel-Perfect Frogs",
                  desc: "Hand-crafted pixel art. Each Pixie is unique, rare, and unmistakably Red Pepe.",
                },
                {
                  icon: "🏆",
                  title: "Earn by Holding",
                  desc: "Stack $RPEPE, hold Pixies, and the staking system sends you more NFTs — no lockup.",
                },
                {
                  icon: "⚡",
                  title: "Avalanche Native",
                  desc: "Lightning-fast, near-zero fees on Avalanche C-Chain. Mint in seconds, not hours.",
                },
                {
                  icon: "💎",
                  title: "HODL Culture",
                  desc: "No VCs, no insiders. Just diamond-handed frogs building the swamp together.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  style={{
                    backgroundColor: "var(--rpepe-card)",
                    border: "1px solid var(--rpepe-border)",
                  }}
                  className="p-5 rounded-xl hover:border-red-800 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src="https://www.redpepe.meme/red_pepe_mini_logo.png"
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                    <h3 className="font-bold text-white text-sm">{f.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TOKENOMICS / STATS ─────────────────────────────── */}
      <section
        style={{ backgroundColor: "#0c0c0c" }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <p
            style={{ color: "var(--rpepe-red)" }}
            className="text-center text-sm font-semibold uppercase tracking-widest mb-3"
          >
            THE NUMBERS
          </p>
          <h2
            style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
            className="text-center text-5xl md:text-6xl mb-12"
          >
            PIXIE<span style={{ color: "var(--rpepe-red)" }}>NOMICS</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Mint Price", value: "1.33 AVAX", sub: "Per Pixie" },
              { label: "Editions", value: "1:1", sub: "Classic & Rare" },
              { label: "Network", value: "AVAX", sub: "C-Chain" },
              { label: "Staking", value: "FREE", sub: "Hold $RPEPE to earn" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  backgroundColor: "var(--rpepe-card)",
                  border: "1px solid var(--rpepe-border)",
                }}
                className="p-6 rounded-2xl text-center"
              >
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-bangers)",
                    letterSpacing: "0.04em",
                    color: "var(--rpepe-red)",
                  }}
                  className="text-4xl mb-1"
                >
                  {s.value}
                </p>
                <p className="text-xs text-gray-500">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Contract */}
          <div
            style={{
              backgroundColor: "var(--rpepe-card)",
              border: "1px solid var(--rpepe-border)",
            }}
            className="max-w-2xl mx-auto rounded-2xl p-6 text-center"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              $RPEPE Contract Address
            </p>
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <code className="text-sm text-gray-300 break-all">
                {CONTRACT_ADDRESS}
              </code>
              <button
                onClick={copyContract}
                style={{ backgroundColor: "rgba(232,53,58,0.15)", border: "1px solid rgba(232,53,58,0.3)", color: "var(--rpepe-red)" }}
                className="px-3 py-1 rounded text-xs font-semibold hover:bg-red-900 transition-colors flex-shrink-0"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <a
              href="https://snowtrace.io/address/0x694207A9f708355Ee3119F11E55bc5c0B1845Ba2"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
            >
              View on Snowtrace ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW TO MINT ─────────────────────────────────────── */}
      <section id="how-to-mint" className="max-w-7xl mx-auto px-6 py-20">
        <p
          style={{ color: "var(--rpepe-red)" }}
          className="text-center text-sm font-semibold uppercase tracking-widest mb-3"
        >
          3 EASY STEPS
        </p>
        <h2
          style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
          className="text-center text-5xl md:text-6xl mb-16"
        >
          HOW TO MINT A{" "}
          <span style={{ color: "var(--rpepe-red)" }}>PIXIE</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Get a Wallet",
              desc: "Download MetaMask or Core Wallet. Add the Avalanche C-Chain network. This is your gateway to the swamp.",
            },
            {
              step: "02",
              title: "Get Some AVAX",
              desc: "Buy AVAX from Coinbase, Binance, or any exchange. Each Pixie costs 1.33 AVAX. Send it to your wallet.",
            },
            {
              step: "03",
              title: "Mint Your Pixie",
              desc: 'Head to redpepemint.xyz, connect your wallet, pick a quantity, and hit "Mint Now". Welcome to the swamp!',
            },
          ].map((step, i) => (
            <div
              key={step.step}
              style={{
                backgroundColor: "var(--rpepe-card)",
                border: "1px solid var(--rpepe-border)",
              }}
              className="relative p-8 rounded-2xl hover:border-red-800 transition-colors group"
            >
              <div
                style={{
                  fontFamily: "var(--font-bangers)",
                  letterSpacing: "0.06em",
                  color: "rgba(232,53,58,0.12)",
                  fontSize: "6rem",
                  lineHeight: 1,
                }}
                className="absolute top-4 right-6 select-none"
              >
                {step.step}
              </div>
              <div
                style={{ color: "var(--rpepe-red)" }}
                className="text-xs font-semibold uppercase tracking-widest mb-4"
              >
                Step {i + 1}
              </div>
              <h3
                style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
                className="text-2xl mb-3 text-white"
              >
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.redpepemint.xyz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: "var(--rpepe-red)" }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-opacity"
          >
            MINT ON REDPEPEMINT.XYZ →
          </a>
        </div>
      </section>

      {/* ── STAKING CTA ─────────────────────────────────────── */}
      <section
        style={{ backgroundColor: "#0c0c0c" }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            style={{
              border: "1px solid var(--rpepe-border)",
              backgroundColor: "var(--rpepe-card)",
            }}
            className="rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-10"
          >
            <div className="flex-1 text-center md:text-left">
              <p
                style={{ color: "var(--rpepe-red)" }}
                className="text-sm font-semibold uppercase tracking-widest mb-3"
              >
                EARN FOR FREE
              </p>
              <h2
                style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
                className="text-5xl md:text-6xl mb-4"
              >
                STAKE &amp; EARN
                <br />
                <span style={{ color: "var(--rpepe-red)" }}>MORE PIXIES</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md">
                Just hold <strong className="text-white">$RPEPE</strong> in your
                wallet and register. Earn points every day — hit the threshold
                and receive a free Pixie NFT. No lockup. Self-custody.
              </p>
              <Link
                href="/staking"
                style={{ backgroundColor: "var(--rpepe-red)" }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-base hover:opacity-90 transition-opacity"
              >
                GO TO STAKING →
              </Link>
            </div>
            <div className="flex-shrink-0">
              <img
                src="https://www.redpepe.meme/red_pepe_chibi_style_2.png"
                alt="Red Pepe to the moon"
                className="w-56 h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ────────────────────────────────────────── */}
      <section id="community" className="max-w-7xl mx-auto px-6 py-20">
        <p
          style={{ color: "var(--rpepe-red)" }}
          className="text-center text-sm font-semibold uppercase tracking-widest mb-3"
        >
          THE SWAMP FAM
        </p>
        <h2
          style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.04em" }}
          className="text-center text-5xl md:text-6xl mb-16"
        >
          JOIN THE{" "}
          <span style={{ color: "var(--rpepe-red)" }}>COMMUNITY</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "https://www.redpepe.meme/logo_x.png",
              name: "Twitter / X",
              desc: "Follow for memes, alpha, and swamp updates",
              url: "https://x.com/redpepeavax",
            },
            {
              icon: "https://www.redpepe.meme/logo_telegram.png",
              name: "Telegram",
              desc: "Join 24/7 degen chat with the swamp fam",
              url: "https://t.me/redpepeavax1",
            },
            {
              icon: "https://www.redpepe.meme/logo_dexcreener.png",
              name: "Dexscreener",
              desc: "Live chart, price, volume, and market data",
              url: "https://dexscreener.com/avalanche/0xf6006a20413bfd1c7a6216659859cf7fae0f3d5e",
            },
            {
              icon: "https://www.redpepe.meme/logo_medium.png",
              name: "Medium",
              desc: "Deep dives, news, and community updates",
              url: "https://medium.com/@redpepeavax",
            },
          ].map((c) => (
            <a
              key={c.name}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "var(--rpepe-card)",
                border: "1px solid var(--rpepe-border)",
              }}
              className="flex flex-col gap-3 p-6 rounded-2xl hover:border-red-800 transition-colors group"
            >
              <img
                src={c.icon}
                alt={c.name}
                className="w-8 h-8 object-contain"
              />
              <div>
                <div className="font-bold text-white text-sm group-hover:text-red-400 transition-colors">
                  {c.name} ↗
                </div>
                <div className="text-gray-500 text-xs mt-1">{c.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--rpepe-border)",
          backgroundColor: "#0c0c0c",
        }}
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="https://www.redpepe.meme/red_pepe_mini_logo.png"
                alt="Red Pepe"
                className="w-6 h-6"
              />
              <span
                style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.05em", color: "var(--rpepe-red)" }}
                className="text-lg"
              >
                RED PEPE PIXIES
              </span>
            </Link>

            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <a href="https://www.redpepe.meme" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                $RPEPE Token ↗
              </a>
              <Link href="/staking" className="hover:text-white transition-colors">
                Staking
              </Link>
              <a href="https://snowtrace.io/address/0x694207A9f708355Ee3119F11E55bc5c0B1845Ba2" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Snowtrace ↗
              </a>
              <a href="https://t.me/redpepeavax1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Telegram ↗
              </a>
              <a href="https://x.com/redpepeavax" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Twitter ↗
              </a>
            </div>
          </div>

          <div
            style={{ borderTop: "1px solid var(--rpepe-border)" }}
            className="pt-8 text-center"
          >
            <p className="text-xs text-gray-600 max-w-2xl mx-auto">
              $RPEPE is a meme token with no intrinsic value or expectation of
              financial return. It exists purely for entertainment and community
              building on the Avalanche blockchain. Always do your own research.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
