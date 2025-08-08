// /src/pages/api/status.js
import pg from "pg";
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ success: false, error: "Method not allowed" });

  const address = (req.query.address || "").trim().toLowerCase();
  if (!address) return res.status(400).json({ success: false, error: "Missing address" });

  try {
    const { rows } = await db.query(
      `SELECT
          eligible_for_nft,
          claimed,
          claimed_tx,
          claimed_token_ids,
          points_rpepe,
          last_update
         FROM staking_users
        WHERE lower(wallet) = $1
        LIMIT 1`,
      [address]
    );

    if (!rows.length) {
      return res.status(200).json({
        success: true,
        eligible: false,
        claimed: false,
        tx: null,
        tokenIds: null,
        points_rpepe: 0,
        last_update: null,
      });
    }

    const r = rows[0];
    return res.status(200).json({
      success: true,
      eligible: !!r.eligible_for_nft,
      claimed: !!r.claimed,
      tx: r.claimed_tx || null,
      tokenIds: r.claimed_token_ids || null,
      points_rpepe: Number(r.points_rpepe || 0),
      last_update: r.last_update ? new Date(r.last_update).toISOString() : null,
    });
  } catch (e) {
    console.error("status error", e);
    return res.status(500).json({ success: false, error: "Failed to fetch status" });
  }
}