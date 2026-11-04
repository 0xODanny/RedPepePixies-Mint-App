import { randomBytes } from "crypto";
import { ethers } from "ethers";
import { buildChallengeMessage, verifyChallenge } from "../../../../lib/campaign/wallet.mjs";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const address = req.body?.address;
  if (!address || !ethers.utils.isAddress(address)) {
    return res.status(400).json({ ok: false, error: "Invalid wallet address" });
  }
  if (req.body?.signature && req.body?.message) {
    const verdict = verifyChallenge({
      address,
      message: req.body.message,
      signature: req.body.signature,
    });
    return res.status(verdict.ok ? 200 : 400).json({ ...verdict, entryRecorded: false });
  }
  const issuedAt = new Date().toISOString();
  const nonce = randomBytes(16).toString("hex");
  return res.status(200).json({
    ok: true,
    message: buildChallengeMessage({ address, nonce, issuedAt }),
    nonce,
    issuedAt,
    entryRecorded: false,
  });
}
