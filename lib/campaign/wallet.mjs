import { ethers } from "ethers";
import { normalizeWallet } from "./runs.mjs";

const MAX_AGE_MS = 10 * 60 * 1000;

export function buildChallengeMessage({ address, nonce, issuedAt }) {
  const wallet = ethers.utils.getAddress(address);
  return [
    "Red Pepe Pixies × Pepinho Games",
    "Sign this message to prove you control this wallet.",
    `Wallet: ${wallet}`,
    `Nonce: ${nonce}`,
    `Issued: ${issuedAt}`,
    "This signature does not enter the draw or claim a prize.",
    "Never sign a message that asks for your seed phrase or private key.",
  ].join("\n");
}

export function verifyChallenge({ address, message, signature, now = Date.now() }) {
  const expectedWallet = normalizeWallet(address);
  if (!message.includes(`Wallet: ${ethers.utils.getAddress(address)}`)) {
    return { ok: false, reason: "message_wallet_mismatch" };
  }
  const issuedLine = message.split("\n").find((line) => line.startsWith("Issued: "));
  const issuedAt = issuedLine ? issuedLine.slice("Issued: ".length) : "";
  const issuedMs = new Date(issuedAt).getTime();
  if (!Number.isFinite(issuedMs) || Math.abs(now - issuedMs) > MAX_AGE_MS) {
    return { ok: false, reason: "challenge_expired" };
  }
  let recovered = "";
  try {
    recovered = normalizeWallet(ethers.utils.verifyMessage(message, signature));
  } catch {
    return { ok: false, reason: "bad_signature" };
  }
  if (recovered !== expectedWallet) return { ok: false, reason: "wrong_wallet" };
  return { ok: true, wallet: recovered, entryRecorded: false };
}
