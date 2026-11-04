export const ESIM_REDEMPTION_COPY =
  "eSIM prize codes must be redeemed within six months of the date they’re issued. Your exact redemption deadline will be included with your code.";

export const DEFAULT_LINEUP = {
  weeks: 4,
  avaxByPlace: [
    { place: "1st", avax: 3 },
    { place: "2nd", avax: 2 },
    { place: "3rd", avax: 1 },
  ],
  gamepass: { count: 10, months: 1, label: "One-month GamePass" },
  gamepassPlus: { count: 5, months: 1, label: "One-month GamePass+" },
  esim: {
    count: 1,
    tierGb: 20,
    allowedTiersGb: [5, 10, 20],
    week: 4,
  },
  vpn: {
    count: 1,
    months: 6,
    usdPerMonth: 2,
    week: 4,
  },
  internalPlanningTargetUsd: 320,
};

export function assertLineup(lineup = DEFAULT_LINEUP) {
  if (!lineup.esim.allowedTiersGb.includes(lineup.esim.tierGb)) {
    throw new Error(`eSIM tier ${lineup.esim.tierGb} GB is not an allowed prize tier`);
  }
  if (!Number.isInteger(lineup.vpn.months) || lineup.vpn.months < 1) {
    throw new Error("VPN duration must be a positive number of months");
  }
  return lineup;
}

export function weeklyPrizeRows(lineup = DEFAULT_LINEUP) {
  assertLineup(lineup);
  return [
    ...lineup.avaxByPlace.map((row) => ({
      place: row.place,
      award: `${row.avax} AVAX`,
    })),
    { place: `Next ${lineup.gamepass.count}`, award: lineup.gamepass.label },
    { place: `Next ${lineup.gamepassPlus.count}`, award: lineup.gamepassPlus.label },
  ];
}

export function finaleTravelPrizes(lineup = DEFAULT_LINEUP) {
  assertLineup(lineup);
  return [
    {
      award: `One eSIM, up to ${lineup.esim.tierGb} GB`,
      detail: ESIM_REDEMPTION_COPY,
    },
    {
      award: `One ${lineup.vpn.months}-month VPN subscription`,
      detail: "The prize is the subscription length.",
    },
  ];
}

export function seasonCommitment(lineup = DEFAULT_LINEUP) {
  assertLineup(lineup);
  const avaxPerWeek = lineup.avaxByPlace.reduce((sum, row) => sum + row.avax, 0);
  const avax = avaxPerWeek * lineup.weeks;
  const passesPerWeek = lineup.gamepass.count + lineup.gamepassPlus.count;
  const passes = passesPerWeek * lineup.weeks;
  const vpnUsd = lineup.vpn.count * lineup.vpn.months * lineup.vpn.usdPerMonth;
  return {
    avax,
    passes,
    gamepassCount: lineup.gamepass.count * lineup.weeks,
    gamepassPlusCount: lineup.gamepassPlus.count * lineup.weeks,
    vpnUsd,
    esimCostUsd: null,
    modeled: `${avax} AVAX + $${vpnUsd} + actual eSIM cost`,
    internalPlanningTargetUsd: lineup.internalPlanningTargetUsd,
    gamepassRetailExcluded: true,
  };
}

export function budgetImpact(esimQuoteUsd, lineup = DEFAULT_LINEUP) {
  const commitment = seasonCommitment(lineup);
  if (esimQuoteUsd == null || !Number.isFinite(Number(esimQuoteUsd))) {
    return {
      quoted: false,
      modeled: commitment.modeled,
      note: "No eSIM provider quote is loaded. The $320 planning target cannot be reconciled until the winner’s zone cost is known.",
    };
  }
  const quote = Number(esimQuoteUsd);
  const cashUsd = commitment.vpnUsd + quote;
  const headroom = commitment.internalPlanningTargetUsd - cashUsd;
  return {
    quoted: true,
    esimQuoteUsd: quote,
    vpnUsd: commitment.vpnUsd,
    cashUsd,
    avax: commitment.avax,
    planningTargetUsd: commitment.internalPlanningTargetUsd,
    headroomUsd: headroom,
    note:
      headroom >= 0
        ? `Quoted eSIM cost leaves $${headroom} of the $320 planning target after the $${commitment.vpnUsd} VPN prize. AVAX and GamePass retail stay outside that dollar figure.`
        : `Quoted eSIM cost puts cash prizes $${Math.abs(headroom)} above the $320 planning target before AVAX.`,
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

export function buildEsimAward({ issueDate, tierGb, zoneCostUsd, lineup = DEFAULT_LINEUP }) {
  assertLineup({ ...lineup, esim: { ...lineup.esim, tierGb } });
  const issuedOn = issueDate instanceof Date ? issueDate.toISOString().slice(0, 10) : String(issueDate).slice(0, 10);
  return {
    tierGb,
    zoneCostUsd: zoneCostUsd == null ? null : Number(zoneCostUsd),
    issuedOn,
    redeemBy: redemptionDeadline(issuedOn, 6),
    copy: ESIM_REDEMPTION_COPY,
    providerWindowConfirmed: false,
  };
}
