"use client";

import React from "react";
import {
  ThirdwebProvider as TWProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  rainbowWallet,
  coreWallet,
  rabbyWallet,
} from "@thirdweb-dev/react";

const activeChain = {
  chainId: 43114,
  rpc: ["https://api.avax.network/ext/bc/C/rpc"],
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  shortName: "avax",
  slug: "avalanche",
  name: "Avalanche",
  testnet: false,
};

// "Other Wallets" — opens the official WalletConnect Explorer modal.
// That modal shows a searchable list of 500+ wallets with deep-link buttons,
// so mobile users can tap their wallet of choice (Rabby, Trust, etc.) without
// needing to scan a QR code on the same device they're browsing from.
const _wcOther = walletConnect({ qrModal: "walletConnect" });
const otherWalletsCfg = {
  ..._wcOther,
  id: "other-wallets",
  meta: {
    ..._wcOther.meta,
    name: "Other Wallets",
    // magnifying-glass / search icon to signal "browse wallets"
    iconURL:
      "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2228%22%20viewBox%3D%220%200%2028%2028%22%3E%3Crect%20width%3D%2228%22%20height%3D%2228%22%20rx%3D%226%22%20fill%3D%22%232563eb%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%225%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20fill%3D%22none%22%2F%3E%3Cline%20x1%3D%2216%22%20y1%3D%2216%22%20x2%3D%2222%22%20y2%3D%2222%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E",
  },
};

export default function ThirdwebProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TWProvider
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      activeChain={activeChain}
      supportedWallets={[
        metamaskWallet(),
        coreWallet(),
        rabbyWallet(),
        coinbaseWallet(),
        rainbowWallet(),
        walletConnect(),
        otherWalletsCfg,
      ]}
    >
      {children}
    </TWProvider>
  );
}
