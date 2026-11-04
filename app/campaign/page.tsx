import type { Metadata } from "next";
import CampaignPreview from "../../components/campaign-preview";
import SiteNav from "../../components/site-nav";

export const metadata: Metadata = {
  title: "Red Pepe Pixies × Pepinho Games",
  description: "Free Sunday draw for Red Pepe Pixies and Pepinho Games. Entries and claims are not open yet.",
};

export default function CampaignPage() {
  return (
    <div style={{ backgroundColor: "var(--rpepe-dark)", color: "#fff" }} className="min-h-screen font-[var(--font-geist-sans)]">
      <SiteNav />
      <CampaignPreview />
    </div>
  );
}
