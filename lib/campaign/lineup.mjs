export const ESIM_REDEMPTION_COPY =
  "eSIM prize codes must be redeemed within six months of the date they’re issued. Your exact redemption deadline will be included with your code.";

export const DEFAULT_LINEUP = {
  weeks: 4,
  avaxUsd: 8.36,
  avaxByPlace: [
    { place: "1st", avax: 3, count: 1 },
    { place: "2nd", avax: 2, count: 1 },
    { place: "3rd", avax: 1, count: 1 },
  ],
  gamepass: { count: 2, months: 1, retailUsd: 12, label: "GamePass" },
  gamepassPlus: { count: 1, months: 1, retailUsd: 19, label: "GamePass+" },
  esim: {
    count: 3,
    tierGb: 5,
    finaleCount: 1,
    finaleTierGb: 20,
    allowedTiersGb: [5, 10, 20],
    week: 4,
  },
  vpn: {
    count: 3,
    months: 1,
    finaleCount: 1,
    finaleMonths: 12,
    usdPerMonth: 2,
    week: 4,
  },
};

export function assertLineup(lineup = DEFAULT_LINEUP) {
  if (!lineup.esim.allowedTiersGb.includes(lineup.esim.tierGb)) {
    throw new Error(`eSIM tier ${lineup.esim.tierGb} GB is not an allowed prize tier`);
  }
  if (!lineup.esim.allowedTiersGb.includes(lineup.esim.finaleTierGb)) {
    throw new Error(`Finale eSIM tier ${lineup.esim.finaleTierGb} GB is not an allowed prize tier`);
  }
  if (!Number.isInteger(lineup.vpn.months) || lineup.vpn.months < 1) {
    throw new Error("VPN duration must be a positive number of months");
  }
  if (!Number.isInteger(lineup.vpn.finaleMonths) || lineup.vpn.finaleMonths < 1) {
    throw new Error("Finale VPN duration must be a positive number of months");
  }
  return lineup;
}

export function weeklyPrizeRows(lineup = DEFAULT_LINEUP) {
  assertLineup(lineup);
  return [
    ...lineup.avaxByPlace.map((row) => ({
      id: `avax-${row.avax}`,
      kind: "avax",
      count: row.count,
      title: `${row.avax} AVAX`,
      detail: "1 prize",
    })),
    {
      id: "gamepass",
      kind: "gamepass",
      count: lineup.gamepass.count,
      title: lineup.gamepass.label,
      detail: `${lineup.gamepass.months} month`,
    },
    {
      id: "gamepass-plus",
      kind: "gamepass-plus",
      count: lineup.gamepassPlus.count,
      title: lineup.gamepassPlus.label,
      detail: `${lineup.gamepassPlus.months} month`,
    },
    {
      id: "esim",
      kind: "esim",
      count: lineup.esim.count,
      title: "eSIM",
      detail: `up to ${lineup.esim.tierGb} GB`,
    },
    {
      id: "vpn",
      kind: "vpn",
      count: lineup.vpn.count,
      title: "VPN",
      detail: `${lineup.vpn.months} month`,
    },
  ];
}

export function finaleTravelPrizes(lineup = DEFAULT_LINEUP) {
  assertLineup(lineup);
  return [
    {
      id: "finale-esim",
      kind: "esim",
      count: lineup.esim.finaleCount,
      title: "eSIM",
      detail: `up to ${lineup.esim.finaleTierGb} GB`,
      copy: ESIM_REDEMPTION_COPY,
    },
    {
      id: "finale-vpn",
      kind: "vpn",
      count: lineup.vpn.finaleCount,
      title: "VPN",
      detail: `${lineup.vpn.finaleMonths} months`,
    },
  ];
}

function cents(value) {
  return Math.round(value * 100) / 100;
}

