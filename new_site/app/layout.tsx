import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Bangers, VT323 } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bangers.variable} ${vt323.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
