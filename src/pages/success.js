// pages/success.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Success() {
  const router = useRouter();
  const { tokenIds } = router.query;
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenIds) return;
      const ids = tokenIds.split(",");

      const baseCID = "bafybeifvgj27s573p5qoy3ddbqmcgh5tjzjn2bmtvbdwlor2xwwee4pzk4"; // Pixies metadata CID

      const fetched = await Promise.all(
        ids.map(async (id) => {
          try {
            const metadataUrl = `https://ipfs.io/ipfs/${baseCID}/RedPepePixies${id}.json`;
            const res = await fetch(metadataUrl);
            const metadata = await res.json();
            const imageUrl = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
            return { id, image: imageUrl };
          } catch (err) {
            return { id, image: null };
          }
        })
      );

      setTickets(fetched);
    };

    fetchMetadata();
  }, [tokenIds]);

  return (
    <div
      style={{
        backgroundColor: "#000",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎉 Mint Successful!</h1>

      {tickets.map(({ id, image }, index) => (
        <div key={index} style={{ marginBottom: "1rem" }}>
          {image ? (
            <img
              src={image}
              alt={`Pixies NFT #${id}`}
              style={{ maxWidth: "300px", borderRadius: "15px" }}
            />
          ) : (
            <p>⚠️ Failed to load image for Pixies NFT</p>
          )}
          <p style={{ marginTop: "0.5rem" }}>Token ID: {id}</p>
        </div>
      ))}

      <div style={{ marginTop: "2rem", color: "#ccc", textAlign: "center" }}>
        <p>Thank you for minting! Share your NFT and follow us:</p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <a
            href="https://x.com/redpepeavax"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              color: "#00bfff",
              textDecoration: "none",
            }}
          >
            <img
              src="/x-logo.png"
              alt="Twitter"
              style={{ width: "20px", height: "20px", marginRight: "6px" }}
            />
            Twitter
          </a>

          <a
            href="https://arena.social/redpepeavax"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ff6a00",
              textDecoration: "none",
            }}
          >
            <img
              src="/arena-logo.png"
              alt="Arena"
              style={{ width: "20px", height: "20px", marginRight: "6px" }}
            />
            Arena
          </a>

          <a
            href="https://t.me/redpepeavax1"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              color: "#0088cc",
              textDecoration: "none",
            }}
          >
            <img
              src="/telegram-logo.png"
              alt="Telegram"
              style={{ width: "20px", height: "20px", marginRight: "6px" }}
            />
	    
            Telegram
          </a>
        </div>
      </div>

      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "2rem",
          backgroundColor: "#222",
          color: "#fff",
          border: "1px solid #444",
          padding: "0.75rem 1.5rem",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        ⬅️ Back to Mint Page
      </button>
     </div>
  );
}