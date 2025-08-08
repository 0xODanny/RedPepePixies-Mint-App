// /scripts/trackStaking.js
import { ethers } from "ethers";
import pg from "pg";
import erc20Abi from "../abi/redpepe.json";
import pixiesAbi from "../abi/pixies.json";

const {
  PRIVATE_KEY,
  AVAX_RPC,
  CONTRACT_ADDRESS,
} = process.env;

const provider = new ethers.providers.JsonRpcProvider(AVAX_RPC);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const token = new ethers.Contract(process.env.RPEPE_TOKEN_ADDRESS, erc20Abi, provider);
const nft   = new ethers.Contract(process.env.PIXIES_CONTRACT_ADDRESS, pixiesAbi, provider);

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const POINTS_RPEPE_PER_TOKEN = 0.0003333;
const PIXIE_BONUS = 0.01;
const RPEPE_TARGET = 6942;
const RPEPE_DAILY_MAX = 234.1;

async function runTracker() {
  const { rows: users } = await db.query("SELECT * FROM staking_users");

  for (const user of users) {
    const address = user.wallet;
    const rpepeSnap = parseFloat(user.initial_rpepe);

    const rawRpepe = await rpepeContract.balanceOf(address);
    const rpepeBal = parseFloat(ethers.utils.formatUnits(rawRpepe, 18));

    const pixies = (await pixieContract.balanceOf(address)).toNumber();

    const now = new Date();
    const lastUpdate = new Date(user.last_update);
    const hours = Math.floor((now - lastUpdate) / (1000 * 60 * 60));

    if (hours >= 1) {
      let pointsR = user.points_rpepe;

      if (rpepeBal >= rpepeSnap) {
        let daily = rpepeSnap * POINTS_RPEPE_PER_TOKEN * (1 + PIXIE_BONUS * pixies);
        daily = Math.min(daily, RPEPE_DAILY_MAX);
        pointsR += (daily / 24) * hours;
        pointsR = Math.min(pointsR, RPEPE_TARGET);
      } else {
        pointsR = 0;
      }

      await db.query(
        `UPDATE staking_users SET 
          points_rpepe = $1, 
          last_update = $2,
          eligible_for_nft = $3
        WHERE wallet = $4`,
        [
          pointsR,
          now.toISOString(),
          pointsR >= RPEPE_TARGET,
          address,
        ]
      );

      console.log(`✅ Updated ${address}: ${pointsR.toFixed(2)} pts RPEPE`);
    }
  }
}

runTracker().then(() => process.exit(0));