// src/pages/api/cron/track.js
import { ethers } from "ethers";
import pg from "pg";
import erc20Abi from "../../../../abi/redpepe.json";
import pixiesAbi from "../../../../abi/pixies.json";

const {
  DATABASE_URL,
  AVAX_RPC,
  CRON_SECRET, // <-- Vercel Cron secret you add in env vars
} = process.env;

// Prefer server-side addresses, fall back to NEXT_PUBLIC_* if that's what you have set
const RPEPE_ADDRESS =
  process.env.RPEPE_TOKEN_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_RPEPE_TOKEN_ADDRESS;

const PIXIES_ADDRESS =
  process.env.PIXIES_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_PIXIES_CONTRACT_ADDRESS;

// ---- Staking math ----
const POINTS_RPEPE_PER_TOKEN = 0.0003333;
const PIXIE_BONUS            = 0.01;
const RPEPE_TARGET           = 6942;
const RPEPE_DAILY_MAX        = 234.1; // safety cap

// DB + chain clients (created once per lambda cold start)
const db = new pg.Pool({ connectionString: DATABASE_URL, max: 1 });
const provider = new ethers.providers.JsonRpcProvider(AVAX_RPC);
const rpepe   = new ethers.Contract(RPEPE_ADDRESS, erc20Abi, provider);
const pixies  = new ethers.Contract(PIXIES_ADDRESS, pixiesAbi, provider);

export default async function handler(req, res) {
  // Allow: Vercel Cron (adds x-vercel-cron) OR Bearer CRON_SECRET
  if (
    req.headers.authorization !== `Bearer ${CRON_SECRET}` &&
    !req.headers["x-vercel-cron"]
  ) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    // Pull all staking users
    const { rows: users } = await db.query(
      `SELECT wallet, initial_rpepe, pixie_count, points_rpepe, last_update
         FROM staking_users`
    );

    if (!users.length) {
      console.log("No users to process.");
      return res.status(200).json({ ok: true, processed: 0, updated: 0, eligibleUpdated: 0 });
    }

    let updated = 0;
    let eligibleUpdated = 0;

    // Process sequentially to avoid RPC bursts/timeouts
    for (const u of users) {
      const wallet = (u.wallet || "").toLowerCase();
      if (!wallet) continue;

      // Current on-chain snapshot
      const rawBal   = await rpepe.balanceOf(wallet);
      const rpepeBal = parseFloat(ethers.utils.formatUnits(rawBal, 18));
      const pixCount = (await pixies.balanceOf(wallet)).toNumber();

      const now = new Date();
      const lastUpdate = u.last_update ? new Date(u.last_update) : null;
      const hours = lastUpdate ? Math.floor((now - lastUpdate) / (1000 * 60 * 60)) : 1;

      // Skip if less than 1 hour elapsed
      if (hours < 1) continue;

      // Accrue
      let pointsR = Number(u.points_rpepe || 0);

      if (rpepeBal >= Number(u.initial_rpepe || 0)) {
        let daily = Number(u.initial_rpepe || 0) * POINTS_RPEPE_PER_TOKEN * (1 + PIXIE_BONUS * pixCount);
        daily = Math.min(daily, RPEPE_DAILY_MAX);
        pointsR += (daily / 24) * hours;            // pro‑rate by hours elapsed
        pointsR  = Math.min(pointsR, RPEPE_TARGET); // hard cap at target
      } else {
        // Self-custody rule: dropping below snapshot resets progress
        pointsR = 0;
      }

      const becameEligible = pointsR >= RPEPE_TARGET;

      // Persist
      await db.query(
        `UPDATE staking_users SET
           points_rpepe = $1,
           last_update = $2,
           pixie_count = $3,
           eligible_for_nft = $4
         WHERE lower(wallet) = $5`,
        [pointsR, now.toISOString(), pixCount, becameEligible, wallet]
      );

      updated += 1;
      if (becameEligible) eligibleUpdated += 1;
    }

    console.log(`Cron ran: processed=${users.length} updated=${updated} eligibleUpdated=${eligibleUpdated}`);
    return res.status(200).json({
      ok: true,
      processed: users.length,
      updated,
      eligibleUpdated,
      ranAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("cron/track error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Tracker failed" });
  }
}