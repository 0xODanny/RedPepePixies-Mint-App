export const CHAIN_ID = 43114;
export const CHAIN_NAME = "Avalanche C-Chain";
export const EXPECTED_PIXIES_CONTRACT = "0xd4aabf8e83a37cabfdc584d11f589b03a78cfe76";
export const RPEPE_TOKEN = "0x694207A9f708355Ee3119F11E55bc5c0B1845Ba2";
export const RPEPE_DECIMALS = 18;
export const MINT_PRICE_AVAX = "1.33";
export const MINT_URL = "https://www.redpepemint.xyz";

export function sameAddress(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

/** Same fallback order as the mint API. */
export function effectiveMintContract(env = process.env) {
  return (
    env.CONTRACT_ADDRESS ||
    env.PIXIES_CONTRACT_ADDRESS ||
    env.NEXT_PUBLIC_PIXIES_CONTRACT_ADDRESS ||
    ""
  );
}

export function contractStatus(env = process.env) {
  const serverContract = effectiveMintContract(env);
  return {
    chainId: CHAIN_ID,
    chainName: CHAIN_NAME,
    expectedContract: EXPECTED_PIXIES_CONTRACT,
    serverContract,
    matchesExpected: Boolean(serverContract) && sameAddress(serverContract, EXPECTED_PIXIES_CONTRACT),
    rpepeToken: RPEPE_TOKEN,
    mintPriceAvax: MINT_PRICE_AVAX,
    mintUrl: MINT_URL,
  };
}
