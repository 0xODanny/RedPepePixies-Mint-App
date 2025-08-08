// /src/pages/api/forceEligible.js
import pg from "pg";

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// simple auth so randos can't hit this
const FORCE_KEY = process.env.FORCE_KEY; // set this in Vercel

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  try {
    const { address, key } = req.body || {};
    if (!address || !key) return res.status(400).json({ success: false, error: "Missing address or key" });
    if (key !== FORCE_KEY) return res.status(401).json({ success: false, error: "Unauthorized" });

    await db.query(
      `UPDATE staking_users
         SET points_rpepe = 6942,
             eligible_for_nft = TRUE,
             last_update = NOW()
       WHERE lower(wallet) = lower($1)`,
      [address]
    );

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("forceEligible error", e);
    return res.status(500).json({ success: false, error: "forceEligible failed" });
  }
}