// src/pages/index.js
import { useState, useEffect } from "react";
import { useAddress, useConnectionStatus, ConnectWallet } from "@thirdweb-dev/react";
import { ethers } from "ethers";

export default function Home() {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const generated = [...Array(65)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
    }));
    setSparkles(generated);
  }, []);

const handleMint = async () => {
  try {
    if (!window?.ethereum) return alert("No wallet found. Install MetaMask.");
    setLoading(true);

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // 1) Ask permission to access accounts
    await provider.send("eth_requestAccounts", []);

    // 2) Ensure Avalanche C-Chain
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== 43114) {
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0xa86a" }]); // 43114 hex
    }

    // 3) Use signer AFTER permission
    const signer = provider.getSigner();

    // 4) Send AVAX safely (no float math)
    const deployer = process.env.NEXT_PUBLIC_DEPLOYER_WALLET;
    const priceWei = ethers.utils.parseUnits("1.33", 18);   // 1.33 AVAX
    const valueWei = priceWei.mul(ethers.BigNumber.from(String(quantity)));

    const payTx = await signer.sendTransaction({ to: deployer, value: valueWei });
    await payTx.wait();

    // 5) Call your API to adminMint on backend
    const res = await fetch("/api/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: await signer.getAddress(), quantity, paymentMethod: "avax" }),
    });

    const data = await res.json().catch(() => ({}));
    if (data?.success) {
      window.location.href = `/success?tokenIds=${data.tokenIds.join(",")}`;
    } else {
      throw new Error(data?.error || "Mint failed on server");
    }
  } catch (err) {
    console.error(err);
    alert(`Transaction failed: ${err.message || err}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <main
      style={{
        backgroundImage: "url('/pixies-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#111",
          padding: "2rem",
          border: "4px solid #cc4444",
          borderRadius: "15px",
          maxWidth: "600px",
          width: "100%",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        {/* Top controls: Connect + Stake */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" }}>
          <ConnectWallet />
          <a
            href="/staking"
            style={{
              backgroundColor: "#28a745",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontWeight: "bold",
              textDecoration: "none",
              border: "2px solid #1e7e34",
              whiteSpace: "nowrap",
              alignSelf: "center",
            }}
          >
            💾 Stake Now to Earn More Pixies!
          </a>
        </div>

        <h1 style={{ fontSize: "1.75rem", margin: "1rem 0" }}>Mint a Red Pepe Pixies NFT!</h1>

        <div style={{ display: "flex", justifyContent: "center", margin: "1.5rem 0", position: "relative" }}>
          <div
            style={{
              width: "300px",
              borderRadius: "20px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src="/pixies-preview.png"
              alt="Pixies NFT"
              style={{
                width: "100%",
                display: "block",
                borderRadius: "20px",
              }}
            />
            <div className="css-sparkles">
              {sparkles.map((s, i) => (
                <div
                  key={i}
                  className="twinkle"
                  style={{
                    top: s.top,
                    left: s.left,
                    animationDelay: s.delay,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <p style={{ margin: "1rem 0" }}>
          Each Pixie costs <strong>1.33 AVAX</strong>
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <label>Quantity: </label>
          <select onChange={(e) => setQuantity(Number(e.target.value))}>
            {[1, 3, 5, 10].map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleMint}
          disabled={loading}
          style={{
            padding: "0.75rem 3rem",
            backgroundColor: "#00bfff",
            color: "#000",
            fontWeight: "bold",
            fontSize: "1.75rem",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          {loading ? "Minting..." : "Mint Now"}
        </button>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "#e6f7ff",
            border: "2px solid #cc4444",
            borderRadius: "10px",
            color: "#000",
            fontWeight: "bold",
            lineHeight: "1.6",
          }}
        >
          Come and chat in our official Telegram chat while you mint!{" "}
          <a
            href="https://t.me/redpepeavax1"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#cc4444", textDecoration: "underline" }}
          >
            Don't miss out!
          </a>
        </div>

        <p style={{ marginTop: "1rem" }}>
          Your wallet: {connectionStatus === "connected" ? address : "Not connected"}
        </p>
      </div>
    </main>
  );
}