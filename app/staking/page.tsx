"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAddress, ConnectWallet } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import pixiesAbi from "../../abi/pixies.json";
import erc20Abi from "../../abi/redpepe.json";

const rpepeTokenAddress = (process.env.NEXT_PUBLIC_RPEPE_TOKEN_ADDRESS || "").trim();
const rpc               = (process.env.NEXT_PUBLIC_AVAX_RPC || "").trim();
const nftContractAddr   = (process.env.NEXT_PUBLIC_PIXIES_CONTRACT_ADDRESS || "").trim();

const TARGET_POINTS   = 6942;
const SECONDS_PER_DAY = 86400;
const RATE_PER_RPEPE  = 0.0003333;
const MAX_DAILY_BASE  = 234.1;
const NFT_BONUS_PER   = 0.005;
const NFT_BONUS_CAP   = 50;

export default function StakingPage() {
  const address = useAddress();

  // On-chain data
  const [balance, setBalance]         = useState(0);
  const [nfts, setNfts]               = useState(0);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [isBaseCapped, setIsBaseCapped] = useState(false);
  const [boostPct, setBoostPct]       = useState<string>("0");

  // Server staking status
  const [status, setStatus] = useState({
    eligible: false,
    claimed: false,
    claimedTx: null as string | null,
    claimedTokenIds: null as string | null,
  });
  const [serverPoints, setServerPoints]   = useState(0);
  const [lastUpdateIso, setLastUpdateIso] = useState<string | null>(null);

  // Live progress
  const [livePoints, setLivePoints] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI state
  const [registering, setRegistering]   = useState(false);
  const [redeeming, setRedeeming]       = useState(false);
  const [mintSuccess, setMintSuccess]   = useState<string | null>(null);

  // ── Fetch on-chain snapshot ─────────────────────────────
  useEffect(() => {
    const run = async () => {
      if (!address || !rpc || !rpepeTokenAddress || !nftContractAddr) return;
      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const rpepe    = new ethers.Contract(rpepeTokenAddress, erc20Abi as ethers.ContractInterface, provider);
      const nft      = new ethers.Contract(nftContractAddr,   pixiesAbi as ethers.ContractInterface, provider);

      try {
        const raw = await rpepe.balanceOf(address);
        const bal = parseFloat(ethers.utils.formatUnits(raw, 18));
        setBalance(bal);

        const count = await nft.balanceOf(address);
        const n     = count.toNumber();
        setNfts(n);

        const baseUncapped = bal * RATE_PER_RPEPE;
        const baseCapped   = Math.min(baseUncapped, MAX_DAILY_BASE);
        const boostFactor  = 1 + NFT_BONUS_PER * Math.min(n, NFT_BONUS_CAP);
        const daily        = baseCapped * boostFactor;

        setDailyPoints(daily);
        setIsBaseCapped(baseUncapped > MAX_DAILY_BASE);
        setBoostPct(((boostFactor - 1) * 100).toFixed(0));
      } catch (e) {
        console.error("fetch chain snapshot error", e);
      }
    };
    run();
  }, [address]);

  // ── Pull server status ──────────────────────────────────
  useEffect(() => {
    const run = async () => {
      if (!address) return;
      try {
        const sRes = await fetch(`/api/status?address=${address}`);
        const s    = await sRes.json();
        if (s?.success) {
          setStatus({
            eligible:        !!s.eligible,
            claimed:         !!s.claimed,
            claimedTx:       s.tx       || null,
            claimedTokenIds: s.tokenIds || null,
          });
          setServerPoints(Number(s.points_rpepe || 0));
          setLastUpdateIso(s.last_update || null);
        }
      } catch (e) {
        console.error("status error", e);
      }
    };
    run();
  }, [address]);

  // ── Live accumulator ────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (!lastUpdateIso && serverPoints === 0) { setLivePoints(0); return; }

    const lastUpdate = lastUpdateIso ? new Date(lastUpdateIso).getTime() : Date.now();
    const tick = () => {
      const elapsed = Math.max(0, (Date.now() - lastUpdate) / 1000);
      const accrued = (dailyPoints * elapsed) / SECONDS_PER_DAY;
      setLivePoints(Math.min(TARGET_POINTS, serverPoints + accrued));
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [dailyPoints, serverPoints, lastUpdateIso]);

  const earnedPercent = useMemo(
    () => Math.min(100, (livePoints / TARGET_POINTS) * 100) || 0,
    [livePoints]
  );
  const progressMultiplier = Number(process.env.NEXT_PUBLIC_PROGRESS_MULTIPLIER || "1");
  const earnedPercentBoosted = Math.min(100, earnedPercent * progressMultiplier);

  const daysRemaining = useMemo(() => {
    if (dailyPoints <= 0) return "∞";
    const remaining = Math.max(0, TARGET_POINTS - livePoints);
    return (remaining / dailyPoints).toFixed(1);
  }, [dailyPoints, livePoints]);

  const pointsPerDayText = useMemo(() => (dailyPoints || 0).toFixed(2), [dailyPoints]);

  // Derived: whether this wallet is being tracked
  const hasRegistered = serverPoints > 0 || status.eligible || status.claimed;

  // ── Handlers ───────────────────────────────────────────
  const handleRegister = async () => {
    if (!address) return;
    try {
      setRegistering(true);
      const res  = await fetch("/api/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Registered! Your staking progress has been saved.");
        setServerPoints((p) => p || 0.001); // nudge so hasRegistered becomes true
      } else {
        alert("Registration failed: " + data.error);
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  const handleRedeem = async () => {
    if (!address) return;
    try {
      setRedeeming(true);
      const cRes = await fetch("/api/claim", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ address }),
      });
      const c = await cRes.json();
      if (c.success) {
        setMintSuccess((c.tokenIds || []).join(", "));
        setStatus((prev) => ({
          ...prev,
          eligible:        true,
          claimed:         true,
          claimedTx:       c.tx,
          claimedTokenIds: (c.tokenIds || []).join(","),
        }));
        alert("Congratulations! You've minted your Pixie NFT 🎉");
      } else {
        const msg = /already/i.test(c?.error || "")
          ? "This wallet has already redeemed its NFT."
          : (c?.error || "Claim failed");
        alert(msg);
      }
    } catch (_e) {
      alert("Claim failed");
    } finally {
      setRedeeming(false);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

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
          {address ? (
            <div
              style={{ backgroundColor: "#0a1a0a", border: "1px solid rgba(0,255,65,0.3)" }}
              className="flex items-center gap-2 px-3 py-2 rounded"
            >
              <span
                style={{ color: "var(--rpepe-green)", fontFamily: "var(--font-pixel)" }}
                className="text-xs"
              >
                {shortAddress}
              </span>
            </div>
          ) : (
            <ConnectWallet />
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

        {!address ? (
          /* ── DISCONNECTED STATE ── */
          <div className="max-w-xl mx-auto text-center py-16">
            <div
              style={{ backgroundColor: "#0a0a0a", border: "1px solid #111" }}
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
                Connect your wallet to view your staking status, $RPEPE balance, and
                progress toward your next free Pixie.
              </p>
              <div className="flex justify-center">
                <ConnectWallet />
              </div>
              <p className="text-xs text-gray-600 mt-4">No lockup. Your tokens stay in your wallet.</p>
            </div>
          </div>
        ) : (
          /* ── CONNECTED STATE ── */
          <div className="space-y-6">

            {/* Register Banner */}
            {!hasRegistered && (
              <div
                style={{ backgroundColor: "rgba(0,255,65,0.06)", border: "1px solid rgba(0,255,65,0.3)" }}
                className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div>
                  <p style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }} className="text-sm mb-1">
                    WALLET NOT REGISTERED YET
                  </p>
                  <p className="text-gray-500 text-sm">
                    Register your wallet to start earning staking points toward free Pixies.
                  </p>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  style={{
                    border: "2px solid var(--rpepe-green)",
                    color: "var(--rpepe-green)",
                    fontFamily: "var(--font-pixel)",
                    backgroundColor: "transparent",
                    whiteSpace: "nowrap",
                  }}
                  className="px-5 py-2.5 rounded-lg text-sm hover:bg-green-950 transition-colors green-glow disabled:opacity-50"
                >
                  {registering ? "REGISTERING…" : "REGISTER FOR TRACKING"}
                </button>
              </div>
            )}

            {hasRegistered && (
              <div
                style={{ backgroundColor: "rgba(0,255,65,0.06)", border: "1px solid rgba(0,255,65,0.3)" }}
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
                  sub: shortAddress,
                  highlight: false,
                  green: true,
                },
                {
                  label: "$RPEPE Balance",
                  value: balance.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                  sub: "tokens held",
                  highlight: true,
                  green: false,
                },
                {
                  label: "Pixie NFTs",
                  value: String(nfts),
                  sub: "owned",
                  highlight: false,
                  green: false,
                },
                {
                  label: "Earning",
                  value: pointsPerDayText,
                  sub: `pts/day (cap: ${MAX_DAILY_BASE}/day)${Number(boostPct) > 0 ? ` +${boostPct}% NFT boost` : ""}`,
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
                      color: stat.highlight ? "var(--rpepe-red)" : stat.green ? "var(--rpepe-green)" : "#fff",
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
              style={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(0,255,65,0.15)" }}
              className="rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }} className="text-sm mb-1">
                    PROGRESS TOWARD NEXT NFT
                  </p>
                  <p className="text-gray-500 text-sm">
                    Time until next Pixie:{" "}
                    <span style={{ color: "var(--rpepe-red)" }} className="font-bold">
                      {daysRemaining} days
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
                  {earnedPercentBoosted.toFixed(1)}%
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
                    width: `${earnedPercentBoosted}%`,
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
                    {earnedPercentBoosted.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Claimed indicator */}
              {status.claimed && (
                <p
                  style={{ color: "var(--rpepe-green)", fontFamily: "var(--font-pixel)" }}
                  className="text-sm mt-4"
                >
                  ✓ This wallet has already received a free Pixie via $RPEPE staking!
                </p>
              )}

              {/* Redeem button */}
              {!status.claimed && status.eligible && (
                <div className="mt-5">
                  <p className="text-sm text-gray-400 mb-3">
                    🎉 You&apos;re eligible for a free Pixie — claim it now!
                  </p>
                  <button
                    onClick={handleRedeem}
                    disabled={redeeming}
                    style={{
                      backgroundColor: "var(--rpepe-green)",
                      color: "#000",
                      fontFamily: "var(--font-pixel)",
                    }}
                    className="px-6 py-3 rounded-lg font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {redeeming ? "REDEEMING…" : "REDEEM FREE NFT"}
                  </button>
                </div>
              )}
            </div>

            {/* Warning */}
            <div
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid #181818" }}
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
                style={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(0,255,65,0.1)" }}
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
                <h3 style={{ fontFamily: "var(--font-pixel)", color: "var(--rpepe-green)" }} className="text-base mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BACK TO MINT CTA ─────────────────────────────── */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4 text-sm">Don&apos;t have a Pixie yet?</p>
          <Link
            href="/"
            style={{ border: "1px solid rgba(232,53,58,0.5)", color: "var(--rpepe-red)" }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base hover:bg-red-950 transition-colors"
          >
            ← MINT A PIXIE
          </Link>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer
        style={{ borderTop: "1px solid #0d1a0d", backgroundColor: "#050505", position: "relative", zIndex: 10 }}
        className="py-10"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="https://www.redpepe.meme/red_pepe_mini_logo.png" alt="Red Pepe" className="w-5 h-5" />
            <span
              style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.05em", color: "var(--rpepe-red)" }}
              className="text-base"
            >
              RED PEPE PIXIES
            </span>
          </div>
          <p className="text-xs text-gray-700 max-w-lg mx-auto">
            $RPEPE is a meme token with no intrinsic value. Self-custody staking is experimental.
            Always do your own research.
          </p>
        </div>
      </footer>

      {/* ── MINT SUCCESS MODAL ──────────────────────────────── */}
      {mintSuccess && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9998 }}
            onClick={() => setMintSuccess(null)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: "#0a1a0a",
              border: "2px solid var(--rpepe-green)",
              padding: "2rem",
              zIndex: 9999,
              textAlign: "center",
              fontFamily: "var(--font-pixel)",
              color: "var(--rpepe-green)",
              width: "92%",
              maxWidth: "420px",
              borderRadius: "12px",
            }}
          >
            <p className="text-2xl mb-3">🎉 CONGRATULATIONS!</p>
            <p className="text-base mb-2">Thank you for hodling $RPEPE!</p>
            <p className="text-sm mb-5">
              Red Pepe Pixie #{mintSuccess} has been minted to your wallet!
            </p>
            <button
              onClick={() => setMintSuccess(null)}
              style={{ backgroundColor: "var(--rpepe-green)", color: "#000", fontFamily: "var(--font-pixel)" }}
              className="px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity"
            >
              CLOSE
            </button>
          </div>
        </>
      )}
    </div>
  );
}
