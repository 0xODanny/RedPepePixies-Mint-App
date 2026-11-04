import { contractStatus } from "../../../../lib/campaign/contracts.mjs";
import { readFlags } from "../../../../lib/campaign/flags.mjs";
import { budgetImpact, ESIM_REDEMPTION_COPY, seasonCommitment } from "../../../../lib/campaign/lineup.mjs";
import { DRAW_PLAN } from "../../../../lib/campaign/draw.mjs";
import { campaignDraws } from "../../../../lib/campaign/schedule.mjs";
import { BOARD_GAMES } from "../../../../lib/campaign/runs.mjs";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const flags = readFlags();
  return res.status(200).json({
    ok: true,
    preview: true,
    contract: contractStatus(),
    flags: {
      ...flags,
      previewLock: true,
      entriesEnabled: false,
      claimsEnabled: false,
      payoutsEnabled: false,
      fulfillmentEnabled: false,
      verifiedBoardEnabled: false,
      seasonStartConfirmed: false,
      esimProviderWindowConfirmed: false,
    },
    commitment: seasonCommitment(),
    budget: budgetImpact(null),
    esimRedemptionCopy: ESIM_REDEMPTION_COPY,
    esimProviderWindowConfirmed: false,
    draws: campaignDraws({ confirmed: false }),
    games: BOARD_GAMES,
    drawPlan: DRAW_PLAN,
  });
}
