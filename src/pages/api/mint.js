import { ethers } from "ethers";
import raffleAbi from "../../../abi/raffle.json";
import ballnAbi from "../../../abi/balln.json";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { address, quantity, paymentMethod } = req.body;
  const provider = new ethers.providers.JsonRpcProvider(process.env.AVAX_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, raffleAbi, wallet);
  const token = new ethers.Contract(process.env.BALLN_TOKEN_ADDRESS, ballnAbi, provider);

  try {
    if (paymentMethod === "avax") {
      const expected = ethers.utils.parseEther((0.085 * quantity).toFixed(4));
      const history = await provider.getHistory(address);
      const payment = history.reverse().find(tx =>
        tx.to?.toLowerCase() === wallet.address.toLowerCase() &&
        tx.value.eq(expected)
      );

      if (!payment) {
        return res.status(400).json({
          success: false,
          error: "No AVAX payment found. Come in the telegram to mint for less! https://t.me/BALLN3"
        });
      }
    }

    if (paymentMethod === "balln") {
      const expected = ethers.utils.parseUnits((6 * quantity).toString(), 18);
      const transferEvents = await token.queryFilter("Transfer", -10000);

      const match = transferEvents.reverse().find(event =>
        event.args.from.toLowerCase() === address.toLowerCase() &&
        event.args.to.toLowerCase() === wallet.address.toLowerCase() &&
        event.args.value.eq(expected)
      );

      if (!match) {
        return res.status(400).json({
          success: false,
          error: "No BALLN token payment found. Come in the telegram to mint for less! https://t.me/BALLN3"
        });
      }
    }

    const tx = await contract.adminMint(address, quantity);
    await tx.wait();

    const totalSupply = await contract.totalSupply();
    const tokenIds = [];
    for (let i = 0; i < quantity; i++) {
      tokenIds.push(totalSupply - quantity + i + 1);
    }

    res.json({ success: true, tokenIds });
  } catch (err) {
    console.error("Mint error:", err);
    res.status(500).json({ error: err.message });
  }
}