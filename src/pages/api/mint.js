import { ethers } from "ethers";
import raffleAbi from "../../../abi/raffle.json";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { address, quantity } = req.body;

  const provider = new ethers.providers.JsonRpcProvider(process.env.AVAX_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, raffleAbi, wallet);

  try {
    const tx = await contract.adminMint(address, quantity);
    const receipt = await tx.wait();

    const iface = new ethers.utils.Interface(raffleAbi);

    const tokenIds = receipt.logs.reduce((acc, log) => {
      try {
        const parsed = iface.parseLog(log);
        if (
          parsed.name === "Transfer" &&
          parsed.args.to.toLowerCase() === address.toLowerCase()
        ) {
          acc.push(parsed.args.tokenId.toString());
        }
      } catch {
        // Ignore logs that can't be parsed
      }
      return acc;
    }, []);

    res.json({ success: true, tokenIds });
  } catch (err) {
    console.error("Mint error:", err);
    res.status(500).json({ error: err.message });
  }
}