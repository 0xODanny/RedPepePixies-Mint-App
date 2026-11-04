import { refuseLiveAction } from "../../../../lib/campaign/flags.mjs";

export default function handler(req, res) {
  const action = req.query?.action === "payout" ? "payout" : "claim";
  const refused = refuseLiveAction(action);
  return res.status(refused.status).json(refused.body);
}
