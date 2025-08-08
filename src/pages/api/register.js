// /src/pages/api/register.js
import { ethers } from "ethers";
import pg from "pg";
import erc20Abi from "../../../abi/redpepe.json";
import pixiesAbi from "../../../abi/pixies.json";

const {
  AVAX_RPC,
  CONTRACT_ADDRESS,
  PRIVATE_KEY,
  DATABASE_URL
} = process.env;

const provider = new ethers.providers.JsonRpcProvider(AVAX_RPC);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const token = new ethers.Contract(process.env.RPEPE_TOKEN_ADDRESS, erc20Abi, provider);
const nft   = new ethers.Contract(process.env.PIXIES_CONTRACT_ADDRESS, pixiesAbi, provider);

const db = new pg.Pool({ connectionString: DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { address } = req.body;
  if (!ethers.utils.isAddress(address)) {
    return res.status(400).json({ success: false, error: "Invalid wallet address" });
  }

  try {
    const rpepeRaw = await token.balanceOf(address);
    const rpepe = parseFloat(ethers.utils.formatUnits(rpepeRaw, 18));
    const pixieCount = (await nft.balanceOf(address)).toNumber();

    const now = new Date();

    await db.query(
      `INSERT INTO staking_users (
        wallet, initial_rpepe, pixie_count, points_rpepe, last_update
      ) VALUES ($1, $2, $3, 0, $4)
      ON CONFLICT (wallet) DO UPDATE SET 
        initial_rpepe = EXCLUDED.initial_rpepe,
        pixie_count = EXCLUDED.pixie_count,
        last_update = EXCLUDED.last_update;`,
      [address, rpepe, pixieCount, now.toISOString()]
    );

    return res.status(200).json({ success: true, snapshot: { address, rpepe, pixieCount } });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, error: "Failed to register wallet" });
  }
}