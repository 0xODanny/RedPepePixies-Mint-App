import "./globals.css";

import type { Metadata } from "next";
import { Inter, Source_Code_Pro, Bangers, VT323 } from "next/font/google";
import ThirdwebProvider from "../components/thirdweb-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceMono = Source_Code_Pro({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: "400",
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Red Pepe Pixies — Mint & Stake on Avalanche",
  description:
    "Mint Red Pepe Pixies NFTs on Avalanche. Hold $RPEPE and earn Pixies through self-custody staking. OG meme NFT since 2023.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/pixies-favicon.png" />
      </head>
      <body
        className={`${inter.variable} ${sourceMono.variable} ${bangers.variable} ${vt323.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThirdwebProvider>{children}</ThirdwebProvider>
      </body>
    </html>
  );
}
