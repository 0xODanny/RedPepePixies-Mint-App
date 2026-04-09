// /src/pages/api/status.js
import { ethers } from "ethers";
import pg from "pg";
import erc20Abi from "../../../abi/redpepe.json";
import pixiesAbi from "../../../abi/pixies.json";

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const RATE_PER_RPEPE = 0.0003333;
const MAX_DAILY_BASE = 234.1;
const NFT_BONUS_PER = 0.005;
const NFT_BONUS_CAP = 50;
const RPEPE_TARGET = 6942;
const SECONDS_PER_DAY = 86400;

const AVAX_RPC = process.env.AVAX_RPC || process.env.NEXT_PUBLIC_AVAX_RPC;
const RPEPE_ADDRESS =
  process.env.RPEPE_TOKEN_CONTRACT_ADDRESS ||
  process.env.RPEPE_TOKEN_ADDRESS ||
  process.env.NEXT_PUBLIC_RPEPE_TOKEN_ADDRESS;
const PIXIES_ADDRESS =
  process.env.PIXIES_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_PIXIES_CONTRACT_ADDRESS;

const provider = AVAX_RPC ? new ethers.providers.JsonRpcProvider(AVAX_RPC) : null;
const rpepe = provider && RPEPE_ADDRESS ? new ethers.Contract(RPEPE_ADDRESS, erc20Abi, provider) : null;
const pixies = provider && PIXIES_ADDRESS ? new ethers.Contract(PIXIES_ADDRESS, pixiesAbi, provider) : null;

function dailyFromSnapshots(rpepeSnap, pixieSnap) {
  const baseUncapped = rpepeSnap * RATE_PER_RPEPE;
  const baseCapped = Math.min(baseUncapped, MAX_DAILY_BASE);
  const boostFactor = 1 + NFT_BONUS_PER * Math.min(pixieSnap, NFT_BONUS_CAP);
  return baseCapped * boostFactor;
}

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
          last_update,
          initial_rpepe,
          pixie_count
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
    let points = Number(r.points_rpepe || 0);
    let snap = Number(r.initial_rpepe || 0);
    let pixSnap = Number(r.pixie_count || 0);
    const now = new Date();
    const lastUpdate = r.last_update ? new Date(r.last_update) : now;
    const elapsedSeconds = Math.max(0, (now.getTime() - lastUpdate.getTime()) / 1000);

    // Live sync on status read so users see new accrual behavior immediately after connecting.
    if (rpepe && pixies) {
      const [rawBal, rawPix] = await Promise.all([rpepe.balanceOf(address), pixies.balanceOf(address)]);
      const currentBal = parseFloat(ethers.utils.formatUnits(rawBal, 18));
      const currentPix = rawPix.toNumber();

      if (currentBal < snap || currentPix < pixSnap) {
        // Any decrease resets timer and starts fresh at current holdings.
        points = 0;
        snap = currentBal;
        pixSnap = currentPix;
      } else {
        if (elapsedSeconds > 0) {
          const daily = dailyFromSnapshots(snap, pixSnap);
          points += (daily * elapsedSeconds) / SECONDS_PER_DAY;
          points = Math.min(points, RPEPE_TARGET);
        }

        // Promote snapshot when user adds more so future accrual is faster from now on.
        if (currentBal > snap) snap = currentBal;
        if (currentPix > pixSnap) pixSnap = currentPix;
      }

      const eligible = points >= RPEPE_TARGET;

      await db.query(
        `UPDATE staking_users SET
           points_rpepe     = $1,
           last_update      = $2,
           initial_rpepe    = $3,
           pixie_count      = $4,
           eligible_for_nft = $5
         WHERE lower(wallet) = $6`,
        [points, now.toISOString(), snap, pixSnap, eligible, address]
      );

      r.points_rpepe = points;
      r.last_update = now.toISOString();
      r.eligible_for_nft = eligible;
    }

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