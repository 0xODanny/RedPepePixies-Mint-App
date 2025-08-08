// pages/staking.js
import Head from "next/head";
import { useAddress, ConnectWallet } from "@thirdweb-dev/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import pixiesAbi from "../../abi/pixies.json";
import erc20Abi from "../../abi/redpepe.json";

const rpepeTokenAddress = (process.env.NEXT_PUBLIC_RPEPE_TOKEN_ADDRESS || "").trim();
const rpc               = (process.env.NEXT_PUBLIC_AVAX_RPC || "").trim();
const nftContractAddr   = (process.env.NEXT_PUBLIC_PIXIES_CONTRACT_ADDRESS || "").trim();

const TARGET_POINTS = 6942;
const SECONDS_PER_DAY = 86400;

export default function StakingTracker() {
  const address = useAddress();

  // UI state
  const [typingDone, setTypingDone] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Wallet snapshot
  const [balance, setBalance] = useState(0);
  const [nfts, setNfts] = useState(0);
  const [dailyPoints, setDailyPoints] = useState(0);

  // Server staking status
  const [status, setStatus] = useState({
    eligible: false,
    claimed: false,
    claimedTx: null,
    claimedTokenIds: null,
  });
  const [serverPoints, setServerPoints] = useState(0);        // points_rpepe from DB
  const [lastUpdateIso, setLastUpdateIso] = useState(null);   // last_update from DB
  const [autoClaimed, setAutoClaimed] = useState(false);

  // Live progress (time-based)
  const [livePoints, setLivePoints] = useState(0);
  const timerRef = useRef(null);

  // Fetch on-chain snapshot (balance, nfts) → compute daily rate
  useEffect(() => {
    const run = async () => {
      if (!address || !rpc || !rpepeTokenAddress || !nftContractAddr) return;

      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const rpepe   = new ethers.Contract(rpepeTokenAddress, erc20Abi, provider);
      const nft     = new ethers.Contract(nftContractAddr,   pixiesAbi, provider);

      try {
        const raw = await rpepe.balanceOf(address);
        const bal = parseFloat(ethers.utils.formatUnits(raw, 18));
        setBalance(bal);

        const count = await nft.balanceOf(address);
        const n = count.toNumber();
        setNfts(n);

        const daily = bal * 0.0003333 * (1 + 0.01 * n);
        setDailyPoints(daily);

        // Stage UI
        setTimeout(() => setTypingDone(true), 800);
        // Reveal the progress bar a touch later so it appears last
        setTimeout(() => setShowProgress(true), 1200);
      } catch (e) {
        console.error("fetch chain snapshot error", e);
      }
    };
    run();
  }, [address]);

  // Pull server status (points so far + last update) and auto-claim if eligible
  useEffect(() => {
    const run = async () => {
      if (!address) return;
      try {
        const sRes = await fetch(`/api/status?address=${address}`);
        const s = await sRes.json();

        if (s?.success) {
          setStatus({
            eligible: !!s.eligible,
            claimed: !!s.claimed,
            claimedTx: s.tx || null,
            claimedTokenIds: s.tokenIds || null,
          });
          setServerPoints(Number(s.points_rpepe || 0));
          setLastUpdateIso(s.last_update || null);

          if (s.eligible && !s.claimed && !autoClaimed) {
            const cRes = await fetch("/api/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address }),
            });
            const c = await cRes.json();
            if (c.success) {
              setAutoClaimed(true);
              alert(`Free Pixie minted! Token IDs: ${c.tokenIds.join(", ")}`);
              setStatus((prev) => ({
                ...prev,
                eligible: true,
                claimed: true,
                claimedTx: c.tx,
                claimedTokenIds: c.tokenIds.join(","),
              }));
            } else {
              console.warn("Claim failed:", c.error);
            }
          }
        }
      } catch (e) {
        console.error("status error", e);
      }
    };
    run();
  }, [address, autoClaimed]);

  // Live accumulator: start/refresh interval whenever dailyPoints, serverPoints, lastUpdate change
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!lastUpdateIso && serverPoints === 0) {
      setLivePoints(0);
      return;
    }

    const lastUpdate = lastUpdateIso ? new Date(lastUpdateIso).getTime() : Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsedSec = Math.max(0, (now - lastUpdate) / 1000);
      const accrued = (dailyPoints * elapsedSec) / SECONDS_PER_DAY;
      const current = Math.min(TARGET_POINTS, serverPoints + accrued);
      setLivePoints(current);
    };

    // prime immediately so UI updates without 1s delay
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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

  const handleRegister = async () => {
    if (!address) return;
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Registered! Your staking progress has been saved.");
      } else {
        alert("Registration failed: " + data.error);
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Registration failed.");
    }
  };

  return (
    <>
      <Head>
        {/* Pixel font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
        <title>Staking — Red Pepe Pixies</title>
      </Head>

      <div className="crt min-h-screen bg-black flex justify-center items-start">
        <div className="w-full max-w-3xl px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <ConnectWallet />
            <button onClick={handleRegister} className="btn">Register Wallet for Tracking</button>
          </div>

          {!address ? (
            <p className="term">Connect your wallet to start staking tracking...</p>
          ) : (
            <div>
              {/* Title (typing effect only; no caret here) */}
              <h1 className="title typewriter">Staking Status for {address}</h1>

              {typingDone && (
                <div className="space-y-3">
                  <p className="term">
                    <span className="label">Wallet status:</span>{" "}
                    <span className="ok">✔ Wallet connected</span>
                  </p>

                  <p className="term">
                    <span className="label">$RPEPE Balance:</span>{" "}
                    <span className="num">{balance.toLocaleString()}</span>
                  </p>

                  <p className="term">
                    <span className="label">Pixie NFTs:</span>{" "}
                    <span className="num">{nfts}</span>
                  </p>

                  <p className="term">
                    <span className="label">Earning:</span>{" "}
                    <span className="num">{pointsPerDayText}</span>
                    <span className="unit"> points/day</span>
                  </p>

                  <p className="term">
                    <span className="label">Time until NFT:</span>{" "}
                    <span className="num">{daysRemaining}</span>
                    <span className="unit"> days</span>
                  </p>

                  {status.claimed && (
                    <p className="term note">
                      Thank you for staking. This wallet has already received a free Pixie via $RPEPE staking.
                    </p>
                  )}
                  {!status.claimed && status.eligible && (
                    <p className="term note">Eligible for a free Pixie — minting now…</p>
                  )}
                </div>
              )}

              {/* Progress bar appears last */}
              {showProgress && (
                <div className="progressWrap">
                  <div className="progressTrack">
                    <div className="progressFill" style={{ width: `${earnedPercentBoosted}%` }}>
  			<span className="progressText">{earnedPercentBoosted.toFixed(1)}%</span>
		    </div>
                  </div>
                  <p className="progressLabel">Progress toward next NFT</p>
                  <p className="notice">
                    Once registered for staking, removal of $RPEPE or NFTs from this wallet will reset your earnings.
                  </p>
                  <p className="notice">
                    Self-custody staking that allows the earning of another Red Pepe Pixie by the loyal $RPEPE and NFT hodler.
                  </p>
                  {/* Blinking cursor at the very bottom */}
                  <span className="caret" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(html, body) { background: #000; }

        .term, .title, .btn, .progressLabel, .notice {
          font-family: 'VT323', monospace;
          color: #00ff66;
          letter-spacing: 0.5px;
        }
        .title {
          font-size: 22px;
          margin: 8px 0 16px;
          overflow: hidden;
          display: inline-block;
        }
        .typewriter {
          animation: typing 1.3s steps(40, end);
          white-space: nowrap;
        }
        @keyframes typing { from { width: 0; } to { width: 100%; } }

        .label { color: #00ff66; }
        .num   { color: #ff3b30; }   /* red numbers */
        .unit  { color: #00ff66; opacity: 0.9; }
        .ok    { color: #00ff66; }
        .note  { margin-top: 8px; opacity: 0.95; }

        .btn {
          background: #111;
          border: 1px solid #2a2a2a;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn:hover { border-color: #00ff66; }

        /* Progress at the BOTTOM, compact width, shown last */
        .progressWrap { margin-top: 28px; }
        .progressTrack {
          width: 420px;
          max-width: 100%;
          height: 14px;
          background: #0a0a0a;
          border: 1px solid #1f1f1f;
          border-radius: 7px;
          overflow: hidden;
        }
        .progressFill {
          height: 100%;
          background: #00ff66;
          display: flex;
          align-items: center;
          justify-content: center; /* center % text */
          position: relative;
          transition: width 0.9s ease-in-out;
        }
        .progressText {
          color: #ff3b30; /* red % text */
          font-family: 'VT323', monospace;
          font-size: 12px;
          line-height: 1;
        }
        .progressLabel { margin-top: 6px; font-size: 14px; opacity: 0.9; }

        .notice {
          margin-top: 12px;
          font-size: 12px;
          color: #00ff66;
          opacity: 0.7;
          text-align: center;
        }

        /* Blinking caret at the bottom */
        .caret {
          display: inline-block;
          width: 8px;
          height: 18px;
          background-color: #00ff66;
          margin-left: 4px;
          animation: blink-caret 1s step-end infinite;
          vertical-align: bottom;
        }
        @keyframes blink-caret {
          from, to { background-color: transparent; }
          50%      { background-color: #00ff66; }
        }

        .crt { padding-top: 10px; }
      `}</style>
    </>
  );
}