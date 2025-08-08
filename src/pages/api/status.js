// /src/api/status.js
import pg from "pg";

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ success: false, error: "Method not allowed" });

  const address = (req.query.address || "").trim().toLowerCase();
  if (!address) return res.status(400).json({ success: false, error: "Missing address" });

  try {
    const { rows } = await db.query(
      `SELECT eligible_for_nft, claimed, claimed_tx, claimed_token_ids
         FROM staking_users
        WHERE lower(wallet) = $1
        LIMIT 1`,
      [address]
    );
    if (!rows.length) return res.status(200).json({ success: true, eligible: false, claimed: false });

    const row = rows[0];
    return res.status(200).json({
      success: true,
      eligible: !!row.eligible_for_nft,
      claimed: !!row.claimed,
      claimedTx: row.claimed_tx || null,
      claimedTokenIds: row.claimed_token_ids || null,
    });
  } catch (e) {
    console.error("status error", e);
    return res.status(500).json({ success: false, error: "Failed to fetch status" });
  }
}