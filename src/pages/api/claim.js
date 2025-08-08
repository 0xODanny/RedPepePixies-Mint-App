// /src/api/claim.js
import { ethers } from "ethers";
import pg from "pg";
import pixiesAbi from "../../../abi/pixies.json";

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  const { address } = req.body || {};
  if (!address || !ethers.utils.isAddress(address)) {
    return res.status(400).json({ success: false, error: "Invalid wallet address" });
  }

  const lower = address.toLowerCase();

  try {
    // 1) Check eligibility + claimed in DB
    const { rows } = await db.query(
      `SELECT eligible_for_nft, claimed FROM staking_users WHERE lower(wallet) = $1 LIMIT 1`,
      [lower]
    );
    if (!rows.length) {
      return res.status(400).json({ success: false, error: "Wallet not registered or not tracked yet" });
    }
    const row = rows[0];
    if (!row.eligible_for_nft) {
      return res.status(403).json({ success: false, error: "Not eligible yet" });
    }
    if (row.claimed) {
      return res.status(409).json({ success: false, error: "Already claimed" });
    }

    // 2) Mint 1 token (adminMint) to the wallet
    const provider = new ethers.providers.JsonRpcProvider({
      url: process.env.AVAX_RPC,
      chainId: 43114,
      name: "avalanche",
    });
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const nft = new ethers.Contract(process.env.CONTRACT_ADDRESS, pixiesAbi, wallet);

    const tx = await nft.adminMint(address, 1);
    const receipt = await tx.wait();

    // 3) Parse minted tokenIds from logs
    const iface = new ethers.utils.Interface(pixiesAbi);
    const tokenIds = receipt.logs.reduce((acc, log) => {
      try {
        const parsed = iface.parseLog(log);
        if (parsed.name === "Transfer" && parsed.args.to.toLowerCase() === lower) {
          acc.push(parsed.args.tokenId.toString());
        }
      } catch {}
      return acc;
    }, []);

    // 4) Mark as claimed
    await db.query(
      `UPDATE staking_users
          SET claimed = true,
              claimed_tx = $1,
              claimed_token_ids = $2,
              claimed_at = NOW()
        WHERE lower(wallet) = $3`,
      [tx.hash, tokenIds.join(","), lower]
    );

    return res.status(200).json({ success: true, tx: tx.hash, tokenIds });
  } catch (err) {
    console.error("claim error", err);
    return res.status(500).json({ success: false, error: "Claim failed" });
  }
}