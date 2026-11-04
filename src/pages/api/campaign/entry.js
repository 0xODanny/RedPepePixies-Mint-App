import { refuseLiveAction } from "../../../../lib/campaign/flags.mjs";

export default function handler(req, res) {
  const refused = refuseLiveAction("entry");
  return res.status(refused.status).json(refused.body);
}
