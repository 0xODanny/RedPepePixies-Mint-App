// /src/pages/api/register.js
import { ethers } from "ethers";
import pg from "pg";
import erc20Abi from "../../../abi/redpepe.json";
import pixiesAbi from "../../../abi/pixies.json";

const {
  AVAX_RPC,
  PRIVATE_KEY, // not strictly needed for reads, but kept for parity
  DATABASE_URL,
  RPEPE_TOKEN_ADDRESS,
  PIXIES_CONTRACT_ADDRESS,
} = process.env;

const provider = new ethers.providers.JsonRpcProvider(AVAX_RPC);
const db = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // <- important for Vercel + many hosted Postgres
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { address } = req.body || {};
    if (!address || !ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, error: "Invalid wallet address" });
    }
    if (!RPEPE_TOKEN_ADDRESS || !PIXIES_CONTRACT_ADDRESS) {
      return res.status(500).json({ success: false, error: "Server misconfigured: token/NFT address missing" });
    }

    const rpepe = new ethers.Contract(RPEPE_TOKEN_ADDRESS, erc20Abi, provider);
    const nft = new ethers.Contract(PIXIES_CONTRACT_ADDRESS, pixiesAbi, provider);

    const rpepeRaw = await rpepe.balanceOf(address);
    const rpepeBal = parseFloat(ethers.utils.formatUnits(rpepeRaw, 18));
    const pixieCount = (await nft.balanceOf(address)).toNumber();

    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO staking_users (wallet, initial_rpepe, pixie_count, points_rpepe, last_update, eligible_for_nft, claimed)
       VALUES ($1, $2, $3, 0, $4, false, false)
       ON CONFLICT (wallet) DO UPDATE SET
         initial_rpepe = EXCLUDED.initial_rpepe,
         pixie_count    = EXCLUDED.pixie_count,
         last_update    = EXCLUDED.last_update`,
      [address.toLowerCase(), rpepeBal, pixieCount, now]
    );

    return res.status(200).json({
      success: true,
      snapshot: { address, rpepe: rpepeBal, pixies: pixieCount },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to register wallet" });
  }
}