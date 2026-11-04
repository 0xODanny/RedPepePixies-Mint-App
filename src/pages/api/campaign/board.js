import { sampleStandings } from "../../../../lib/campaign/sampleBoard.mjs";
import { actionAllowed } from "../../../../lib/campaign/flags.mjs";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (actionAllowed("verifiedBoard")) {
    return res.status(403).json({
      ok: false,
      code: "VERIFIED_BOARD_NOT_CONNECTED",
      error: "The verified board is not connected. Pepinho runs are not read from this preview.",
    });
  }
  return res.status(200).json({ ok: true, ...sampleStandings() });
}
