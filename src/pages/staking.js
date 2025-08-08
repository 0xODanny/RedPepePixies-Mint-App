// pages/staking.js
import Head from "next/head";
import { useAddress, ConnectWallet } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import pixiesAbi from "../../abi/pixies.json";
import erc20Abi from "../../abi/redpepe.json";

const rpepeTokenAddress = (process.env.NEXT_PUBLIC_RPEPE_TOKEN_ADDRESS || "").trim();
const rpc = (process.env.NEXT_PUBLIC_AVAX_RPC || "").trim();
const nftContractAddress = (process.env.NEXT_PUBLIC_PIXIES_CONTRACT_ADDRESS || "").trim();

export default function StakingTracker() {
  const address = useAddress();

  const [typingDone, setTypingDone] = useState(false);
  const [points, setPoints] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [balance, setBalance] = useState(0);
  const [nfts, setNfts] = useState(0);

  const [status, setStatus] = useState({
    eligible: false,
    claimed: false,
    claimedTx: null,
    claimedTokenIds: null,
  });
  const [autoClaimed, setAutoClaimed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!address || !rpc || !rpepeTokenAddress || !nftContractAddress) return;

      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const rpepe = new ethers.Contract(rpepeTokenAddress, erc20Abi, provider);
      const nft = new ethers.Contract(nftContractAddress, pixiesAbi, provider);

      try {
        const rawBalance = await rpepe.balanceOf(address);
        const parsedBalance = parseFloat(ethers.utils.formatUnits(rawBalance, 18));
        setBalance(parsedBalance);

        const balanceCount = await nft.balanceOf(address);
        const nftCount = balanceCount.toNumber();
        setNfts(nftCount);

        const dailyPoints = parsedBalance * 0.0003333 * (1 + 0.01 * nftCount);
        const projectedDays = dailyPoints > 0 ? 6942 / dailyPoints : Infinity;

        setPoints(dailyPoints.toFixed(2));
        setDaysRemaining(isFinite(projectedDays) ? projectedDays.toFixed(1) : "∞");
        setTimeout(() => setTypingDone(true), 800);
      } catch (err) {
        console.error("Failed to fetch staking data:", err);
      }
    };

    fetchData();
  }, [address]);

  useEffect(() => {
    const run = async () => {
      if (!address) return;

      try {
        const sRes = await fetch(`/api/status?address=${address}`);
        const s = await sRes.json();
        if (s.success) {
          setStatus(s);

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
              setStatus({
                eligible: true,
                claimed: true,
                claimedTx: c.tx,
                claimedTokenIds: c.tokenIds.join(","),
              });
            } else {
              console.warn("Claim failed:", c.error);
            }
          }
        }
      } catch (e) {
        console.error("status/claim error", e);
      }
    };

    run();
  }, [address, autoClaimed]);

  const earnedPercent = Math.min(((parseFloat(points || 0) * 1) / 6942) * 100, 100);

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
        <title>Staking — Red Pepe Pixies</title>
      </Head>

      <div className="crt min-h-screen bg-black flex justify-center items-start">
        <div className="w-full max-w-3xl px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <ConnectWallet />
            <button onClick={handleRegister} className="btn">
              Register Wallet for Tracking
            </button>
          </div>

          {!address ? (
            <p className="term">Connect your wallet to start staking tracking...</p>
          ) : (
            <div>
              <h1 className="title typewriter">Staking Status for {address}</h1>

              {typingDone && (
                <div className="space-y-3">
                  <p className="term">
                    <span className="label">Wallet status:</span> <span className="ok">✔ Wallet connected</span>
                  </p>

                  <p className="term">
                    <span className="label">$RPEPE Balance:</span> <span className="num">{balance.toLocaleString()}</span>
                  </p>

                  <p className="term">
                    <span className="label">Pixie NFTs:</span> <span className="num">{nfts}</span>
                  </p>

                  <p className="term">
                    <span className="label">Earning:</span> <span className="num">{points}</span>
                    <span className="unit"> points/day</span>
                  </p>

                  <p className="term">
                    <span className="label">Time until NFT:</span> <span className="num">{daysRemaining}</span>
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

              <div className="progressWrap">
                <div className="progressTrack">
                  <div className="progressFill" style={{ width: `${earnedPercent}%` }}>
                    <span className="progressText">{earnedPercent.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="progressLabel">Progress toward next NFT</p>
                <p className="notice">
                  Once registered for staking, removal of $RPEPE or NFTs from this wallet will reset your earnings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(html, body) {
          background: #000;
        }
        .term,
        .title,
        .btn,
        .progressLabel {
          font-family: 'VT323', monospace;
          color: #00ff66;
          letter-spacing: 0.5px;
        }
        .title {
          font-size: 22px;
          margin: 8px 0 16px;
          overflow: hidden;
          display: inline-block; /* fixes trailing gap */
          border-right: 2px solid #00ff66; /* caret */
        }
        .typewriter {
          animation: typing 1.5s steps(40, end), blink-caret 1s step-end infinite;
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: #00ff66; }
        }

        .label { color: #00ff66; }
        .num { color: #ff3b30; }
        .unit { color: #00ff66; opacity: 0.9; }
        .ok { color: #00ff66; }
        .note { margin-top: 8px; opacity: 0.95; }

        .btn {
          background: #111;
          border: 1px solid #2a2a2a;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn:hover { border-color: #00ff66; }

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
          color: #000;
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
          font-family: 'VT323', monospace;
          text-align: center;
        }

        .crt { padding-top: 10px; }
      `}</style>
    </>
  );
}