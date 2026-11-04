"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "@thirdweb-dev/react";

const LINKS = [
  { href: "/", label: "Mint" },
  { href: "/#about", label: "About" },
  { href: "/#how-to-mint", label: "How to Mint" },
  { href: "/staking", label: "Staking" },
  { href: "/campaign", label: "Campaign" },
  { href: "https://t.me/redpepeavax1", label: "Community", external: true },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/campaign") return pathname === "/campaign";
  if (href === "/staking") return pathname.startsWith("/staking");
  return false;
}

function NavLink({
  href,
  label,
  external,
  pathname,
}: {
  href: string;
  label: string;
  external?: boolean;
  pathname: string;
}) {
  const resolvedHref = href.startsWith("/#") && pathname === "/" ? href.slice(1) : href;
  const active = isActive(pathname, href);
  const className = active
    ? "text-sm font-semibold whitespace-nowrap"
    : "text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap";
  const style = active ? { color: "var(--rpepe-red)" } : undefined;

  if (external) {
    return (
      <a href={resolvedHref} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {label}
      </a>
    );
  }

  return (
    <Link href={resolvedHref} className={className} style={style} aria-current={active ? "page" : undefined}>
      {label}
    </Link>
  );
}

export default function SiteNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      style={{
        backgroundColor: "rgba(8,8,8,0.95)",
        borderBottom: "1px solid var(--rpepe-border)",
        backdropFilter: "blur(12px)",
      }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Back to the mint">
          <img
            src="https://www.redpepe.meme/red_pepe_mini_logo.png"
            alt=""
            className="w-7 h-7 object-contain"
          />
          <span
            style={{ fontFamily: "var(--font-bangers)", letterSpacing: "0.05em", color: "var(--rpepe-red)" }}
            className="text-xl"
          >
            RED PEPE PIXIES
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {LINKS.map((link) => (
            <NavLink key={link.href} {...link} pathname={pathname} />
          ))}
        </div>

        <ConnectWallet />
      </div>

      <div className="md:hidden flex gap-5 overflow-x-auto px-6 pb-3">
        {LINKS.map((link) => (
          <NavLink key={link.href} {...link} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