export function seasonCommitment(lineup = DEFAULT_LINEUP) {
  assertLineup(lineup);
  const avaxPerWeek = lineup.avaxByPlace.reduce((sum, row) => sum + row.avax * row.count, 0);
  const avax = avaxPerWeek * lineup.weeks;
  const gamepassCount = lineup.gamepass.count * lineup.weeks;
  const gamepassPlusCount = lineup.gamepassPlus.count * lineup.weeks;
  const weeklyEsimCount = lineup.esim.count * lineup.weeks;
  const finaleEsimCount = lineup.esim.finaleCount;
  const weeklyVpnMonths = lineup.vpn.count * lineup.vpn.months * lineup.weeks;
  const finaleVpnMonths = lineup.vpn.finaleCount * lineup.vpn.finaleMonths;
  const vpnMonths = weeklyVpnMonths + finaleVpnMonths;
  const avaxUsd = cents(avax * lineup.avaxUsd);
  const vpnUsd = cents(vpnMonths * lineup.vpn.usdPerMonth);
  const cashUsd = cents(avaxUsd + vpnUsd);
  const gamepassRetailUsd = cents(
    gamepassCount * lineup.gamepass.retailUsd + gamepassPlusCount * lineup.gamepassPlus.retailUsd
  );
  return {
    avax,
    gamepassCount,
    gamepassPlusCount,
    passes: gamepassCount + gamepassPlusCount,
    weeklyEsimCount,
    finaleEsimCount,
    esimTierGb: lineup.esim.tierGb,
    finaleEsimTierGb: lineup.esim.finaleTierGb,
    vpnMonths,
    avaxUsd,
    vpnUsd,
    cashUsd,
    esimCostUsd: null,
    gamepassRetailUsd,
    modeled: `$${cashUsd} + actual eSIM cost`,
    gamepassRetailExcluded: true,
  };
}

export function budgetImpact(esimQuoteUsd, lineup = DEFAULT_LINEUP) {
  const commitment = seasonCommitment(lineup);
  if (esimQuoteUsd == null || !Number.isFinite(Number(esimQuoteUsd))) {
    return {
      quoted: false,
      cashUsd: commitment.cashUsd,
      avaxUsd: commitment.avaxUsd,
      vpnUsd: commitment.vpnUsd,
      esimCostUsd: null,
      gamepassRetailUsd: commitment.gamepassRetailUsd,
      modeled: commitment.modeled,
      note: "No eSIM provider quote is loaded. Cash cost is AVAX plus VPN, and the eSIM cost stays open. GamePass retail is separate.",
    };
  }
  const quote = Number(esimQuoteUsd);
  return {
    quoted: true,
    cashUsd: cents(commitment.cashUsd + quote),
    avaxUsd: commitment.avaxUsd,
    vpnUsd: commitment.vpnUsd,
    esimQuoteUsd: quote,
    gamepassRetailUsd: commitment.gamepassRetailUsd,
    modeled: commitment.modeled,
    note: "GamePass retail stays outside the cash cost. The eSIM figure is the supplied quote, not a player-facing price.",
  };
}

/** Six calendar months from the issue date. Month-end dates clamp to the target month. */
export function redemptionDeadline(issueDate, months = 6) {
  const source = issueDate instanceof Date ? issueDate : new Date(`${issueDate}T00:00:00.000Z`);
  if (Number.isNaN(source.getTime())) throw new Error("Invalid eSIM issue date");
  const year = source.getUTCFullYear();
  const month = source.getUTCMonth();
  const day = source.getUTCDate();
  const target = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

export function buildEsimAward({ issueDate, tierGb, zone, zoneCostUsd, lineup = DEFAULT_LINEUP }) {
  assertLineup({ ...lineup, esim: { ...lineup.esim, tierGb } });
  const issuedOn = issueDate instanceof Date ? issueDate.toISOString().slice(0, 10) : String(issueDate).slice(0, 10);
  return {
    tierGb,
    zone: zone == null ? null : String(zone),
    zoneCostUsd: zoneCostUsd == null ? null : Number(zoneCostUsd),
    issuedOn,
    redeemBy: redemptionDeadline(issuedOn, 6),
    copy: ESIM_REDEMPTION_COPY,
    providerWindowConfirmed: false,
  };
}
