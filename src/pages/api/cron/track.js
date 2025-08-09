// src/pages/api/cron/track.js
import { ethers } from "ethers";
import pg from "pg";
import erc20Abi from "../../../../abi/redpepe.json";
import pixiesAbi from "../../../../abi/pixies.json";

const {
  DATABASE_URL,
  AVAX_RPC,
  CRON_SECRET, // Vercel Cron secret (Project Settings → Environment Variables)
} = process.env;

// Prefer server-side addresses; fall back to NEXT_PUBLIC_* if needed
const RPEPE_ADDRESS =
  process.env.RPEPE_TOKEN_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_RPEPE_TOKEN_ADDRESS;

const PIXIES_ADDRESS =
  process.env.PIXIES_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_PIXIES_CONTRACT_ADDRESS;

// ---- Staking math (MUST MATCH FRONTEND) ----
const RATE_PER_RPEPE  = 0.0003333; // pts per token per day
const MAX_DAILY_BASE  = 234.1;     // cap on base daily from $RPEPE
const NFT_BONUS_PER   = 0.005;     // +0.5% per NFT
const NFT_BONUS_CAP   = 50;        // up to +25% total
const RPEPE_TARGET    = 6942;

// DB + chain clients (created once per lambda cold start)
const db = new pg.Pool({ connectionString: DATABASE_URL, max: 1 });
const provider = new ethers.providers.JsonRpcProvider(AVAX_RPC);
const rpepe   = new ethers.Contract(RPEPE_ADDRESS, erc20Abi, provider);
const pixies  = new ethers.Contract(PIXIES_ADDRESS, pixiesAbi, provider);

// Guard: allow Vercel Cron (x-vercel-cron) OR Bearer token
function isAuthorized(req) {
  if (req.headers["x-vercel-cron"]) return true;
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${CRON_SECRET}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    // Pull all staking users
    const { rows: users } = await db.query(
      `SELECT wallet, initial_rpepe, pixie_count, points_rpepe, last_update
         FROM staking_users`
    );

    if (!users.length) {
      return res.status(200).json({ ok: true, processed: 0, updated: 0, eligibleUpdated: 0 });
    }

    let updated = 0;
    let eligibleUpdated = 0;

    // Sequential loop keeps RPC load modest
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

      if (hours < 1) continue; // only accrue hourly

      let pointsR = Number(u.points_rpepe || 0);
      const snap  = Number(u.initial_rpepe || 0);

      if (rpepeBal >= snap) {
        // base from SNAPSHOT, not current bal (self-custody rule)
        const baseUncapped = snap * RATE_PER_RPEPE;
        const baseCapped   = Math.min(baseUncapped, MAX_DAILY_BASE);

        // +0.5% per NFT up to 50 (post-cap)
        const boostFactor  = 1 + NFT_BONUS_PER * Math.min(pixCount, NFT_BONUS_CAP);
        const daily        = baseCapped * boostFactor;

        pointsR += (daily / 24) * hours;          // pro-rate by elapsed hours
        pointsR  = Math.min(pointsR, RPEPE_TARGET);
      } else {
        // Dropping below snapshot resets progress
        pointsR = 0;
      }

      const becameEligible = pointsR >= RPEPE_TARGET;

      // Persist
      await db.query(
        `UPDATE staking_users SET
           points_rpepe     = $1,
           last_update      = $2,
           pixie_count      = $3,
           eligible_for_nft = $4
         WHERE lower(wallet) = $5`,
        [pointsR, now.toISOString(), pixCount, becameEligible, wallet]
      );

      updated += 1;
      if (becameEligible) eligibleUpdated += 1;
    }

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