import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const tokenIds = router.query.tokenIds?.split(",") || [];

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>✅ Mint Successful!</h1>
      <p>You minted the following NFT(s):</p>

      {tokenIds.map((id) => (
        <div key={id}>
          <p>Token ID: {id}</p>
          <img
            src={`https://ipfs.io/ipfs/YOUR_CID/Balln_Raffle_Ticket_${id}.png`}
            width="300"
          />
        </div>
      ))}

      <br />
      <a href="/">⬅️ Mint more</a>
    </main>
  );
}