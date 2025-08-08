// /src/pages/api/status.js
import pg from "pg";

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Minutes difference helper
function minutesBetween(aIso, bIso) {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.max(0, (b - a) / 60000);
}

export default async function handler(req, res) {
  const { address } = req.query || {};
  if (!address) return res.status(400).json({ success: false, error: "address required" });

  try {
    const { rows } = await db.query(
      `SELECT wallet, points_rpepe, last_update, eligible_for_nft, claimed, claimed_tx, claimed_token_ids
       FROM staking_users WHERE wallet = $1`,
      [address.toLowerCase()]
    );

    if (!rows.length) {
      // not registered yet
      return res.status(200).json({
        success: true,
        eligible: false,
        claimed: false,
        points_rpepe: 0,
        last_update: null,
        tx: null,
        tokenIds: null,
      });
    }

    const row = rows[0];
    let eligible = !!row.eligible_for_nft;
    const claimed = !!row.claimed;

    // DEV FAST MODE: auto-eligible after N minutes
    if (process.env.DEV_FAST === "1" && !claimed && !eligible) {
      const mins = Number(process.env.DEV_MINUTES_TO_MINT || "10");
      const sinceIso = row.last_update ? row.last_update.toISOString() : new Date().toISOString();
      const nowIso = new Date().toISOString();

      if (minutesBetween(sinceIso, nowIso) >= mins) {
        await db.query(
          `UPDATE staking_users
             SET eligible_for_nft = true,
                 last_update = NOW()
           WHERE wallet = $1`,
          [address.toLowerCase()]
        );
        eligible = true;
      }
    }

    return res.status(200).json({
      success: true,
      eligible,
      claimed,
      points_rpepe: Number(row.points_rpepe || 0),
      last_update: row.last_update ? row.last_update.toISOString() : null,
      tx: row.claimed_tx || null,
      tokenIds: row.claimed_token_ids || null,
    });
  } catch (e) {
    console.error("status error:", e);
    return res.status(500).json({ success: false, error: "db error" });
  }
}