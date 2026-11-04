/**
 * Preview lock stays on until a reviewed launch change turns it off.
 * Environment flags cannot enable entries, claims, payouts, fulfillment,
 * or a verified board while the lock is on.
 */
export const PREVIEW_LOCK = true;

export function readFlags(env = process.env) {
  return {
    entriesEnabled: env.CAMPAIGN_ENTRIES_ENABLED === "true",
    claimsEnabled: env.CAMPAIGN_CLAIMS_ENABLED === "true",
    payoutsEnabled: env.CAMPAIGN_PAYOUTS_ENABLED === "true",
    fulfillmentEnabled: env.CAMPAIGN_FULFILLMENT_ENABLED === "true",
    verifiedBoardEnabled: env.CAMPAIGN_VERIFIED_BOARD_ENABLED === "true",
    seasonStartConfirmed: env.CAMPAIGN_SEASON_START_CONFIRMED === "true",
    esimProviderWindowConfirmed: env.CAMPAIGN_ESIM_WINDOW_CONFIRMED === "true",
  };
}

export function actionAllowed(action, env = process.env, previewLock = PREVIEW_LOCK) {
  if (previewLock) return false;
  const flags = readFlags(env);
  if (action === "entry") return flags.entriesEnabled;
  if (action === "claim") return flags.claimsEnabled;
  if (action === "payout") return flags.payoutsEnabled;
  if (action === "fulfillment") return flags.fulfillmentEnabled;
  if (action === "verifiedBoard") return flags.verifiedBoardEnabled;
  return false;
}

export function refuseLiveAction(action) {
  return {
    status: 403,
    body: {
      ok: false,
      code: "DISABLED",
      action,
      error: "Entries, claims, payouts, and fulfillment are disabled in this preview.",
    },
  };
}
