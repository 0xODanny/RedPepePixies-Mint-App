// pages/staking.js
import { useAddress, ConnectWallet } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import pixiesAbi from "../../../abi/pixies.json";
import erc20Abi from "../../../abi/redpepe.json";

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

  // new: server status + auto-claim
  const [status, setStatus] = useState({ eligible: false, claimed: false, claimedTx: null, claimedTokenIds: null });
  const [autoClaimed, setAutoClaimed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!address || !rpc || !rpepeTokenAddress || !nftContractAddress) return;

      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const rpepe = new ethers.Contract(rpepeTokenAddress, erc20Abi, provider);
      const nft = new ethers.Contract(nftContractAddress, pixiesAbi, provider);

      try {
        // token + nft balances
        const rawBalance = await rpepe.balanceOf(address);
        const parsedBalance = parseFloat(ethers.utils.formatUnits(rawBalance, 18));
        setBalance(parsedBalance);

        const balanceCount = await nft.balanceOf(address);
        const nftCount = balanceCount.toNumber();
        setNfts(nftCount);

        // points/day and estimate
        const dailyPoints = parsedBalance * 0.0003333 * (1 + 0.01 * nftCount);
        const projectedDays = dailyPoints > 0 ? 6942 / dailyPoints : Infinity;

        setPoints(dailyPoints.toFixed(2));
        setDaysRemaining(isFinite(projectedDays) ? projectedDays.toFixed(1) : "∞");
        setTimeout(() => setTypingDone(true), 2000);
      } catch (err) {
        console.error("Failed to fetch staking data:", err);
      }
    };

    fetchData();
  }, [address]);

  // check eligibility/claimed + auto-claim once
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
              alert(`🎉 Free Pixie minted! Token IDs: ${c.tokenIds.join(", ")}`);
              // refresh status after claim
              setStatus({ eligible: true, claimed: true, claimedTx: c.tx, claimedTokenIds: c.tokenIds.join(",") });
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
        alert("✅ Registered! Your staking progress has been saved.");
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("❌ Registration failed.");
    }
  };

  return (
    <div className="crt min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <ConnectWallet className="mb-6" />

        {!address ? (
          <p className="terminal-text text-lg">Connect your wallet to start staking tracking...</p>
        ) : (
          <div>
            <h1 className="terminal-text text-2xl mb-6">Staking Status for {address}</h1>

            <div className="mb-4">
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Register Wallet for Tracking
              </button>
            </div>

            {typingDone && (
              <div className="space-y-4">
                <p className="terminal-text text-xl">✅ Wallet connected</p>
                <p className="terminal-text text-xl">
                  🔢 $RPEPE Balance: <span className="terminal-number">{balance.toLocaleString()}</span>
                </p>
                <p className="terminal-text text-xl">
                  🧚‍♀️ Pixie NFTs: <span className="terminal-number">{nfts}</span>
                </p>
                <p className="terminal-text text-xl">
                  📈 Earning: <span className="terminal-number">{points}</span> points/day
                </p>
                <p className="terminal-text text-xl">
                  ⏳ Time until NFT: <span className="terminal-red">{daysRemaining} days</span>
                </p>

                <div className="w-full bg-gray-800 border border-green-600 rounded mt-4 h-6 overflow-hidden">
                  <div
                    className="h-full bg-green-500 text-black text-xs font-bold flex items-center justify-center"
                    style={{ width: `${earnedPercent}%`, transition: "width 1s ease-in-out" }}
                  >
                    {earnedPercent.toFixed(1)}%
                  </div>
                </div>
                <p className="terminal-number text-xs text-green-400 mt-1">Progress toward next NFT</p>

                {/* status messages */}
                {status.claimed && (
                  <p className="terminal-text text-xl mt-4">
                    ✅ Thank you for staking. This wallet has already received a free Pixie via $RPEPE staking.
                  </p>
                )}
                {!status.claimed && status.eligible && (
                  <p className="terminal-text text-xl mt-4">🎯 Eligible for a free Pixie — minting now...</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}