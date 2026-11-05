import type { Metadata } from "next";
import CampaignPreview from "../../components/campaign-preview";
import SiteNav from "../../components/site-nav";

export const metadata: Metadata = {
  title: "Red Pepe Pixies × Pepinho Games",
  description: "Mint a Pixie, play on Pepinho, and take a shot at Sunday prizes. Entries and claims are not open yet.",
};

export default function CampaignPage() {
  return (
    <div style={{ backgroundColor: "var(--rpepe-dark)", color: "#fff" }} className="min-h-screen font-[var(--font-geist-sans)]">
      <SiteNav />
      <CampaignPreview />
    </div>
  );
}
