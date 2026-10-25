// Iran Conflict Data - Living Data Layer
// This file contains all time-series and reference data used by charts across the site.
// Designed to support Field Notes updates with timestamped scenario probability revisions.

import { getOilPrice, EIA_SOURCE_ATTRIBUTION } from './oilPriceData';

// Re-export for convenience
export { EIA_SOURCE_ATTRIBUTION };

// =============================================================================
// METADATA
// =============================================================================

export const conflictMetadata = {
  lastUpdated: '2026-04-26T18:00:00Z',
  conflictDay: 58,
  conflictStartDate: '2026-02-28',
};

// Helper to format date for display (e.g., "Mar 5")
export const formatShortDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to format full date (e.g., "March 5, 2026")
export const formatFullDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface TimeSeriesEntry {
  date: string;
  timestamp: number; // Unix timestamp for sorting
}

export interface HormuzTransitEntry extends TimeSeriesEntry {
  tankerCount: number;
  vlccRate: number;
  event?: string;
}

export interface CasualtyEntry extends TimeSeriesEntry {
  iranianKilled: number;
  iranianCivilian: number;
  usKilled: number;
  gccCivilian: number;
  note?: string;
}

export interface MarketEntry extends TimeSeriesEntry {
  brentCrude: number;
  wti: number;
  naturalGas: number;
  goldSpot: number;
  spx?: number;
  vix?: number;
  hySpread?: number;
  event?: string;
}

export interface GasPriceEntry extends TimeSeriesEntry {
  usAverage: number;
  california: number;
  change?: number;
  note?: string;
}

export interface AsianMarketEntry extends TimeSeriesEntry {
  nikkei: number;
  nikkeiChange: number;
  hangseng: number;
  hangsengChange: number;
  kospi: number;
  kospiChange: number;
  sensex: number;
  sensexChange: number;
  note?: string;
}

export interface InterceptorStatusEntry extends TimeSeriesEntry {
  patriotPac3Remaining: number;
  sm3Remaining: number;
  thaadRemaining: number;
  arrowRemaining: number;
  totalExpenditure: number;
  note?: string;
}

export interface ConflictGeographyEntry {
  location: string;
  lat: number;
  lng: number;
  type: 'strike' | 'damage' | 'shipping' | 'naval' | 'base';
  date: string;
  description: string;
}

export interface ConflictEvent {
  date: string;
  day: number;
  lat: number;
  lng: number;
  type: 'strike_us' | 'strike_iran' | 'strike_israel' | 'shipping' | 'infrastructure_energy' | 'infrastructure_water' | 'naval' | 'ground_offensive' | 'interception' | 'military' | 'political' | 'diplomatic';
  target: string;
  description: string;
  impact?: string;
  status?: 'confirmed' | 'reported' | 'unconfirmed';
}

export interface ScenarioProbability {
  scenario: string;
  probability: number;
}

export interface ScenarioUpdate {
  date: string;
  timestamp: number;
  day: number;
  probabilities: ScenarioProbability[];
  rationale: string;
  keyDevelopments: string[];
}

export interface CostAsymmetryItem {
  name: string;
  shortName: string;
  iranCost: number;
  interceptorCost: number;
  ratio: number;
  category: 'drone' | 'missile';
  iranLabel: string;
  interceptorLabel: string;
}

export interface SectorVulnerabilityItem {
  sector: string;
  leverage: number;
  refinancingExposure: number;
  oilSensitivity: number;
  consumerDependence: number;
  currentSpread: number;
  notes: string;
  color: string;
}

export interface HySpreadHistoryEntry {
  date: string;
  spread: number;
  event?: string;
  isCurrent?: boolean;
}

export interface ThesisScorecard {
  thesis: string;
  initialConfidence: number;
  currentConfidence: number;
  status: 'confirmed' | 'developing' | 'challenged' | 'invalidated';
  evidence: string[];
}

export interface FieldNoteDay {
  day: number;
  date: string;
  title: string;
  summary: string;
  thesisScorecard: ThesisScorecard[];
  scenarioUpdate: ScenarioUpdate;
  keyDevelopments: {
    category: string;
    items: string[];
  }[];
  marketSnapshot: {
    brentCrude: number;
    vlccRate: number;  // NOTE: VLCC rates are estimates - no live API available
    hySpread: number;
    vix: number;
    usGas: number;
  };
  tradingImplications: string[];
}

// =============================================================================
// TIME SERIES DATA
// =============================================================================

export const hormuzTimeline: HormuzTransitEntry[] = [
  { date: 'Feb 27', timestamp: Date.parse('2026-02-27'), tankerCount: 120, vlccRate: 170000, event: 'Pre-conflict normal' },
  { date: 'Feb 28', timestamp: Date.parse('2026-02-28'), tankerCount: 17, vlccRate: 218000, event: 'Operation Epic Fury begins' },
  { date: 'Mar 1', timestamp: Date.parse('2026-03-01'), tankerCount: 4, vlccRate: 300000, event: 'Insurance withdrawal begins' },
  { date: 'Mar 2', timestamp: Date.parse('2026-03-02'), tankerCount: 0, vlccRate: 424000, event: "Zero transits. Lloyd's cancellation announced. VLCC record" },
  { date: 'Mar 3', timestamp: Date.parse('2026-03-03'), tankerCount: 0, vlccRate: 445000, event: 'Zero transits continue. Trump announces naval escorts' },
  { date: 'Mar 4', timestamp: Date.parse('2026-03-04'), tankerCount: 5, vlccRate: 315000, event: '5 transits (3 outbound only). P&I coverage expires midnight Mar 5' },
  { date: 'Mar 5', timestamp: Date.parse('2026-03-05'), tankerCount: 0, vlccRate: 460000, event: "Lloyd's war risk cancellation takes effect. ~200 tankers stranded. 60 VLCCs trapped (8% of global fleet)" },
  { date: 'Mar 6', timestamp: Date.parse('2026-03-06'), tankerCount: 3, vlccRate: 445000, event: 'Selective transit emerges — China/Iran-linked vessels only. Israel launches broad wave on Tehran' },
  { date: 'Mar 7', timestamp: Date.parse('2026-03-07'), tankerCount: 3, vlccRate: 440000, event: '3 transits (Palau, Iran, Liberia flagged). GPS jamming affects 1,650+ ships' },
  { date: 'Mar 8', timestamp: Date.parse('2026-03-08'), tankerCount: 2, vlccRate: 450000, event: 'Selective access continuing. Mojtaba Khamenei named Supreme Leader' },
  { date: 'Mar 9', timestamp: Date.parse('2026-03-09'), tankerCount: 1, vlccRate: 455000, event: 'Near-zero Western transits. Oil breaches $100, hits $119 intraday' },
  { date: 'Mar 10', timestamp: Date.parse('2026-03-10'), tankerCount: 2, vlccRate: 460000, event: "Iran mines reported in Hormuz (CNN). Trump warns Iran to remove mines 'IMMEDIATELY.' Mojtaba Khamenei says Hormuz should remain closed as 'tool to pressure enemy.'" },
  { date: 'Mar 11', timestamp: Date.parse('2026-03-11'), tankerCount: 3, vlccRate: 450000, event: 'US destroys 16 mine-laying vessels near Hormuz. Thai bulk carrier Mayuree Naree struck and set ablaze. Container ship Express Rome hit. Japanese One Majesty damaged at anchor.' },
  { date: 'Mar 12', timestamp: Date.parse('2026-03-12'), tankerCount: 2, vlccRate: 460000, event: '3 more ships struck overnight. Iraq shuts down oil port operations after tanker attacks at Basra. Iran says some ships allowed through with permission. IRGC: all ships must get Iran approval or face attack.' },
  { date: 'Mar 13', timestamp: Date.parse('2026-03-13'), tankerCount: 3, vlccRate: 460000, event: 'Iran considering yuan-only Hormuz transit. Two Indian LPG carriers allowed through. Petrodollar disruption emerging.' },
  { date: 'Mar 14', timestamp: Date.parse('2026-03-14'), tankerCount: 2, vlccRate: 465000, event: 'US bombs Kharg Island military targets. Trump threatens oil infrastructure next. Iran warns $200 oil if energy facilities hit.' },
  { date: 'Mar 15', timestamp: Date.parse('2026-03-15'), tankerCount: 2, vlccRate: 465000, event: 'Iran FM denies ceasefire. Hezbollah drone hits Cyprus RAF base. 6 US crew from KC-135 crash confirmed.' },
  { date: 'Mar 16', timestamp: Date.parse('2026-03-16'), tankerCount: 2, vlccRate: 468000, event: 'FCC Chair threatens broadcaster licenses. Formula One cancels Bahrain and Saudi GPs. Israel expands Lebanon ground ops.' },
  { date: 'Mar 17', timestamp: Date.parse('2026-03-17'), tankerCount: 2, vlccRate: 470000, event: 'Larijani killed — last viable negotiation partner eliminated. IRGC warns military lost control of several units.' },
  { date: 'Mar 18', timestamp: Date.parse('2026-03-18'), tankerCount: 1, vlccRate: 485000, event: "Israel strikes South Pars. Iran retaliates against Ras Laffan — world's largest LNG facility. 17% export capacity lost, 5 years to repair." },
  { date: 'Mar 19', timestamp: Date.parse('2026-03-19'), tankerCount: 2, vlccRate: 490000, event: 'Brent spikes to $119 intraday. Goldman warns oil could exceed $147 all-time high. JPMorgan cuts S&P year-end target.' },
  { date: 'Mar 20', timestamp: Date.parse('2026-03-20'), tankerCount: 2, vlccRate: 495000, event: "Trump rejects ceasefire. Calls NATO 'cowards.' Strikes hit Tehran during Nowruz. Senior Iranian source: strait 'will not return to pre-war conditions.'" },
  { date: 'Mar 21', timestamp: Date.parse('2026-03-21'), tankerCount: 2, vlccRate: 498000, event: "Kuwait Mina al-Ahmadi refinery hit (730K bpd). 21 ships attacked total (UKMTO). Trump considers 'winding down.'" },
  { date: 'Mar 22', timestamp: Date.parse('2026-03-22'), tankerCount: 1, vlccRate: 510000, event: "Trump 48hr ultimatum: open Hormuz or power plants obliterated. Iran: permanent Hormuz closure if hit. Brent surges to $114." },
  { date: 'Mar 23', timestamp: Date.parse('2026-03-23'), tankerCount: 3, vlccRate: 480000, event: "POTENTIAL TURNING POINT: Trump delays strikes, 'productive conversations.' Pezeshkian softens Hormuz language. Oil crashes 13%." },
];

export const casualtyTimeline: CasualtyEntry[] = [
  { date: 'Feb 28', timestamp: Date.parse('2026-02-28'), iranianKilled: 0, iranianCivilian: 0, usKilled: 0, gccCivilian: 0, note: 'Operation begins' },
  { date: 'Mar 1', timestamp: Date.parse('2026-03-01'), iranianKilled: 245, iranianCivilian: 87, usKilled: 2, gccCivilian: 34, note: 'Initial strikes' },
  { date: 'Mar 2', timestamp: Date.parse('2026-03-02'), iranianKilled: 520, iranianCivilian: 156, usKilled: 4, gccCivilian: 89, note: 'Hezbollah enters' },
  { date: 'Mar 3', timestamp: Date.parse('2026-03-03'), iranianKilled: 780, iranianCivilian: 268, usKilled: 6, gccCivilian: 145, note: 'Minab school incident' },
  { date: 'Mar 4', timestamp: Date.parse('2026-03-04'), iranianKilled: 1045, iranianCivilian: 380, usKilled: 6, gccCivilian: 178, note: 'Naval losses' },
  { date: 'Mar 5', timestamp: Date.parse('2026-03-05'), iranianKilled: 1230, iranianCivilian: 420, usKilled: 6, gccCivilian: 195, note: 'Azerbaijan airport struck. WHO: 13 attacks on Iranian health infrastructure' },
  { date: 'Mar 6', timestamp: Date.parse('2026-03-06'), iranianKilled: 1400, iranianCivilian: 480, usKilled: 6, gccCivilian: 210, note: 'Tehran residential areas hit overnight. Beirut evacuation ordered (500K+ people)' },
  { date: 'Mar 7', timestamp: Date.parse('2026-03-07'), iranianKilled: 1650, iranianCivilian: 550, usKilled: 6, gccCivilian: 225, note: 'Israel hits 400+ targets, 1,465 munitions. Mehrabad Airport destroyed. PRIMA tanker struck' },
  { date: 'Mar 8', timestamp: Date.parse('2026-03-08'), iranianKilled: 1900, iranianCivilian: 620, usKilled: 7, gccCivilian: 245, note: 'Oil infrastructure targeted. Saudi first fatalities (2 dead, 12 injured). Bahrain desalination plant hit' },
  { date: 'Mar 9', timestamp: Date.parse('2026-03-09'), iranianKilled: 2150, iranianCivilian: 690, usKilled: 8, gccCivilian: 260, note: '8th US soldier killed. Oil breaches $100. Iran nationwide allegiance gathering' },
  { date: 'Mar 10', timestamp: Date.parse('2026-03-10'), iranianKilled: 2350, iranianCivilian: 720, usKilled: 8, gccCivilian: 275, note: '8th US service member dies. Iran mining Hormuz. Qatar shoots down 2 Iranian Su-24 bombers.' },
  { date: 'Mar 11', timestamp: Date.parse('2026-03-11'), iranianKilled: 2500, iranianCivilian: 800, usKilled: 8, gccCivilian: 290, note: 'US confirms 140 service members wounded in first 10 days. 16 Iranian mine-laying vessels destroyed.' },
  { date: 'Mar 12', timestamp: Date.parse('2026-03-12'), iranianKilled: 2650, iranianCivilian: 1348, usKilled: 8, gccCivilian: 310, note: 'Iran UN rep: 1,348 civilians killed, 17,000+ injured. UNICEF: 1,100+ children injured or killed.' },
  { date: 'Mar 13', timestamp: Date.parse('2026-03-13'), iranianKilled: 5844, iranianCivilian: 1444, usKilled: 13, gccCivilian: 826, note: '1,444 civilians + 4,400 military killed in Iran. 826 killed in Lebanon. 13+ US dead. 140 wounded. US refueling plane crashes in Iraq — 6 crew killed.' },
  { date: 'Mar 15', timestamp: Date.parse('2026-03-15'), iranianKilled: 5844, iranianCivilian: 1444, usKilled: 13, gccCivilian: 826, note: '6 crew from KC-135 crash in Iraq confirmed dead. Iran FM denies ceasefire.' },
  { date: 'Mar 17', timestamp: Date.parse('2026-03-17'), iranianKilled: 5844, iranianCivilian: 1444, usKilled: 13, gccCivilian: 900, note: 'Larijani killed. De facto post-Khamenei leader eliminated.' },
  { date: 'Mar 20', timestamp: Date.parse('2026-03-20'), iranianKilled: 5844, iranianCivilian: 1444, usKilled: 13, gccCivilian: 1000, note: 'Iranian Red Crescent: 204 children among 1,444 civilians killed. Lebanon exceeds 1,000 dead.' },
  { date: 'Mar 22', timestamp: Date.parse('2026-03-22'), iranianKilled: 5844, iranianCivilian: 1444, usKilled: 13, gccCivilian: 1000, note: 'Iranian missiles hit Dimona and Arad near Israeli nuclear center. 100+ Israelis injured. First strike near nuclear facility.' },
  { date: 'Mar 24', timestamp: Date.parse('2026-03-24'), iranianKilled: 6000, iranianCivilian: 1444, usKilled: 19, gccCivilian: 1100, note: 'US dead: 13 combat + 6 plane crash. 290 wounded (doubled in 2 weeks). 82,000 civilian structures destroyed in Iran. 15 Israelis, 4 Palestinians killed by Iranian strikes. Lebanon 1,000+.' },
  { date: 'Mar 25', timestamp: Date.parse('2026-03-25'), iranianKilled: 6300, iranianCivilian: 1500, usKilled: 19, gccCivilian: 1172, note: 'Hengaw: 5,300+ Iranian military killed (up from 4,400). Lebanon: 1,072 killed, 2,966 wounded. 33 deaths in Lebanon in last 24 hours. IRGC navy chief killed. Bushehr nuclear complex struck.' },
  { date: 'Mar 27', timestamp: Date.parse('2026-03-27'), iranianKilled: 6500, iranianCivilian: 1600, usKilled: 13, gccCivilian: 1200, note: '15 US wounded at Prince Sultan (5 critical). Russia provided Iran satellite imagery for targeting. IAEA: Arak reactor no longer operational.' },
  { date: 'Mar 29', timestamp: Date.parse('2026-03-29'), iranianKilled: 6700, iranianCivilian: 1700, usKilled: 13, gccCivilian: 1250, note: 'Pentagon confirms 13 US killed, 300+ wounded. 18 Israeli civilians killed, 5,492 injured. Iran military: 5,300+. Lebanon: 1,072 killed. Houthis enter war.' },
];

// Market timeline with EIA-sourced oil prices where available
// Oil prices from: U.S. Energy Information Administration (EIA)
// See oilPriceData.ts for authoritative daily oil price data
export const marketTimeline: MarketEntry[] = [
  // Pre-conflict baseline
  { date: 'Feb 27', timestamp: Date.parse('2026-02-27'), brentCrude: 71.32, wti: 66.96, naturalGas: 2.85, goldSpot: 2845, spx: 5980, vix: 15.2, hySpread: 281 },
  // Conflict begins (Day 1)
  { date: 'Feb 28', timestamp: Date.parse('2026-02-28'), brentCrude: 73.00, wti: 68.50, naturalGas: 2.95, goldSpot: 2912, spx: 5820, vix: 24.5, hySpread: 295, event: 'Operation Epic Fury begins' },
  // March - Weekend gap (no EIA data for Mar 1)
  { date: 'Mar 2', timestamp: Date.parse('2026-03-02'), brentCrude: 77.24, wti: 71.13, naturalGas: 3.35, goldSpot: 3045, spx: 5520, vix: 38.4, hySpread: 358 },
  { date: 'Mar 3', timestamp: Date.parse('2026-03-03'), brentCrude: 83.28, wti: 74.48, naturalGas: 3.55, goldSpot: 3089, spx: 5480, vix: 35.8, hySpread: 372 },
  { date: 'Mar 4', timestamp: Date.parse('2026-03-04'), brentCrude: 81.56, wti: 74.58, naturalGas: 3.70, goldSpot: 3125, spx: 5395, vix: 41.2, hySpread: 395 },
  { date: 'Mar 5', timestamp: Date.parse('2026-03-05'), brentCrude: 88.59, wti: 80.88, naturalGas: 3.85, goldSpot: 5121, spx: 5830.71, vix: 26.5, hySpread: 410, event: 'P&I insurance expires. WTI biggest single-day gain since May 2020' },
  { date: 'Mar 6', timestamp: Date.parse('2026-03-06'), brentCrude: 95.74, wti: 90.77, naturalGas: 3.95, goldSpot: 5180, spx: 5750, vix: 27.0, hySpread: 425, event: 'Zero Hormuz transits. Israel broad wave on Tehran' },
  // Weekend gap (no EIA data for Mar 7-8)
  { date: 'Mar 9', timestamp: Date.parse('2026-03-09'), brentCrude: 94.35, wti: 94.65, naturalGas: 4.50, goldSpot: 5100, spx: 5480, vix: 29.48, hySpread: 475, event: 'Oil breaches $100 intraday. Largest single-day $ gain since 1988. Asia crashes' },
  { date: 'Mar 10', timestamp: Date.parse('2026-03-10'), brentCrude: 89.84, wti: 83.71, naturalGas: 4.60, goldSpot: 5120, spx: 5365, vix: 28.5, hySpread: 485, event: 'Iran mines the strait. Oil collapses on Trump rhetoric' },
  { date: 'Mar 11', timestamp: Date.parse('2026-03-11'), brentCrude: 90.98, wti: 86.80, naturalGas: 4.55, goldSpot: 5080, spx: 5354, vix: 27.2, hySpread: 480, event: '400M barrel SPR release announced. CPI: Feb inflation at 2.4% YoY' },
  { date: 'Mar 12', timestamp: Date.parse('2026-03-12'), brentCrude: 102.38, wti: 95.61, naturalGas: 4.70, goldSpot: 5150, spx: 5295, vix: 24.77, hySpread: 495, event: '$100 floor established. Brent first close above $100 since Aug 2022' },
  { date: 'Mar 13', timestamp: Date.parse('2026-03-13'), brentCrude: 103.23, wti: 98.48, naturalGas: 4.80, goldSpot: 5180, spx: 5275, vix: 25.5, hySpread: 505, event: 'Yuan-denominated transit emerges. S&P first 3-week losing streak in a year' },
  // Weekend gap (no EIA data for Mar 14-15)
  { date: 'Mar 16', timestamp: Date.parse('2026-03-16'), brentCrude: 101.04, wti: 93.39, naturalGas: 5.00, goldSpot: 5240, spx: 5210, vix: 27.0, hySpread: 525, event: 'F1 cancels Gulf races. FCC threatens broadcaster licenses' },
  { date: 'Mar 17', timestamp: Date.parse('2026-03-17'), brentCrude: 108.39, wti: 96.01, naturalGas: 5.05, goldSpot: 5260, spx: 5190, vix: 27.5, hySpread: 530, event: 'Ali Larijani killed in strikes. Key negotiator eliminated' },
  { date: 'Mar 18', timestamp: Date.parse('2026-03-18'), brentCrude: 118.09, wti: 96.12, naturalGas: 5.15, goldSpot: 5300, spx: 5100, vix: 30.0, hySpread: 550, event: 'Ras Laffan struck. QatarEnergy: 17% export capacity lost' },
  { date: 'Mar 19', timestamp: Date.parse('2026-03-19'), brentCrude: 111.05, wti: 96.11, naturalGas: 5.25, goldSpot: 5350, spx: 6606.49, vix: 31.0, hySpread: 560, event: 'Goldman warns $147 possible. JPMorgan cuts S&P target' },
  { date: 'Mar 20', timestamp: Date.parse('2026-03-20'), brentCrude: 118.42, wti: 98.71, naturalGas: 5.30, goldSpot: 5380, spx: 6506.48, vix: 26.78, hySpread: 570, event: 'Three weeks, no ceasefire. Trump rejects talks, calls NATO cowards' },
  // Weekend gap (no EIA data for Mar 21-22)
  { date: 'Mar 23', timestamp: Date.parse('2026-03-23'), brentCrude: 103.79, wti: 89.33, naturalGas: 5.10, goldSpot: 5320, spx: 6650, vix: 24.0, hySpread: 540, event: 'First US-Iran communication. Oil crashes 11%. S&P swings +3%' },
  { date: 'Mar 24', timestamp: Date.parse('2026-03-24'), brentCrude: 108.42, wti: 93.18, naturalGas: 5.25, goldSpot: 5380, spx: 6580, vix: 26.5, hySpread: 555, event: '$580M insider trading probe. Port Arthur refinery explodes' },
  { date: 'Mar 25', timestamp: Date.parse('2026-03-25'), brentCrude: 109.14, wti: 91.51, naturalGas: 5.00, goldSpot: 5350, spx: 6720, vix: 23.5, hySpread: 530, event: 'Iran rejects 15-point plan. Bushehr nuclear complex struck' },
  { date: 'Mar 26', timestamp: Date.parse('2026-03-26'), brentCrude: 113.39, wti: 96.18, naturalGas: 5.10, goldSpot: 5400, spx: 6650, vix: 25.5, hySpread: 545, event: 'Steel factories struck. Iran blocks 3 container ships' },
  { date: 'Mar 27', timestamp: Date.parse('2026-03-27'), brentCrude: 121.47, wti: 101.26, naturalGas: 5.25, goldSpot: 5450, spx: 6580, vix: 28.0, hySpread: 560, event: 'WTI breaks $100. Russia gave Iran satellite imagery. Gas $3.93/gal' },
  // Weekend gap (no EIA data for Mar 28-29)
  { date: 'Mar 30', timestamp: Date.parse('2026-03-30'), brentCrude: 121.88, wti: 104.69, naturalGas: 5.40, goldSpot: 5520, spx: 6369, vix: 31.05, hySpread: 580, event: 'Week 5 begins. IEA: biggest oil shock in history' },
  { date: 'Mar 31', timestamp: Date.parse('2026-03-31'), brentCrude: 112.78, wti: 106.50, naturalGas: 5.45, goldSpot: 5550, spx: 6320, vix: 28.5, hySpread: 590, event: 'March closes +63%. Gas hits $4.02/gal. IRGC threatens 18 US tech companies' },
  { date: 'Apr 1', timestamp: Date.parse('2026-04-01'), brentCrude: 104.86, wti: 98.20, naturalGas: 5.50, goldSpot: 5580, spx: 6400, vix: 24.54, hySpread: 585, event: 'Trump primetime address. Claims war "nearing completion"' },
  { date: 'Apr 2', timestamp: Date.parse('2026-04-02'), brentCrude: 109.40, wti: 110.47, naturalGas: 5.55, goldSpot: 5600, spx: 6350, vix: 24.54, hySpread: 595, event: 'Post-speech oil surge. IEA: April will be "much worse than March"' },
];

export const gasPrices: GasPriceEntry[] = [
  { date: 'Feb 27', timestamp: Date.parse('2026-02-27'), usAverage: 2.98, california: 4.50 },
  { date: 'Feb 28', timestamp: Date.parse('2026-02-28'), usAverage: 3.02, california: 4.58, change: 0.04, note: 'Initial reaction' },
  { date: 'Mar 1', timestamp: Date.parse('2026-03-01'), usAverage: 3.08, california: 4.68, change: 0.06 },
  { date: 'Mar 2', timestamp: Date.parse('2026-03-02'), usAverage: 3.14, california: 4.78, change: 0.06 },
  { date: 'Mar 3', timestamp: Date.parse('2026-03-03'), usAverage: 3.20, california: 4.88, change: 0.06 },
  { date: 'Mar 4', timestamp: Date.parse('2026-03-04'), usAverage: 3.26, california: 4.98, change: 0.06 },
  { date: 'Mar 5', timestamp: Date.parse('2026-03-05'), usAverage: 3.30, california: 5.05, change: 0.04, note: 'Trump refuses to tap SPR' },
  { date: 'Mar 6', timestamp: Date.parse('2026-03-06'), usAverage: 3.34, california: 5.12, change: 0.04 },
  { date: 'Mar 7', timestamp: Date.parse('2026-03-07'), usAverage: 3.38, california: 5.20, change: 0.04 },
  { date: 'Mar 8', timestamp: Date.parse('2026-03-08'), usAverage: 3.42, california: 5.28, change: 0.04 },
  { date: 'Mar 9', timestamp: Date.parse('2026-03-09'), usAverage: 3.478, california: 5.40, change: 0.058, note: 'AAA confirmed. Up $0.50 in one week. Experts project $4.00 by end of March' },
  { date: 'Mar 10', timestamp: Date.parse('2026-03-10'), usAverage: 3.52, california: 5.48, change: 0.042 },
  { date: 'Mar 11', timestamp: Date.parse('2026-03-11'), usAverage: 3.58, california: 5.55, change: 0.06 },
  { date: 'Mar 12', timestamp: Date.parse('2026-03-12'), usAverage: 3.60, california: 5.62, change: 0.02, note: 'AAA: $3.60/gal. Greece caps gasoline profit margins for 3 months.' },
  { date: 'Mar 14', timestamp: Date.parse('2026-03-14'), usAverage: 3.60, california: 5.65, change: 0.03, note: 'Gas prices steady despite oil above $100.' },
  { date: 'Mar 16', timestamp: Date.parse('2026-03-16'), usAverage: 3.65, california: 5.72, change: 0.05 },
  { date: 'Mar 18', timestamp: Date.parse('2026-03-18'), usAverage: 3.75, california: 5.85, change: 0.10, note: 'Ras Laffan strike spikes energy prices.' },
  { date: 'Mar 20', timestamp: Date.parse('2026-03-20'), usAverage: 3.85, california: 5.98, change: 0.10, note: 'Continuing to climb. Approaching $4 threshold.' },
  { date: 'Mar 22', timestamp: Date.parse('2026-03-22'), usAverage: 3.95, california: 6.10, change: 0.10, note: 'Approaching $4 threshold. Greece already capped gasoline profit margins.' },
  { date: 'Mar 24', timestamp: Date.parse('2026-03-24'), usAverage: 3.95, california: 6.15, change: 0.00, note: 'Approaching $4. Port Arthur TX refinery explosion adding upward pressure on domestic supply.' },
  { date: 'Mar 27', timestamp: Date.parse('2026-03-27'), usAverage: 3.93, california: 5.62, change: -0.02, note: 'National avg $3.93 — up 40% from $2.81 in January. California $5.62. WTI touches $100. Analysts warn $5 national possible if oil stays above $100.' },
  { date: 'Mar 30', timestamp: Date.parse('2026-03-30'), usAverage: 3.98, california: 5.75, change: 0.05, note: 'Oil up 50%+ since war began. Australia offering free public transit. Fuel rationing discussed.' },
];

export const asianMarkets: AsianMarketEntry[] = [
  { date: 'Mar 1', timestamp: Date.parse('2026-03-01'), nikkei: 38245, nikkeiChange: -3.2, hangseng: 19845, hangsengChange: -2.8, kospi: 2456, kospiChange: -2.5, sensex: 72450, sensexChange: -2.1 },
  { date: 'Mar 2', timestamp: Date.parse('2026-03-02'), nikkei: 37120, nikkeiChange: -2.9, hangseng: 19125, hangsengChange: -3.6, kospi: 2378, kospiChange: -3.2, sensex: 70890, sensexChange: -2.2 },
  { date: 'Mar 3', timestamp: Date.parse('2026-03-03'), nikkei: 36580, nikkeiChange: -1.5, hangseng: 18890, hangsengChange: -1.2, kospi: 2345, kospiChange: -1.4, sensex: 70120, sensexChange: -1.1, note: 'Naval escort announcement stabilizes' },
  { date: 'Mar 4', timestamp: Date.parse('2026-03-04'), nikkei: 35890, nikkeiChange: -1.9, hangseng: 18420, hangsengChange: -2.5, kospi: 2289, kospiChange: -2.4, sensex: 69450, sensexChange: -1.0 },
  { date: 'Mar 5', timestamp: Date.parse('2026-03-05'), nikkei: 36430, nikkeiChange: 1.5, hangseng: 18750, hangsengChange: 1.8, kospi: 2518, kospiChange: 10.0, sensex: 70100, sensexChange: 1.0, note: 'Dead cat bounce after historic crash' },
  { date: 'Mar 6', timestamp: Date.parse('2026-03-06'), nikkei: 35980, nikkeiChange: -1.2, hangseng: 18420, hangsengChange: -1.8, kospi: 2450, kospiChange: -2.7, sensex: 69650, sensexChange: -0.6 },
  { date: 'Mar 7', timestamp: Date.parse('2026-03-07'), nikkei: 35450, nikkeiChange: -1.5, hangseng: 18100, hangsengChange: -1.7, kospi: 2380, kospiChange: -2.9, sensex: 69200, sensexChange: -0.7, note: 'GPS jamming concerns' },
  { date: 'Mar 8', timestamp: Date.parse('2026-03-08'), nikkei: 34980, nikkeiChange: -1.3, hangseng: 17850, hangsengChange: -1.4, kospi: 2320, kospiChange: -2.5, sensex: 68800, sensexChange: -0.6, note: 'New Supreme Leader named' },
  { date: 'Mar 9', timestamp: Date.parse('2026-03-09'), nikkei: 32360, nikkeiChange: -7.5, hangseng: 16950, hangsengChange: -5.0, kospi: 2132, kospiChange: -8.1, sensex: 66500, sensexChange: -3.3, note: 'Oil breaches $100 — Asia crashes. Japan energy crisis escalating' },
];

export const interceptorStatus: InterceptorStatusEntry[] = [
  { date: 'Feb 28', timestamp: Date.parse('2026-02-28'), patriotPac3Remaining: 100, sm3Remaining: 100, thaadRemaining: 100, arrowRemaining: 100, totalExpenditure: 0 },
  { date: 'Mar 1', timestamp: Date.parse('2026-03-01'), patriotPac3Remaining: 92, sm3Remaining: 94, thaadRemaining: 97, arrowRemaining: 88, totalExpenditure: 450000000 },
  { date: 'Mar 2', timestamp: Date.parse('2026-03-02'), patriotPac3Remaining: 83, sm3Remaining: 86, thaadRemaining: 93, arrowRemaining: 75, totalExpenditure: 1200000000 },
  { date: 'Mar 3', timestamp: Date.parse('2026-03-03'), patriotPac3Remaining: 74, sm3Remaining: 78, thaadRemaining: 88, arrowRemaining: 62, totalExpenditure: 2100000000 },
  { date: 'Mar 4', timestamp: Date.parse('2026-03-04'), patriotPac3Remaining: 65, sm3Remaining: 71, thaadRemaining: 84, arrowRemaining: 51, totalExpenditure: 3100000000, note: 'Heritage warning threshold' },
  { date: 'Mar 5', timestamp: Date.parse('2026-03-05'), patriotPac3Remaining: 55, sm3Remaining: 63, thaadRemaining: 79, arrowRemaining: 42, totalExpenditure: 4200000000, note: 'Approaching critical levels' },
];

export const conflictGeography: ConflictGeographyEntry[] = [
  { location: 'Tehran', lat: 35.6892, lng: 51.3890, type: 'strike', date: 'Feb 28', description: 'Initial decapitation strikes' },
  { location: 'Natanz Nuclear Facility', lat: 33.7249, lng: 51.7274, type: 'strike', date: 'Feb 28', description: 'Nuclear facility strikes' },
  { location: 'Ras Laffan, Qatar', lat: 25.9264, lng: 51.5308, type: 'damage', date: 'Mar 1', description: 'LNG facility damaged, production suspended' },
  { location: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, type: 'damage', date: 'Mar 1', description: 'Jebel Ali port fire, Burj Al Arab hit' },
  { location: 'Strait of Hormuz', lat: 26.5667, lng: 56.2500, type: 'shipping', date: 'Mar 3', description: 'Selective transit only - Western shipping blocked' },
  { location: 'Bandar Abbas', lat: 27.1865, lng: 56.2808, type: 'strike', date: 'Mar 2', description: 'Naval base strikes' },
  { location: 'Indian Ocean (S of Sri Lanka)', lat: 5.5000, lng: 79.5000, type: 'naval', date: 'Mar 4', description: 'IRIS Jamaran & Dena sunk. IRIS Bushehr interned by Sri Lanka' },
  { location: 'Kuwait (Camp Arifjan)', lat: 28.9167, lng: 48.1333, type: 'base', date: 'Mar 2', description: '6 U.S. troops killed' },
  { location: 'Minab, Iran', lat: 27.1500, lng: 57.0833, type: 'damage', date: 'Mar 3', description: 'School strike, ~180 children killed' },
  { location: 'Azerbaijan (Baku Airport)', lat: 40.4675, lng: 50.0467, type: 'damage', date: 'Mar 5', description: 'Airport struck' },
  { location: 'Cyprus (Larnaca)', lat: 34.8751, lng: 33.6263, type: 'base', date: 'Mar 5', description: 'U.S. evacuation operations' },
  { location: 'Turkey (Incirlik)', lat: 37.0022, lng: 35.4258, type: 'base', date: 'Mar 5', description: 'NATO intercepted Iranian missile' },
  { location: 'Pakistan (Karachi)', lat: 24.8607, lng: 67.0011, type: 'base', date: 'Mar 5', description: 'U.S. consulate closed' },
  { location: 'Tehran University', lat: 35.7029, lng: 51.3952, type: 'strike', date: 'Mar 6', description: 'Israel broad wave overnight - residential areas hit' },
  { location: 'Beirut (Southern Suburbs)', lat: 33.8547, lng: 35.4832, type: 'damage', date: 'Mar 6', description: 'Israel orders evacuation - 500K+ people' },
  { location: 'Kurdistan (NW Iran)', lat: 36.6833, lng: 45.0833, type: 'strike', date: 'Mar 6', description: 'Kurdish ground offensive - first ground front' },
  { location: 'Mehrabad Airport, Tehran', lat: 35.6892, lng: 51.3100, type: 'strike', date: 'Mar 7', description: 'IDF destroys 16 Quds Force cargo aircraft' },
  { location: 'IRGC University, Tehran', lat: 35.7100, lng: 51.4200, type: 'strike', date: 'Mar 7', description: '400+ targets hit, 1,465 munitions dropped' },
  { location: 'Strait of Hormuz (PRIMA tanker)', lat: 26.4500, lng: 56.3000, type: 'shipping', date: 'Mar 7', description: 'PRIMA tanker struck by Iranian drone' },
  { location: 'Shahr Rey Oil Depot, Tehran', lat: 35.5900, lng: 51.4400, type: 'strike', date: 'Mar 8', description: 'First Israeli strike on Iranian oil infrastructure' },
  { location: 'Shahran Oil Depot, Tehran', lat: 35.7200, lng: 51.3500, type: 'strike', date: 'Mar 8', description: 'Oil infrastructure targeted' },
  { location: 'Riyadh Province, Saudi Arabia', lat: 24.7136, lng: 46.6753, type: 'damage', date: 'Mar 8', description: 'First Saudi fatalities: 2 killed, 12 injured' },
  { location: 'Bahrain (Desalination Plant)', lat: 26.0275, lng: 50.5500, type: 'damage', date: 'Mar 8', description: 'Iranian drone hits desalination plant' },
  { location: 'Kuwait International Airport', lat: 29.2266, lng: 47.9689, type: 'damage', date: 'Mar 8', description: 'Drones target fuel tanks' },
  { location: 'Beirut (Central)', lat: 33.8938, lng: 35.5018, type: 'strike', date: 'Mar 8', description: 'Israel strikes hotel, killing 4 - first strike on heart of capital' },
];

// =============================================================================
// SCENARIO PROBABILITY UPDATES (Timestamped for Field Notes)
// =============================================================================

export const scenarioUpdates: ScenarioUpdate[] = [
  {
    date: 'Feb 28, 2026',
    timestamp: Date.parse('2026-02-28'),
    day: 1,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 25 },
      { scenario: 'Protracted Attrition', probability: 50 },
      { scenario: 'Full Escalation', probability: 25 },
    ],
    rationale: 'Initial assessment. Khamenei death creates regime uncertainty but also potential for rapid resolution if successor seeks de-escalation.',
    keyDevelopments: [
      'Operation Epic Fury launches',
      'Khamenei killed in initial strikes',
      'Iran retaliates against 27 U.S. bases',
    ],
  },
  {
    date: 'Mar 1, 2026',
    timestamp: Date.parse('2026-03-01'),
    day: 2,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 22 },
      { scenario: 'Protracted Attrition', probability: 48 },
      { scenario: 'Full Escalation', probability: 30 },
    ],
    rationale: 'GCC infrastructure targeting indicates Iran prioritizing economic leverage over military confrontation. This is sophisticated asymmetric strategy.',
    keyDevelopments: [
      'Iran targets GCC civilian infrastructure',
      'Insurance withdrawal begins',
      'Interim Leadership Council formed',
    ],
  },
  {
    date: 'Mar 2, 2026',
    timestamp: Date.parse('2026-03-02'),
    day: 3,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 18 },
      { scenario: 'Protracted Attrition', probability: 47 },
      { scenario: 'Full Escalation', probability: 35 },
    ],
    rationale: 'Hezbollah entry expands conflict geography. Trump 4-5 week estimate suggests administration preparing public for extended campaign.',
    keyDevelopments: [
      'Hezbollah enters from Lebanon',
      'U.S. death toll reaches 6',
      'Trump says campaign could last 4-5 weeks',
      "Lloyd's P&I cancellation announced",
    ],
  },
  {
    date: 'Mar 3, 2026',
    timestamp: Date.parse('2026-03-03'),
    day: 4,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 15 },
      { scenario: 'Protracted Attrition', probability: 50 },
      { scenario: 'Full Escalation', probability: 35 },
    ],
    rationale: 'Insurance mechanism working as Iran intended. Naval escorts announcement is stopgap - won\'t restore full commercial confidence.',
    keyDevelopments: [
      "Lloyd's coverage cancellation effective Mar 5",
      'Trump announces naval escorts',
      'QatarEnergy suspends all LNG production',
      'Iraq output down 70% due to storage saturation from Hormuz closure',
    ],
  },
  {
    date: 'Mar 4, 2026',
    timestamp: Date.parse('2026-03-04'),
    day: 5,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 20 },
      { scenario: 'Protracted Attrition', probability: 45 },
      { scenario: 'Full Escalation', probability: 35 },
    ],
    rationale: 'Part I Memo published. Iranian casualty asymmetry reaching politically significant levels, but economic leverage thesis validated.',
    keyDevelopments: [
      'Iranian casualties exceed 1,045',
      'IRIS Jamaran and Dena sunk in Indian Ocean',
      'Tanker transits collapse to ~4/day',
      'Part I Memo published',
    ],
  },
  {
    date: 'Mar 5, 2026',
    timestamp: Date.parse('2026-03-05'),
    day: 6,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 10 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 35 },
    ],
    rationale: 'P&I expiration creating anticipated chokepoint. Oil above $100 validates transmission mechanism thesis. Interceptor depletion accelerating.',
    keyDevelopments: [
      'P&I coverage expires at midnight',
      'Brent crude exceeds $100/bbl',
      'Interceptor stockpiles approaching Heritage warning thresholds',
      'Congressional war powers debate intensifies',
    ],
  },
  {
    date: 'Mar 6, 2026',
    timestamp: Date.parse('2026-03-06'),
    day: 7,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 5 },
      { scenario: 'Protracted Attrition', probability: 60 },
      { scenario: 'Full Escalation', probability: 35 },
    ],
    rationale: 'Both chambers kill war powers resolution. Trump says "no time limits." Hegseth says war "only just begun." Iran FM refuses all negotiation. Zero Hormuz transits for 3+ consecutive days. Kurdish ground offensive opens new front.',
    keyDevelopments: [
      'Both House and Senate kill war powers resolutions — zero legislative off-ramps',
      'Trump: "no time limits." Hegseth: war "only just begun"',
      'Iran FM Araghchi refuses all negotiation on NBC',
      'Zero tanker transits for 3+ consecutive days',
      'Kurdish ground offensive opens new front in northwest Iran',
      'Israel launches broad wave on Tehran overnight',
      'Beirut southern suburbs evacuation ordered (500K+ people)',
      'War costing U.S. $1B/day (NBC sources)',
    ],
  },
  {
    date: 'Mar 7, 2026',
    timestamp: Date.parse('2026-03-07'),
    day: 8,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 5 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 40 },
    ],
    rationale: "Israel's weekend bombing campaign (400+ targets, 1,465 munitions) is the most intense since war began. Targeting Mehrabad Airport and IRGC university signals intent to degrade regime infrastructure. Selective transit emerging (China/Iran-linked vessels) creates de facto two-tier Hormuz.",
    keyDevelopments: [
      'Israeli Air Force attacks 400+ targets, drops 1,465 munitions',
      '80+ fighter jets strike Tehran alone with ~230 munitions',
      'IDF destroys 16 Quds Force cargo aircraft at Mehrabad Airport',
      'PRIMA tanker struck by Iranian drone in Hormuz',
      'GPS jamming affects 1,650+ ships in Gulf (up 55%)',
      'Only 3 vessels transit Hormuz (Palau, Iran, Liberia flagged)',
      'Iran confirms Strait closed only to US, Israel, Western allies — selective access for China/others',
      'Kurdish ground offensive continues',
    ],
  },
  {
    date: 'Mar 8, 2026',
    timestamp: Date.parse('2026-03-08'),
    day: 9,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 3 },
      { scenario: 'Protracted Attrition', probability: 50 },
      { scenario: 'Full Escalation', probability: 47 },
    ],
    rationale: "Three escalatory developments in 24 hours. First: Israel strikes Iranian oil infrastructure for first time — Shahr Rey, Shahran, Nobonyad depots. Second: Mojtaba Khamenei named Supreme Leader — regime continuity, no moderation signal. Third: senior Iranian official warns of retaliatory strikes on regional energy infrastructure, calling this a 'new phase.'",
    keyDevelopments: [
      'Mojtaba Khamenei (son) named new Supreme Leader — IRGC pledges allegiance',
      'Israel strikes Iranian oil infrastructure for first time: Shahr Rey, Shahran, Nobonyad oil depots',
      'Senior Iranian official warns war entered "new phase" — threatens retaliatory strikes on regional energy infrastructure',
      'Saudi Arabia first fatalities: 2 killed, 12 injured in Riyadh Province',
      'Bahrain: desalination plant hit by Iranian drone',
      'Kuwait: drones target fuel tanks at Kuwait International Airport',
      'Israel strikes hotel in central Beirut, killing 4 — first strike on heart of capital',
      '7th US service member killed',
      'US State Department orders non-emergency diplomats to leave Saudi Arabia',
      'Trump says he and Israel will set "terms of surrender"',
      'G7 finance ministers discuss coordinated emergency oil stockpile release',
    ],
  },
  {
    date: 'Mar 9, 2026',
    timestamp: Date.parse('2026-03-09'),
    day: 10,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 2 },
      { scenario: 'Protracted Attrition', probability: 45 },
      { scenario: 'Full Escalation', probability: 53 },
    ],
    rationale: 'Full Escalation becomes base case for the first time. Oil breaching $100 transforms this from regional military conflict into global economic event. Brent +23% in single session, largest since 1988. Saudi/Iraq cutting production due to storage constraints. G7 discussing SPR release is governmental equivalent of margin call.',
    keyDevelopments: [
      'Oil surges past $100/barrel — Brent hits $119 intraday before settling ~$108-110',
      'Largest single-day dollar gain in Brent futures since 1988',
      'Crude up ~50% since conflict started',
      'Asian markets crash: Nikkei -7.5%, KOSPI -8.1%, European markets -2-3%',
      'US gas hits $3.478 national average (AAA), up $0.50 in one week',
      '8th US service member killed',
      'Iran announces nationwide gathering to pledge allegiance to new supreme leader',
      'Saudi Arabia production cuts deepening — running out of storage due to Hormuz closure',
      'Iraq output down 70% due to storage saturation',
      'JPMorgan warns Brent could hit $120 if Gulf producers exhaust storage',
      'G7 considering coordinated SPR release',
    ],
  },
  {
    date: 'Mar 10, 2026',
    timestamp: Date.parse('2026-03-10'),
    day: 11,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 2 },
      { scenario: 'Protracted Attrition', probability: 42 },
      { scenario: 'Full Escalation', probability: 56 },
    ],
    rationale: "Mojtaba Khamenei's first public statement directs keeping Hormuz closed as economic weapon. Iran now mining the strait — crosses from insurance closure to physical military closure. Qatar strikes Iran (shoots down 2 Su-24s) — first GCC offensive action. Oil whiplash ($119 to $88) shows market volatility but fundamentals unchanged.",
    keyDevelopments: [
      "Mojtaba Khamenei's first message: Hormuz should remain closed as 'tool to pressure enemy'",
      'CNN reports Iran laying mines in Strait of Hormuz',
      "Trump demands mines removed 'IMMEDIATELY' or consequences 'at level never seen before'",
      'Qatar shoots down 2 Iranian Su-24 bombers — first GCC offensive action',
      'Oil whiplash: $119 → $88 on conflicting Trump signals',
      '8th US service member dies',
    ],
  },
  {
    date: 'Mar 11, 2026',
    timestamp: Date.parse('2026-03-11'),
    day: 12,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 2 },
      { scenario: 'Protracted Attrition', probability: 40 },
      { scenario: 'Full Escalation', probability: 58 },
    ],
    rationale: "IEA announces largest SPR release in history (400M barrels). Oil crashed 11% intraday on news — then recovered within hours. Validates Part II thesis that supply response cannot break transmission chain. Goldman says 400M barrels offsets only 12 days of Gulf disruption. US destroys 16 mine-laying vessels but ships still getting attacked. Ukraine anti-drone teams deployed to Gulf states.",
    keyDevelopments: [
      'IEA announces record 400M barrel strategic reserve release — largest in history',
      'US contributing 172M barrels to release',
      'Oil crashed 11% intraday on SPR news, then recovered',
      'US destroys 16 Iranian mine-laying vessels near Hormuz',
      'Thai ship Mayuree Naree set ablaze in strait',
      'Express Rome (Liberia-flagged) and One Majesty (Japan-flagged) struck',
      'IRGC: all ships need Iran permission to transit',
      'Lebanon: 750,000+ displaced, 634 killed',
      'Ukrainian anti-drone teams deployed to Qatar, UAE, Saudi Arabia',
      'Feb CPI: 2.4% YoY (pre-war baseline)',
      'US confirms 140 service members wounded in first 10 days',
    ],
  },
  {
    date: 'Mar 12, 2026',
    timestamp: Date.parse('2026-03-12'),
    day: 13,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 2 },
      { scenario: 'Protracted Attrition', probability: 40 },
      { scenario: 'Full Escalation', probability: 58 },
    ],
    rationale: "IEA record 400M barrel release failed to hold oil below $100 — Brent back above $100 within 24 hours. This is the price floor, not a spike. Iraq shutting Basra ports = supply destruction is structural and expanding. Energy Sec Wright admits Navy 'not ready' to escort tankers — destroys naval escort narrative. Pezeshkian sets 3 conditions (recognition, reparations, guarantees) — structurally unachievable in current political environment. IEA calls this 'largest supply disruption in history of global oil market.'",
    keyDevelopments: [
      'Brent crude back above $100 despite record SPR release',
      'WTI surges 8% to $94',
      '3 more ships struck overnight near Hormuz and Dubai',
      'Iraq shuts down oil port operations at Basra after tanker attacks',
      "Energy Secretary Wright admits Navy 'not ready' to escort tankers — won't be ready until end of month",
      'Pezeshkian sets 3 conditions for peace: recognition of rights, war reparations, guarantees against future aggression',
      "New Supreme Leader Khamenei's adviser calls Trump 'Satan himself'",
      'IRGC + Hezbollah launch joint missile operation against Israel',
      'Iran claims most intense operation since beginning of war',
      'Bahrain fuel storage at airport hit by drone',
      'Kuwait: 6 power lines downed by interceptor debris',
      'Oman: Salalah port fuel tanks hit',
      'Iran-linked hackers (Handala) steal 50TB from medical device company Stryker',
      'UN Security Council adopts resolution urging Iran to stop Gulf attacks',
      'Goldman raises inflation forecast to 2.9-3.3%',
      "IEA warns of 'largest supply disruption in history of global oil market'",
    ],
  },
  {
    date: 'Mar 13, 2026',
    timestamp: Date.parse('2026-03-13'),
    day: 14,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 2 },
      { scenario: 'Protracted Attrition', probability: 35 },
      { scenario: 'Full Escalation', probability: 63 },
    ],
    rationale: "Yuan-denominated Hormuz transit is the biggest structural development of the war — Iran weaponizing the strait not just to block oil but to restructure HOW oil is traded. This is petrodollar disruption, not just supply disruption. If this becomes policy, it outlasts the war. Mojtaba wounded/disfigured changes succession calculus. Iran military losing control of units = decentralized escalation risk. Fed cuts priced out to 2027-2028 = stagflation thesis confirmed by rates market. 1973 OPEC crisis comparisons going mainstream.",
    keyDevelopments: [
      'Iran considering yuan-only Hormuz transit — petrodollar disruption',
      'Two Indian LPG carriers allowed through under yuan transit framework',
      'Hegseth: Mojtaba Khamenei "wounded and likely disfigured"',
      'Explosions near Tehran rally attended by Larijani, Pezeshkian, Araghchi',
      '1,444 civilians + 4,400 military killed in Iran',
      'Iran Foreign Ministry says military lost control of several units',
      'US refueling plane crashes in Iraq — 6 crew killed',
      '2,200 Marines deploying from Okinawa',
      '250+ US orgs demand Congress halt war funding',
      'Fed rate cuts priced out until 2027-2028',
      'Stagflation comparisons to 1973 now mainstream',
    ],
  },
  {
    date: 'Mar 14, 2026',
    timestamp: Date.parse('2026-03-14'),
    day: 15,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 2 },
      { scenario: 'Protracted Attrition', probability: 35 },
      { scenario: 'Full Escalation', probability: 63 },
    ],
    rationale: "US strikes Kharg Island — 90% of Iran's oil exports pass through it. Trump spared oil infrastructure 'this time' but threatened it next. Iran responds: any attack on energy facilities triggers retaliation on regional oil infrastructure. This is bilateral energy infrastructure targeting from Day 9 taken to logical extreme. The $200 oil warning is not hyperbole if Kharg oil infrastructure is hit and Iran retaliates against Saudi/UAE export capacity. Trump asking other countries to send warships = admission US can't reopen Hormuz alone.",
    keyDevelopments: [
      "US bombs Kharg Island military targets — Iran's 'crown jewel'",
      'Trump threatens oil infrastructure next if Hormuz stays blocked',
      'Iran: any energy facility attack triggers retaliation on regional oil infrastructure',
      "IRGC tells UAE residents to evacuate near US 'hideouts'",
      'Fujairah bunkering hub fire',
      'Jordan: intercepted 79/85 projectiles in week 2',
      '56 Iranian cultural sites damaged',
      'Trump calls on China, France, Japan, SK, UK to send warships',
      'Iran spokesperson warns oil could hit $200',
      'Brent closes at $103.14',
      'S&P at 2026 lows',
    ],
  },
  {
    date: 'Mar 20, 2026',
    timestamp: Date.parse('2026-03-20'),
    day: 21,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 1 },
      { scenario: 'Protracted Attrition', probability: 30 },
      { scenario: 'Full Escalation', probability: 69 },
    ],
    rationale: "Day 21: Full Escalation dominant. Energy infrastructure targeting now bilateral and structural (Ras Laffan 5yr repair). Larijani killed — no negotiation partner remaining. Trump rejects ceasefire. Goldman warns oil could exceed $147 all-time high. Hormuz 'will not return to pre-war conditions.' Fed cuts priced out to 2027-2028. War entering 4th week with more Marines deploying.",
    keyDevelopments: [
      "Israel strikes South Pars gas field → Iran retaliates on Ras Laffan (world's largest LNG facility)",
      'QatarEnergy: 17% LNG capacity lost, up to 5 YEARS to repair',
      'Ali Larijani killed — last viable negotiation partner eliminated',
      "Hormuz closed 21 consecutive days. Iran: 'will not return to pre-war conditions'",
      'Goldman warns oil could exceed 2008 all-time high ($147)',
      'JPMorgan cuts S&P year-end target',
      'Fed rate cuts priced out to 2027-2028',
      "Trump rejects ceasefire, calls NATO 'cowards'",
      'More Marines rerouted to Middle East (11th MEU, Boxer ARG)',
      'Strikes hit Tehran during Nowruz (Persian New Year)',
      'Iranian Red Crescent: 204 children among 1,444 civilians killed',
      'Lebanon exceeds 1,000 dead',
    ],
  },
  {
    date: 'Mar 22, 2026',
    timestamp: Date.parse('2026-03-22'),
    day: 23,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 1 },
      { scenario: 'Protracted Attrition', probability: 25 },
      { scenario: 'Full Escalation', probability: 74 },
    ],
    rationale: "Day 23: Maximum escalation rhetoric. Trump issues 48hr ultimatum on power plants. Iran threatens permanent Hormuz closure + regional infrastructure destruction. Dimona struck near Israeli nuclear facility. ICBM fired at Diego Garcia. Full Escalation reaches highest probability of the war at 74%.",
    keyDevelopments: [
      'Trump 48-hour ultimatum: obliterate power plants if Hormuz not reopened',
      'Iran: Hormuz will be completely closed indefinitely if power plants hit',
      'Iranian missiles strike Dimona and Arad — near Israeli nuclear center',
      '100+ Israelis injured including 10 seriously in Arad',
      'ICBM fired at Diego Garcia (US-UK Indian Ocean base)',
      'IRGC claims 3rd Israeli fighter shot down',
      '22 nations express willingness to help secure Hormuz',
      'Brent surges to $114',
      'Netanyahu urges nations to join war',
      'Iran threatens UAE nuclear power plant',
    ],
  },
  {
    date: 'Mar 23, 2026',
    timestamp: Date.parse('2026-03-23'),
    day: 24,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 8 },
      { scenario: 'Protracted Attrition', probability: 45 },
      { scenario: 'Full Escalation', probability: 47 },
    ],
    rationale: "Day 24: POTENTIAL TURNING POINT — First real de-escalation signal in 24 days. Trump delays strikes after 'productive conversations.' Pezeshkian softens Hormuz language. Oil crashes 13%. But structural damage persists: Ras Laffan (5yr repair), 21+ ships attacked, Larijani dead, Fed cuts priced out to 2027-2028. Quick Resolution still low because Iran's conditions (recognition, reparations, guarantees) remain unachievable. Protracted Attrition returns as likely outcome — war intensity may decrease but no resolution in sight.",
    keyDevelopments: [
      "Trump delays strikes after 'productive conversations' with Iran",
      '5-day pause announced — first direct communication channel since war began',
      "Pezeshkian softens: Hormuz 'open to all except those who violate our soil'",
      'Oil crashes 13%+ — Brent from $106 to $91-101 range',
      "Oman 'working intensively' on safe passage arrangements",
      'No ceasefire announced, no formal negotiation framework',
      'Structural damage persists regardless of diplomatic outcome',
      'First time Quick Resolution probability has INCREASED since Day 1',
      'First time Full Escalation probability has DECREASED since Day 1',
    ],
  },
  {
    date: 'Mar 24, 2026',
    timestamp: Date.parse('2026-03-24'),
    day: 25,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 10 },
      { scenario: 'Protracted Attrition', probability: 48 },
      { scenario: 'Full Escalation', probability: 42 },
    ],
    rationale: "Day 25: Market whiplash. Oil rebounds to $104 after Iran denies talks and calls Trump 'deceitful.' 82nd Airborne (1,000+) deploying — actions contradict 'we won' rhetoric. 290 US troops wounded (doubled in 2 weeks). Trump approval at 36%. Port Arthur TX refinery explosion adds domestic supply disruption. $580M insider trading probe on suspicious trades 15 min before Trump's Truth Social post. Iran names Zolghadr to replace Larijani. Volatility masquerading as progress.",
    keyDevelopments: [
      'Oil rebounds above $100 as Iran denies direct talks',
      "IRGC calls Trump 'deceitful' — no softening from Iranian military",
      '82nd Airborne (1,000+) deploying despite claims war is won',
      '290 US troops wounded — doubled in two weeks',
      'Trump approval at 36% (Reuters/Ipsos) — lowest of second term',
      'Port Arthur TX refinery explosion — domestic supply disruption',
      '$580M insider trading probe — bets placed 15 min before Trump post',
      'Missile hits Tel Aviv street — strikes continue on both sides',
      'Zolghadr named to replace killed Larijani as National Security Council head',
    ],
  },
  {
    date: 'Mar 25, 2026',
    timestamp: Date.parse('2026-03-25'),
    day: 26,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 10 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 35 },
    ],
    rationale: "Day 26: Iran rejects 15-point plan. Issues maximalist counter-conditions (reparations, Hormuz sovereignty, proxy protection). Quick Resolution drops back from 15% — Iran's conditions are non-starters. Protracted Attrition becomes clear base case: both sides exchanging proposals but miles apart. Neither side can 'win' militarily but neither will accept the other's terms. Hormuz sovereignty legislation is the structural wild card — if codified, it outlasts any ceasefire.",
    keyDevelopments: [
      'Iran REJECTS US 15-point plan — issues 5 counter-conditions',
      'Counter-conditions include: war reparations, Hormuz sovereignty, protection of ALL proxy groups',
      'Iranian parliament pursuing legislation to codify Hormuz sovereignty with transit fees',
      'GCC confirms Iran already charging passage fees — violating international law',
      'UAE oil chief calls it "economic terrorism"',
      'Israel strikes Bushehr nuclear complex, kills IRGC navy chief',
      'US strikes PMF in Iraq Anbar Province — 7 Iraqi soldiers killed',
      'Iraqi PM gives PMF "green light for self-defense" — summons US diplomat',
      'Saudi MBS pressing Trump to continue strikes',
      'Sri Lanka cutting energy consumption 25%',
      'Iranian military: 5,300+ killed. Lebanon: 1,072 killed, 2,966 wounded',
      'Brent ~$100. Markets yo-yoing on conflicting signals',
    ],
  },
  {
    date: 'Mar 30, 2026',
    timestamp: Date.parse('2026-03-30'),
    day: 31,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 15 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 30 },
    ],
    rationale: "Day 31: Protracted Attrition firmly base case at 55%. Houthi entry expands war geographically but doesn't change negotiation dynamics. Pakistan 4-nation meeting (Saudi, Turkey, Egypt) is most serious diplomatic effort yet. Trump claims Iran agreed to 'most' of 15-point plan — but Iran's FM says no negotiations happening. The pattern: Trump claims progress, oil dips, Iran denies, oil rebounds, strikes continue. THIS IS protracted attrition playing out in real time. War enters 5th week with Brent up 50%+ from pre-war.",
    keyDevelopments: [
      'Day 27: Israel strikes Arak reactor (now non-operational per IAEA) + 2 largest steel factories',
      'Day 28: WTI touches $100.04 — first time above $100 since 2022. Brent $112.57 new 2026 high',
      '15 US wounded at Prince Sultan Air Base hours after Trump declared Iran "neutralized"',
      'Russia provided Iran satellite imagery for Prince Sultan targeting (per Zelensky)',
      'Day 29: HOUTHIS ENTER WAR — first strikes on Israel from Yemen. War spans Med to Indian Ocean',
      'Day 30: Pakistan/Saudi/Turkey/Egypt FMs meet in Islamabad — most serious diplomatic effort',
      'Trump: Iran agreed to "most of" 15-point plan. Considering Kharg Island seizure',
      'Iran allows 20 Pakistan ships through Hormuz (2/day) — selective access expanding',
      'Iraq PMF deployed inside Iran — militia fighting alongside Iranian forces',
      'Australia: free public transit, considering fuel rationing. Sri Lanka cutting 25%',
      'US: 13 killed, 300+ wounded. Israel: 18 civilians killed, 5,492 injured',
      'Day 31: War enters 5th week. S&P 6,369. VIX 31.05. IEA: biggest oil shock in history',
    ],
  },
  {
    date: 'Mar 31, 2026',
    timestamp: Date.parse('2026-03-31'),
    day: 32,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 18 },
      { scenario: 'Protracted Attrition', probability: 58 },
      { scenario: 'Full Escalation', probability: 24 },
    ],
    rationale: "Day 32: The Hormuz Admission. Trump administration concludes reopening Hormuz extends beyond 4-6 week timeline — prepared to end war without resolving the blockade. This is the fundamental shift from 'victory over Iran' to 'damage limitation for the US.' Quick Resolution rises slightly on diplomatic signals but Iran's sovereignty demands remain non-starters. Full Escalation drops as administration signals exit framing. Brent closes March up 63% — largest monthly gain since 1988. Gas crosses $4/gallon. IRGC threatens 18 US tech companies.",
    keyDevelopments: [
      'Trump administration concludes Hormuz reopening extends beyond 4-6 week timeline',
      'Prepared to end war without resolving Hormuz blockade — fundamental strategic shift',
      'Rubio: US objectives achieved in "weeks, not months" — but Hormuz not among them',
      'Kuwaiti VLCC Al Salmi struck by Iranian drone at Port of Dubai — 23+ vessels hit since war began',
      'Brent closes March up 63% — largest monthly gain since 1988',
      'Gas hits $4.02/gallon national average — largest monthly jump on record',
      'IRGC threatens 18 US tech companies: Apple, Microsoft, Google, Nvidia, Meta, Tesla, Boeing',
      'Deadline: April 1, 20:00 Tehran time. Employees warned to evacuate facilities',
      'China-Pakistan present 5-point ceasefire plan: immediate ceasefire, reopen Hormuz',
      'Iran parliament Security Committee passes "Strait of Hormuz Management Plan"',
      'US: 348 wounded, 15 killed. Iran military: 6,000+ killed',
    ],
  },
  {
    date: 'Apr 1, 2026',
    timestamp: Date.parse('2026-04-01'),
    day: 33,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 20 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 25 },
    ],
    rationale: "Day 33: Trump's primetime address reveals the gap between rhetoric and reality. Claims war 'nearing completion' while promising 2-3 more weeks of 'extremely hard' strikes. No exit strategy, no Hormuz solution, no ceasefire framework. Quick Resolution rises on ceasefire rumors but Iran immediately denies — 'false and baseless.' Kharazi wounding removes key diplomatic channel. UK's Starmer: 'This is not our war.' S&P rallies 2.9% on rumors, then gives it back as oil surges 4% on traders concluding no quick end.",
    keyDevelopments: [
      "Trump's first primetime address on war — claims 'nearing completion'",
      "Simultaneously promises 2-3 more weeks of 'extremely hard' strikes",
      'No exit strategy, no Hormuz solution presented in 20-minute speech',
      'Kamal Kharazi (former FM, key negotiator) seriously wounded, wife killed in Tehran strike',
      'Kharazi was overseeing Pakistan channel to VP Vance — diplomatic channel damaged',
      "Iran denies Trump ceasefire claims — 'false and baseless'",
      "UK PM Starmer: 'This is not our war and we're not going to get dragged into it'",
      'Cluster munition used in Tel Aviv area attack — 16 wounded including children',
      '11-year-old girl critically wounded by Iranian cluster bomb in Bnei Brak',
      'S&P posts best session in nearly a year (+2.9%) on ceasefire rumors — then reversed',
      'Oil jumped 4% post-speech as traders concluded war will not end quickly',
      'Gas hits $4.06/gallon national average',
    ],
  },
  {
    date: 'Apr 2, 2026',
    timestamp: Date.parse('2026-04-02'),
    day: 34,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 18 },
      { scenario: 'Protracted Attrition', probability: 57 },
      { scenario: 'Full Escalation', probability: 25 },
    ],
    rationale: "Day 34: Post-speech reality check. Markets deliver their verdict: oil surges as traders process that Trump's address offered no path to resolution. WTI +10.3% to $110.47, Brent +8.2% to $109.40. IEA warns April will be 'much worse than March' — lost 12 million bpd, more than two oil crises combined. China and Russia actively calling for ceasefire. Austria rejects all US overflights. Coalition supporting this war is narrowing while economic damage compounds daily.",
    keyDevelopments: [
      'Oil surges post-speech: WTI +10.3% to $110.47, Brent +8.2% to $109.40',
      "Markets digest: no exit strategy in Trump's address",
      "IEA warns April will be 'much worse than March'",
      "Lost 12 million bpd — more than two oil crises combined. IEA: 'worst energy crisis in history'",
      "China calls for immediate ceasefire — 'military means cannot solve the problem'",
      'Putin calls MBS urging diplomatic efforts to end war',
      'Austria rejects all US military overflights since war began — citing neutrality',
      'Goldman: S&P could drop 5-7% more if Hormuz stays closed through summer',
      '14 wounded near Tel Aviv including 11-year-old girl',
      'Tanker hit off Qatar coast — damage but no casualties',
      '7 Iraqi fighters killed in US strike on Anbar military base',
      'Gas hits $4.10/gallon national average',
    ],
  },
  {
    date: 'Apr 3, 2026',
    timestamp: Date.parse('2026-04-03'),
    day: 35,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 15 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 30 },
    ],
    rationale: "Day 35: Major escalation — Iran shoots down two US aircraft. F-15E Strike Eagle lost over southwestern Iran, A-10 Warthog lost near Strait of Hormuz. One crew member rescued immediately; one missing in hostile terrain triggering SAR operation. Meanwhile Iran hits Prince Sultan Air Base in Saudi Arabia killing 5 Americans — deadliest single strike. Coalition framework fraying as US casualties mount.",
    keyDevelopments: [
      'F-15E Strike Eagle shot down over southwestern Iran',
      'A-10 Warthog lost near Strait of Hormuz',
      'One crew member rescued immediately; one missing triggering SAR operation',
      'Iran hits Prince Sultan Air Base — 5 US airmen killed (deadliest single strike)',
      '23 total US deaths, 580+ wounded since war began',
      'China urges immediate ceasefire as great power involvement expands',
      'EU calling for 72-hour humanitarian pause',
      'Gas hits $4.15/gallon national average',
    ],
  },
  {
    date: 'Apr 4, 2026',
    timestamp: Date.parse('2026-04-04'),
    day: 36,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 14 },
      { scenario: 'Protracted Attrition', probability: 51 },
      { scenario: 'Full Escalation', probability: 35 },
    ],
    rationale: "Day 36: The economic decapitation play becomes explicit. US and Israel strike Mahshahr refinery and Iranian gasoline infrastructure — 70% of Iran's gasoline production capacity destroyed. This is the 'March 2020 for Iran' moment — economic annihilation. Iran responds with major strike on Dubai infrastructure. Both sides now targeting economic survival. War enters brutal attritional phase.",
    keyDevelopments: [
      'Mahshahr refinery struck — 70% of Iranian gasoline production capacity destroyed',
      "Iran's domestic fuel crisis now imminent — rationing expected within days",
      'Iran retaliates on Dubai: major infrastructure strikes, port facilities hit',
      'IRGC threatens expanded targeting of global shipping lanes',
      'UN Security Council emergency session — Russia proposes ceasefire resolution',
      'India halts all LNG imports from Gulf pending insurance resolution',
      'Gas hits $4.22/gallon national average',
    ],
  },
  {
    date: 'Apr 5, 2026',
    timestamp: Date.parse('2026-04-05'),
    day: 37,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 20 },
      { scenario: 'Protracted Attrition', probability: 50 },
      { scenario: 'Full Escalation', probability: 30 },
    ],
    rationale: "Day 37: The Easter Miracle. Delta Force rescues captured F-35 pilot Colonel Jake Morrison from Zagros Mountains in stunning special operations raid. 8 Iranian guards killed, no US casualties. Massive propaganda victory for Trump administration. Markets rally on narrative shift. Quick Resolution probability increases as US gains negotiating leverage.",
    keyDevelopments: [
      'Delta Force rescues Colonel Jake Morrison from Zagros Mountains',
      '8 Iranian guards killed, 3 captured — no US casualties',
      'F-35 wreckage confirmed destroyed to prevent technology capture',
      'Trump: "American heroes never left behind" — major political victory',
      'Markets rally 3%+ on rescue news and diplomatic momentum',
      'Iran signals potential flexibility on 45-day ceasefire framework',
      'Gas at $4.18/gallon as markets price in potential resolution',
    ],
  },
  {
    date: 'Apr 6, 2026',
    timestamp: Date.parse('2026-04-06'),
    day: 38,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 25 },
      { scenario: 'Protracted Attrition', probability: 50 },
      { scenario: 'Full Escalation', probability: 25 },
    ],
    rationale: "Day 38: Power Plant Day — Trump's ultimatum. US announces strikes on Iranian power grid unless Iran accepts 45-day ceasefire framework by midnight. Iran facing total infrastructure collapse. China and Russia urging Tehran to accept terms. Swiss channel active. 45-day framework would include Hormuz reopening, POW exchange, humanitarian corridors. Markets cautiously optimistic as both sides approach breaking point.",
    keyDevelopments: [
      "Trump's ultimatum: Iranian power grid strikes unless ceasefire accepted by midnight",
      '45-day ceasefire framework emerges: Hormuz reopening, POW exchange, humanitarian corridors',
      'Swiss channel active — intensive backchannel diplomacy',
      'China and Russia publicly urging Iran to accept framework',
      'Iran parliament emergency session — hardliners vs pragmatists split',
      'European markets rally 2.5% on ceasefire expectations',
      'Gas at $4.12/gallon as markets price in potential de-escalation',
    ],
  },
  {
    date: 'Apr 7, 2026',
    timestamp: Date.parse('2026-04-07'),
    day: 39,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 30 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 15 },
    ],
    rationale: "Day 39: THE DAY. 90 minutes before deadline, Trump announces 'Double sided CEASEFIRE' on Truth Social. Iran's Supreme National Security Council accepts after last-minute nudge from China. Oil crashes 16% — largest single-day drop since 2020. Dubai +8.5%, Seoul +6.9%. Quick Resolution surges on hopes. But 2-week window is short and positions far apart. Pakistan confirms ceasefire includes all fronts including Lebanon. Iran says Hormuz will reopen for safe passage.",
    keyDevelopments: [
      "Trump posts 'a whole civilization will die tonight' — then announces ceasefire 90 minutes before 8pm ET deadline",
      "'Double sided CEASEFIRE' announced on Truth Social",
      "Iran's Supreme National Security Council accepts — Mojtaba Khamenei approved after China intervention",
      'Pakistan PM Sharif confirms ceasefire includes Lebanon',
      'Iran confirms Hormuz will reopen for safe passage',
      'Oil crashes 16% — largest single-day drop since 2020',
      'Dubai market +8.5%, Seoul +6.9% — global markets surge',
      'Two-week ceasefire window begins',
    ],
  },
  {
    date: 'Apr 8, 2026',
    timestamp: Date.parse('2026-04-08'),
    day: 40,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 25 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 20 },
    ],
    rationale: "Day 40: Ceasefire takes effect — and IMMEDIATELY under strain. Israel launches strongest wave of attacks on Lebanon since war began. 300+ killed on ceasefire day. Iran accuses Israel of violating ceasefire, pauses Hormuz traffic. Pakistan/Iran say Lebanon IS included. US/Israel say it is NOT. This is the structural weakness: bilateral ceasefire in a multilateral war. Two ships begin moving through Hormuz per MarineTraffic but Iran blocks more after Lebanon strikes.",
    keyDevelopments: [
      'Ceasefire officially takes effect',
      'Israel launches strongest wave on Lebanon since war began — 300+ killed on ceasefire day',
      'Iran accuses Israel of violating ceasefire — pauses Hormuz traffic',
      'Lebanon dispute emerges: Pakistan/Iran say included, US/Israel say NOT included',
      'Two ships begin moving through Hormuz per MarineTraffic',
      'Iraqi airspace reopens',
      'Pro-Iran Iraqi factions announce 2-week halt',
      'Iran accuses US of violating multiple ceasefire clauses',
    ],
  },
  {
    date: 'Apr 9, 2026',
    timestamp: Date.parse('2026-04-09'),
    day: 41,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 22 },
      { scenario: 'Protracted Attrition', probability: 56 },
      { scenario: 'Full Escalation', probability: 22 },
    ],
    rationale: "Day 41: Ceasefire holding by a thread. Lebanon dispute threatens everything. Hezbollah resumes rockets into northern Israel. Pakistan diplomatic efforts hold Iran back from retaliating overnight. Israel strikes bridge in Lebanon. Vance says Lebanon outside ceasefire terms. Iran's military says 'fingers on the trigger.' Ghalibaf sets preconditions: Lebanon ceasefire and release of blocked assets before talks begin. Quick Resolution probability fading as positions harden.",
    keyDevelopments: [
      'Hezbollah resumes rockets into northern Israel — ceasefire strain intensifies',
      'Pakistan diplomatic efforts prevent Iran overnight retaliation',
      'Israel strikes bridge in Lebanon',
      "Vance: Lebanon 'outside ceasefire terms'",
      "Iran military: 'fingers on the trigger'",
      'Ghalibaf sets preconditions: Lebanon ceasefire + blocked assets release',
      'Delegations preparing for Islamabad',
      'Oil rising as ceasefire strain increases — no sign Hormuz blockade lifting',
    ],
  },
  {
    date: 'Apr 10, 2026',
    timestamp: Date.parse('2026-04-10'),
    day: 42,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 20 },
      { scenario: 'Protracted Attrition', probability: 58 },
      { scenario: 'Full Escalation', probability: 22 },
    ],
    rationale: "Day 42: Both delegations arrive in Islamabad. Vance, Witkoff, Kushner lead ~300 person US delegation. Ghalibaf, Araghchi, Ahmadian, Central Bank Governor Hemmati lead 71 members for Iran. Pakistan Air Force escorted Iranian delegation. Islamabad locked down — two-day public holiday, streets deserted, Serena Hotel requisitioned. Pakistan PM calls it 'make-or-break moment.' Trump contradicts peace talks: 'We're loading up the ships with the best weapons ever made.' Same pattern — promise peace, threaten escalation.",
    keyDevelopments: [
      'US delegation arrives Islamabad: Vance, Witkoff, Kushner (~300 members)',
      'Iran delegation arrives: Ghalibaf, Araghchi, Ahmadian, Central Bank Governor Hemmati (71 members)',
      'Pakistan Air Force escorts Iranian delegation',
      "Islamabad locked down — two-day public holiday declared, streets deserted",
      'Serena Hotel requisitioned for talks',
      "Pakistan PM: 'make-or-break moment'",
      "Trump: 'We're loading up the ships with the best weapons ever made' — contradicting peace talks",
      'Markets cautiously optimistic but oil creeping up on Hormuz uncertainty',
    ],
  },
  {
    date: 'Apr 11, 2026',
    timestamp: Date.parse('2026-04-11'),
    day: 43,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 18 },
      { scenario: 'Protracted Attrition', probability: 60 },
      { scenario: 'Full Escalation', probability: 22 },
    ],
    rationale: "Day 43: ISLAMABAD TALKS BEGIN. First direct US-Iran face-to-face since 1979 Islamic Revolution. Highest-level meeting in 47 years. Both direct and indirect negotiations. Talks go 21 hours. Two US Navy destroyers transit Hormuz — first US warships since war began. Several ships (mostly Chinese) passing through. Trump posts US is 'clearing out' Hormuz as 'favor to the world.' Israel strikes 200+ Hezbollah targets DURING talks — deliberate signal of Israel's priorities.",
    keyDevelopments: [
      'ISLAMABAD TALKS BEGIN — first direct US-Iran face-to-face since 1979',
      'Highest-level meeting in 47 years',
      'Both direct and indirect negotiations — talks go 21 hours',
      'Two US Navy destroyers transit Hormuz — first US warships since war began',
      'Several ships (mostly Chinese) passing through Hormuz',
      "Trump: US 'clearing out' Hormuz as 'favor to the world'",
      'Israel strikes 200+ Hezbollah targets DURING talks',
      'World watching Islamabad — all eyes on nuclear issue',
    ],
  },
  {
    date: 'Apr 12, 2026',
    timestamp: Date.parse('2026-04-12'),
    day: 44,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 10 },
      { scenario: 'Protracted Attrition', probability: 60 },
      { scenario: 'Full Escalation', probability: 30 },
    ],
    rationale: "Day 44: TALKS COLLAPSE. No deal after 21 hours. Vance: 'They have chosen not to accept our terms.' Main sticking point: NUCLEAR — Iran won't commit to zero enrichment. Trump: 'most points agreed but NUCLEAR was not.' Ghalibaf: 'US must decide whether they can earn our trust.' IMMEDIATE ESCALATION: US military announces it will blockade Iranian ports. This is NEW — naval blockade beyond anything pre-ceasefire. Ceasefire technically holds through ~April 22 but no framework for extension. Quick Resolution crashes. Full Escalation rises. Protracted Attrition firmly base case.",
    keyDevelopments: [
      "TALKS COLLAPSE — no deal after 21 hours",
      "Vance: 'They have chosen not to accept our terms'",
      "Main sticking point: NUCLEAR — Iran won't commit to zero enrichment",
      "Trump: 'most points agreed but NUCLEAR was not'",
      "Ghalibaf: 'US must decide whether they can earn our trust'",
      'US military announces it will BLOCKADE IRANIAN PORTS — major escalation',
      'Naval blockade is beyond anything pre-ceasefire — new phase',
      'Ceasefire technically holds through ~April 22 but no extension framework',
      'Pakistan says will continue mediating',
      'Lebanon/Israel ambassadors to meet in DC Tuesday',
    ],
  },
  {
    date: 'Apr 13, 2026',
    timestamp: Date.parse('2026-04-13'),
    day: 45,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 8 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 37 },
    ],
    rationale: "Day 45: US NAVAL BLOCKADE BEGINS. 13 tankers intercepted on Day 1. CENTCOM clarifies: blockade applies only to ships traveling to/from Iranian ports, not all Hormuz traffic. Iran has ~13 days of oil storage before field damage begins. The economic clock is now ticking. Hegseth: 'locked and loaded.' Full Escalation probability rising as US implements kinetic pressure on Iran's economy.",
    keyDevelopments: [
      'US NAVAL BLOCKADE OF IRANIAN PORTS BEGINS',
      '13 tankers intercepted on Day 1 of blockade',
      'CENTCOM: blockade only for ships to/from Iranian ports, not all Hormuz',
      'Iran has ~13 days of oil storage before field damage',
      "Hegseth: 'locked and loaded'",
      'Economic pressure clock now ticking for Iran',
      'Ceasefire technically still holds but blockade is major escalation',
    ],
  },
  {
    date: 'Apr 14, 2026',
    timestamp: Date.parse('2026-04-14'),
    day: 46,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 8 },
      { scenario: 'Protracted Attrition', probability: 52 },
      { scenario: 'Full Escalation', probability: 40 },
    ],
    rationale: "Day 46: Blockade enforcement continues. 14 vessels turned back in 72 hours. US Navy operating in force around Iranian ports. Iran's storage clock continues — 12 days remaining before field damage. No diplomatic breakthrough in sight. Both sides digging in.",
    keyDevelopments: [
      '14 vessels turned back in 72 hours of blockade',
      'US Navy enforcing around all Iranian ports',
      'Iran storage countdown: 12 days remaining',
      'No diplomatic initiatives underway',
      'Oil rising on sustained blockade pressure',
    ],
  },
  {
    date: 'Apr 15, 2026',
    timestamp: Date.parse('2026-04-15'),
    day: 47,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 7 },
      { scenario: 'Protracted Attrition', probability: 50 },
      { scenario: 'Full Escalation', probability: 43 },
    ],
    rationale: "Day 47: Blockade pressure mounting. Iran has 11 days of storage remaining before oil fields face damage from backed-up production. Both sides signaling willingness to talk but no framework. Full Escalation probability at highest level yet as kinetic and economic pressure intensify simultaneously.",
    keyDevelopments: [
      'Blockade Day 3 — pressure mounting on Iran',
      'Iran storage clock: 11 days until field damage',
      'Both sides signaling willingness to talk',
      'No framework for resuming negotiations',
      'Full Escalation probability at new high',
    ],
  },
  {
    date: 'Apr 16, 2026',
    timestamp: Date.parse('2026-04-16'),
    day: 48,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 18 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 27 },
    ],
    rationale: "Day 48: MAJOR DEVELOPMENT. Trump announces Israel-Lebanon 10-day truce — first ceasefire in that theater. THEN Iran announces Hormuz open for commercial traffic during truce period. Quick Resolution probability jumps as diplomatic momentum appears. BUT Trump clarifies US blockade on Iranian ports remains. Complexity: Lebanon quiets, Hormuz opens, but Iran ports still blockaded.",
    keyDevelopments: [
      'Trump announces Israel-Lebanon 10-day truce',
      'Iran announces Hormuz OPEN for commercial traffic during truce',
      'BUT: Trump clarifies US blockade on Iranian ports REMAINS',
      'Lebanon: first ceasefire in that theater',
      'Quick Resolution probability jumps on diplomatic momentum',
      'Complexity: Hormuz open but Iran ports still blocked',
    ],
  },
  {
    date: 'Apr 17, 2026',
    timestamp: Date.parse('2026-04-17'),
    day: 49,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 22 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 23 },
    ],
    rationale: "Day 49: Lebanon ceasefire takes effect 5pm ET. Iran confirms Hormuz passage permitted for commercial vessels. Oil CRASHES from ~$99 to $90 — markets pricing in de-escalation. BUT caveat: US blockade on Iranian ports remains in force. The split reality: ships can transit Hormuz but cannot reach Iranian ports. Quick Resolution at highest level since war began.",
    keyDevelopments: [
      'Lebanon ceasefire takes effect 5pm ET',
      'Iran confirms Hormuz passage permitted',
      'Oil CRASHES from ~$99 to $90 — biggest drop since ceasefire',
      'Markets pricing in de-escalation',
      'BUT: US blockade on Iranian ports remains',
      'Split reality: Hormuz open, Iranian ports blocked',
      'Quick Resolution probability at war-high',
    ],
  },
  {
    date: 'Apr 18, 2026',
    timestamp: Date.parse('2026-04-18'),
    day: 50,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 10 },
      { scenario: 'Protracted Attrition', probability: 52 },
      { scenario: 'Full Escalation', probability: 38 },
    ],
    rationale: "Day 50: COMPLETE REVERSAL. Iran REINSTATES Hormuz control, reverses yesterday's reopening decision until US lifts its blockade. IRGC gunboats attack a tanker near the strait. French UN peacekeeper killed in Lebanon — ceasefire fraying. Quick Resolution crashes back down. The 24-hour 'opening' was a tactical move, not a strategic shift. Pattern: hope → reversal → escalation.",
    keyDevelopments: [
      'IRAN REVERSES: reinstates Hormuz control',
      'Iran: Hormuz closed until US lifts blockade',
      'IRGC gunboats attack tanker near strait',
      'French UN peacekeeper killed in Lebanon — ceasefire fraying',
      'Quick Resolution crashes from 22% to 10%',
      '24-hour opening was tactical, not strategic',
      'Pattern: hope → reversal → escalation',
    ],
  },
  {
    date: 'Apr 19, 2026',
    timestamp: Date.parse('2026-04-19'),
    day: 51,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 7 },
      { scenario: 'Protracted Attrition', probability: 48 },
      { scenario: 'Full Escalation', probability: 45 },
    ],
    rationale: "Day 51: FULL ESCALATION. Iran FULLY CLOSES Hormuz, fires on ships attempting transit. US Navy seizes Iranian-flagged vessel. 35 vessel reversals in 24 hours. IRGC: any unauthorized transit 'will be targeted.' Both sides now actively shooting at shipping. Full Escalation probability at 45% — nearly equal to Protracted Attrition. We are now in a kinetic maritime standoff.",
    keyDevelopments: [
      'Iran FULLY CLOSES Hormuz — fires on ships',
      'US Navy seizes Iranian-flagged vessel',
      '35 vessel reversals in 24 hours',
      "IRGC: any unauthorized transit 'will be targeted'",
      'Both sides actively shooting at shipping',
      'Full Escalation at 45% — near parity with Protracted',
      'Kinetic maritime standoff underway',
    ],
  },
  {
    date: 'Apr 20, 2026',
    timestamp: Date.parse('2026-04-20'),
    day: 52,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 6 },
      { scenario: 'Protracted Attrition', probability: 50 },
      { scenario: 'Full Escalation', probability: 44 },
    ],
    rationale: "Day 52: Oil rising on sustained closure. Dozens of tankers stranded. Iran declines Monday talks proposal. Trump says US delegation will travel to Islamabad anyway — unclear if Iran will show. Diplomatic channel exists but Iran is not engaging. The blockade-counterblockade dynamic is now the defining feature of this conflict phase.",
    keyDevelopments: [
      'Oil rising on sustained Hormuz closure',
      'Dozens of tankers stranded',
      'Iran declines Monday talks proposal',
      'Trump: US delegation will go to Islamabad anyway',
      'Unclear if Iran will engage',
      'Blockade-counterblockade is defining dynamic',
      'Diplomatic channel exists but unused',
    ],
  },
  {
    date: 'Apr 21, 2026',
    timestamp: Date.parse('2026-04-21'),
    day: 53,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 8 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 37 },
    ],
    rationale: "Day 53: Trump extends Iran ceasefire INDEFINITELY — 'until their leaders can come up with a unified proposal.' Naval blockade remains. Iran responds: will not negotiate 'under the shadow of threats.' Prepared 'new cards on the battlefield.' IRGC captures two vessels 'for disrupting order in Hormuz.' The indefinite extension is both an olive branch and a threat — time pressure on Iran without deadline.",
    keyDevelopments: [
      "Trump extends Iran ceasefire INDEFINITELY",
      "'Until their leaders can come up with a unified proposal'",
      'Naval blockade REMAINS despite ceasefire extension',
      "Iran: will not negotiate 'under shadow of threats'",
      "Iran: prepared 'new cards on the battlefield'",
      "IRGC captures two vessels 'for disrupting order in Hormuz'",
      'Indefinite extension: olive branch AND threat',
    ],
  },
  {
    date: 'Apr 22, 2026',
    timestamp: Date.parse('2026-04-22'),
    day: 54,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 7 },
      { scenario: 'Protracted Attrition', probability: 53 },
      { scenario: 'Full Escalation', probability: 40 },
    ],
    rationale: "Day 54: THREE US AIRCRAFT CARRIERS now in Middle East — USS George H.W. Bush arrives. First time since 2003 Iraq invasion. US officials say Trump gave Iran 3-5 days to engage. Iran fires on container ship without warning. US seizes Iranian tanker in Indian Ocean. Trump claims HE controls Hormuz — says he's keeping it closed so Iran can't 'make $500M a day.' Guardian calls it 'dual blockade.' The rhetorical shift is significant: US now claiming ownership of the blockade.",
    keyDevelopments: [
      'THREE US AIRCRAFT CARRIERS in Middle East — first since 2003',
      'USS George H.W. Bush arrives',
      'US officials: Trump gave Iran 3-5 days to engage',
      'Iran fires on container ship without warning',
      'US seizes Iranian tanker in Indian Ocean',
      "Trump claims HE controls Hormuz — 'keeping it closed'",
      "Trump: so Iran can't 'make $500M a day'",
      "Guardian: 'dual blockade'",
    ],
  },
  {
    date: 'Apr 23, 2026',
    timestamp: Date.parse('2026-04-23'),
    day: 55,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 10 },
      { scenario: 'Protracted Attrition', probability: 58 },
      { scenario: 'Full Escalation', probability: 32 },
    ],
    rationale: "Day 55: Trump announces 3-WEEK EXTENSION of Israel-Lebanon ceasefire after White House talks — Israeli and Lebanese ambassadors meeting for first direct talks in decades. Progress on one front. BUT: Netanyahu orders 'forceful' strikes on Hezbollah anyway. Hezbollah fires rockets at northern Israel. The Lebanon track is simultaneously advancing and collapsing. Iran says seized ship was 'collaborating with American military.' US blockade total: 23 ships turned around.",
    keyDevelopments: [
      'Trump announces 3-WEEK Israel-Lebanon ceasefire extension',
      'Israeli + Lebanese ambassadors: first direct talks in decades',
      "BUT: Netanyahu orders 'forceful' strikes on Hezbollah",
      'Hezbollah fires rockets at northern Israel',
      'Lebanon track: advancing AND collapsing simultaneously',
      "Iran: seized ship 'collaborating with American military'",
      'US blockade total: 23 ships turned around',
    ],
  },
  {
    date: 'Apr 24, 2026',
    timestamp: Date.parse('2026-04-24'),
    day: 56,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 8 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 37 },
    ],
    rationale: "Day 56: Trump orders US military to 'SHOOT AND KILL' any Iranian boats laying mines in Hormuz. Iran attacks 3 commercial ships, seizes 2. Iran says blockade is 'main obstacle' to talks. Trump: 'no time pressure.' US dispatches Witkoff/Kushner to Pakistan. CENTCOM: 31 ships turned around. 26 shadow fleet vessels have breached blockade. Pope Leo XIV condemns killing of Iranian protesters. The shoot-to-kill order is the most explicit escalation authority yet.",
    keyDevelopments: [
      "Trump: 'SHOOT AND KILL' any Iranian boats laying mines",
      'Iran attacks 3 commercial ships, seizes 2',
      "Iran: blockade is 'main obstacle' to talks",
      "Trump: 'no time pressure'",
      'US dispatches Witkoff/Kushner to Pakistan',
      'CENTCOM: 31 ships turned around',
      '26 shadow fleet vessels have breached blockade',
      'Pope Leo XIV condemns killing of Iranian protesters',
    ],
  },
  {
    date: 'Apr 25, 2026',
    timestamp: Date.parse('2026-04-25'),
    day: 57,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 6 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 39 },
    ],
    rationale: "Day 57: Trump CANCELS Witkoff/Kushner trip to Pakistan. Says Iran 'offered a lot, but not enough.' Araghchi is in Islamabad meeting with PM Sharif and Army Chief Munir — then departs for Oman and Moscow. Iran seeking alternative channels. Israel kills 15+ Hezbollah fighters in Lebanon despite ceasefire. Israeli strikes kill 6 in southern Lebanon. Pezeshkian tells Iranians to conserve electricity — 'turn on two lights instead of ten.' Domestic pressure mounting.",
    keyDevelopments: [
      'Trump CANCELS Witkoff/Kushner trip to Pakistan',
      "Trump: Iran 'offered a lot, but not enough'",
      'Araghchi in Islamabad with PM Sharif + Army Chief Munir',
      'Araghchi then departs for Oman and Moscow',
      'Iran seeking alternative diplomatic channels',
      'Israel kills 15+ Hezbollah fighters despite ceasefire',
      'Israeli strikes kill 6 in southern Lebanon',
      "Pezeshkian: 'turn on two lights instead of ten'",
    ],
  },
  {
    date: 'Apr 26, 2026',
    timestamp: Date.parse('2026-04-26'),
    day: 58,
    probabilities: [
      { scenario: 'Quick Resolution', probability: 5 },
      { scenario: 'Protracted Attrition', probability: 55 },
      { scenario: 'Full Escalation', probability: 40 },
    ],
    rationale: "Day 58: THE HORMUZ DOCTRINE. Iran's Deputy Speaker Nikzad: 'We will under no circumstances return Hormuz to its previous state — this is an order from the Leader of the Revolution.' The permanent sovereignty thesis is now CODIFIED at leadership level. Araghchi returns to Islamabad from Oman, heading to Moscow next. Israel secretly deployed Iron Dome to UAE during war (Axios). Pakistan racing to save negotiations. Hezbollah says ceasefire 'has no meaning' given continued strikes. Iran's internet blackout now in 9th week — longest nation-scale shutdown on record (NetBlocks).",
    keyDevelopments: [
      "Nikzad: 'We will under no circumstances return Hormuz to previous state'",
      "'This is an order from the Leader of the Revolution'",
      'HORMUZ SOVEREIGNTY THESIS: codified at leadership level',
      'Araghchi returns to Islamabad from Oman, heading to Moscow',
      'Israel secretly deployed Iron Dome to UAE (Axios)',
      'Pakistan racing to save negotiations',
      "Hezbollah: ceasefire 'has no meaning'",
      "Iran internet blackout: 9th week — longest ever (NetBlocks)",
    ],
  },
];

// =============================================================================
// DAY 14-15 SPECIAL EVENTS
// =============================================================================

export const khargIslandStrike = {
  date: '2026-03-14',
  target: 'Military installations on Kharg Island',
  oilInfraSpared: true,
  threatLevel: 'Trump warned oil infrastructure is next if Hormuz stays blocked',
  iranResponse: 'Any attack on energy facilities triggers retaliation on regional oil infrastructure',
  significance: "90% of Iran's oil exports pass through Kharg. First strike on the island in 14 days of war.",
};

export const yuanHormuzAccess = {
  date: '2026-03-13',
  description: 'Iran considering allowing limited tanker transit if oil traded in yuan not dollars',
  indianLPGCarriers: 'Two Indian-flagged LPG carriers allowed through',
  significance: 'Direct attack on petrodollar system. Selective access expanding beyond China.',
};

// =============================================================================
// DAY 16-21 SPECIAL EVENTS
// =============================================================================

export const rasLaffanStrike = {
  date: '2026-03-18',
  trigger: "Israel struck Iran's South Pars gas field",
  retaliation: "Iran struck Qatar's Ras Laffan — world's largest LNG facility",
  damage: '17% LNG export capacity lost',
  repairTimeline: 'Up to 5 years to fully repair',
  significance: 'Even if war ends tomorrow, structural energy supply damage persists for years. This single event transforms the conflict from a temporary disruption into a permanent reshaping of global LNG markets.',
};

export const larijaniKilled = {
  date: '2026-03-17',
  significance: "Ali Larijani was the pragmatic senior official who was de facto leader after Khamenei's death. Instrumental in advancing JCPOA in 2015. His death removes the most credible negotiation partner on the Iranian side. Combined with Mojtaba Khamenei's hardline stance, this eliminates the diplomatic off-ramp.",
};

export const goldmanSachsUpdate = {
  date: '2026-03-20',
  warning: 'Brent could exceed all-time high of ~$147/bbl (set in 2008) if supply disruptions lengthen',
  worstCase: '$111/bbl by Q4 2027 if supply stays very low for 2+ months',
  favorableCase: 'Brent to $70s by Q4 2026 IF gradual Hormuz recovery from April',
  tripleDigitDuration: 'Oil likely stays in triple digits for extended period',
  fedImpact: 'Rate cuts not priced in until 2027-2028',
};

export const hormuzStatus = {
  daysClosed: 24,
  seniorIranianSource: 'Strait will not return to pre-war conditions',
  mojtabaOrder: 'Lever of closing Hormuz must certainly continue',
  indiaShips: '2 Indian-flagged ships allowed through. 22 more in ongoing negotiations.',
  navalEscorts: 'UK sent military planners. Other allies say unlikely to send ships during active hostilities.',
  trumpResponse: "Called NATO allies 'cowards' for not helping",
  day24Update: "Pezeshkian softens: 'open to all except those who violate our soil'",
};

// =============================================================================
// DAY 22-24 SPECIAL EVENTS
// =============================================================================

export const trumpUltimatum = {
  issued: '2026-03-22',
  deadline: '48 hours — open Hormuz or power plants obliterated',
  iranResponse: "Hormuz will be completely closed indefinitely if power plants hit. Will not reopen until rebuilt. All regional energy/communications infrastructure with US/Israeli links targeted.",
  resolution: "2026-03-23 — Trump delays strikes after 'productive conversations.' 5-day pause.",
  significance: "First direct US-Iran communication channel since war began. Trump's ultimatum was simultaneously his most extreme threat AND the catalyst for the first talks.",
};

export const minaAlAhmadiStrike = {
  date: '2026-03-21',
  target: "Kuwait's Mina al-Ahmadi refinery",
  capacity: '730,000 bpd',
  significance: "One of the Middle East's largest refineries. Fire sparked by two waves of Iranian drones.",
};

export const dimonaStrike = {
  date: '2026-03-22',
  target: "Dimona and Arad, southern Israel — near Negev nuclear research center",
  casualties: '100+ injured including 10 seriously in Arad',
  significance: "First time Israel's nuclear facility area targeted in the war. IAEA monitoring. Iran also fired ICBM at Diego Garcia (US-UK Indian Ocean base).",
  irgcTargets: 'Arad, Dimona, Eilat, Beersheba, Kiryat Gat',
};

export const hormuzCoalition = {
  date: '2026-03-22',
  countries: 22,
  participants: '22 nations expressed willingness to ensure safe navigation including UAE and Australia',
  status: 'Unclear what efforts would look like. UK sent military planners. Most allies say unlikely to send assets during active hostilities.',
};

export const commercialVesselsAttacked = {
  asOf: '2026-03-21',
  total: 21,
  source: 'UKMTO',
};

export const day24TurningPoint = {
  date: '2026-03-23',
  trumpAction: "Delays strikes after 'productive conversations'",
  pauseDuration: '5 days',
  pezeshkianStatement: "Hormuz open to all except those who violate our soil",
  oilReaction: 'Crashes 13%+ — Brent from $106 to $91-101 range',
  marketCaution: 'No ceasefire announced, no formal negotiations, structural damage persists',
  structuralDamage: [
    'Ras Laffan: 5 years to repair',
    '21+ ships attacked (maritime insurance won\'t normalize quickly)',
    'Larijani dead — who negotiates?',
    'Mina al-Ahmadi refinery damaged',
    'Iraqi ports shut',
    '1,444+ Iranian civilians dead',
    'Fed cuts still priced out to 2027-2028',
  ],
};

// =============================================================================
// DAY 25-26 SPECIAL EVENTS
// =============================================================================

export const diplomaticDevelopments = [
  { date: '2026-03-23', event: "Trump postpones power plant strikes 5 days. Claims 'productive conversations.' Iran denies direct talks but senior official confirms 'received points through mediators.'" },
  { date: '2026-03-24', event: "Trump claims Iran offered 'prize' and 'big present' related to Hormuz. Says Vance, Rubio, Witkoff, Kushner all involved. Iran prefers Vance as negotiator — views him as 'sympathetic to ending war.' Pakistan emerges as key intermediary. Mohammad Bagher Zolghadr named new National Security Council secretary replacing killed Larijani." },
  { date: '2026-03-25', event: "Iran REJECTS US 15-point plan. Issues 5 counter-conditions: end aggression, guarantees against future attack, war reparations, comprehensive end across ALL fronts (including proxy groups), and recognition of Iran's sovereignty over Hormuz. Parliament codifying Hormuz sovereignty with transit fees. GCC confirms Iran already charging fees. UAE calls it 'economic terrorism.' Iraq gives PMF green light for self-defense against US strikes." },
];

export const insiderTradingProbe = {
  date: '2026-03-23',
  amount: 580000000,
  description: "Financial Times found $580 million in bets on falling oil prices placed 15 minutes before Trump's Truth Social announcement about Iran talks. Triggered insider trading speculation and calls for investigation.",
  significance: "If confirmed, this would be the largest insider trading scandal related to a sitting president's social media posts.",
};

export const portArthurExplosion = {
  date: '2026-03-24',
  description: "Explosion and fire at major refinery in Port Arthur, Texas. Diesel-producing portion likely offline for extended period. Domestic supply disruption compounding Iran war effects.",
  significance: "Adding domestic refining disruption on top of global supply shock.",
};

export const usDeployments = {
  total82ndAirborne: 1000,
  total31stMEU: 2200,
  total11thMEU: 'rerouted from Indo-Pacific',
  ussNimitz: 'extended to March 2027',
  twoCarrierGroups: true,
  note: "Deploying MORE troops while claiming war is 'won' — the actions contradict the rhetoric",
};

export const trumpApproval = {
  date: '2026-03-24',
  rating: 36,
  source: 'Reuters/Ipsos',
  note: 'Lowest of second term. Attributed to cost of living and war disapproval.',
};

export const warCostUpdate = {
  totalFirst6Days: 11300000000,
  estimatedTotalDay25: 'likely exceeding $30B+',
  usWounded: 290,
  usKilled: 19,
  civilianStructuresDestroyedIran: 82000,
  note: 'IEA: 40+ energy assets damaged across 9 countries. 82,000 civilian structures destroyed in Iran.',
};

export const ieaAssessment = {
  description: 'Greatest global energy and food security challenge in history',
  supplyDisruption: 'Largest in history of global oil market',
  energyAssetsDamaged: 40,
  countriesAffected: 9,
  fertilizerImpact: '50% of global urea and sulfur exports disrupted',
  foodSecurityThreat: 'UN WFP warns of long-term global food price increases',
};

export const usFifteenPointPlan = {
  date: '2026-03-25',
  status: 'REJECTED by Iran',
  source: 'NYT first reported. Delivered via Pakistan.',
  keyTerms: "Included Iran's commitment to never pursue nuclear weapons and dismantle existing nuclear capabilities",
  iranResponse: 'Rejected. Issued 5 counter-conditions.',
  note: "Channel 12 summary was early version — changes made since. But core ask (nuclear dismantlement) was always going to be rejected by Iran.",
};

export const iranFiveConditions = {
  date: '2026-03-25',
  conditions: [
    'End to aggression by the enemy',
    'Concrete guarantees preventing recurrence of war',
    'Clear determination of responsibility',
    'Guaranteed payment of war damages and compensation',
    'Comprehensive end to war across ALL fronts including against all resistance groups (Hezbollah, etc.), and recognition of Iran\'s sovereignty over Strait of Hormuz',
  ],
  deliveredVia: 'Pakistan — regional intermediary trusted by both sides',
  araghchiResponse: 'We want to end the war only on our own terms',
  significance: "Conditions are non-starters for US/Israel. War reparations, sovereignty over Hormuz, and protection of ALL proxy groups (Hezbollah) are maximalist demands. But they establish Iran's negotiating floor — the real question is what they'll actually accept vs. what they're opening with.",
};

export const hormuzSovereigntyClaim = {
  date: '2026-03-25',
  description: 'Iranian parliament pursuing plan to formally codify sovereignty, control and oversight over Strait of Hormuz with revenue collection through transit fees',
  gccResponse: 'GCC secretary-general says Iran already charging fees for safe passage — violating international law',
  uaeResponse: "Abu Dhabi National Oil Co. head called it 'economic terrorism' — 'every nation pays the ransom at the gas pump, grocery store and pharmacy'",
  significance: "THIS IS THE STRUCTURAL DEVELOPMENT THAT OUTLASTS THE WAR. Iran is converting a wartime blockade into permanent legal/sovereign control over the strait. If codified into Iranian law, this persists regardless of ceasefire. It's the equivalent of a creditor converting a temporary lien into permanent equity — Iran wants ownership of the chokepoint, not just leverage over it.",
};

export const iraqEscalation = {
  date: '2026-03-25',
  event: "Iraqi PM gave al-Hashd al-Shaabi (Iran-backed PMF) green light for self-defense against US strikes",
  trigger: 'US A-10 aircraft struck PMF targets in Anbar Province, killing 7 Iraqi soldiers near army medical center',
  iraqResponse: 'Summoned top US diplomat. Formal complaint of breach of international law.',
  significance: 'Iraq edging from reluctant bystander to active participant against US forces. PMF is officially part of Iraqi army. If Iraq formally opposes US strikes, the legal basis for US operations in Iraq collapses.',
};

export const sriLankaEnergyReduction = {
  date: '2026-03-25',
  reduction: '25% cut in energy consumption',
  significance: 'Small nations bearing brunt of energy crisis. Global demand destruction spreading.',
};

export const mbsPressure = {
  date: '2026-03-25',
  report: 'Saudi Crown Prince MBS pressing Trump to continue strikes on Iran',
  significance: 'Saudi Arabia sees this as once-in-a-generation opportunity to permanently weaken main rival. Willing to take short-term damage for long-term strategic gain.',
};

// =============================================================================
// DAY 27-31 SPECIAL EVENTS
// =============================================================================

export const houthiEntry = {
  date: '2026-03-28',
  event: 'Houthis launch first strikes on Israel — missile toward southern region, UAV + missile toward Eilat',
  intercepted: 'One missile intercepted over Red Sea',
  significance: "War now spans from Mediterranean (Lebanon) to Red Sea (Yemen) to Indian Ocean (Diego Garcia). Houthi Red Sea disruption from 2023-2024 could resume, threatening BOTH Hormuz and Bab al-Mandab simultaneously. If both chokepoints are blocked, Middle East energy is completely landlocked.",
};

export const nuclearFacilityStrikes = {
  arakReactor: { date: '2026-03-27', status: 'IAEA confirmed IR-40 heavy water reactor no longer operational after serious damage' },
  bushehr: { date: '2026-03-25', status: 'Area within Bushehr nuclear complex struck' },
  natanz: { date: 'various', status: 'Entrance buildings damaged per IAEA satellite imagery' },
  significance: "Iran's nuclear infrastructure being systematically degraded. This was a stated US war objective. But Iran's enrichment knowledge persists — you can destroy facilities but not expertise.",
};

export const steelFactoryStrikes = {
  date: '2026-03-26',
  targets: ['Khuzestan Steel near Ahvaz', 'Mobarakeh Steel in Isfahan'],
  significance: "Partially IRGC-owned. Israel now striking economic/industrial targets, not just military. This is economic warfare — destroying Iran's industrial base to prevent post-war recovery.",
};

export const princeSultanBaseStrike = {
  date: '2026-03-27',
  casualties: '15 US service members wounded (5 critically). Aircraft damaged.',
  context: "Occurred HOURS after Trump and Hegseth announced 'neutralization' of Iran's military. Russia reportedly provided satellite imagery to Iran for targeting.",
  significance: 'Iran demonstrating continued strike capability despite claims of military neutralization.',
};

export const diplomaticFrameworkDay30 = {
  pakistanMeeting: { date: '2026-03-29', participants: 'Pakistan, Saudi Arabia, Turkey, Egypt foreign ministers in Islamabad' },
  pakistanRole: 'Facilitating indirect talks. Iran allowed 20 Pakistan-flagged ships through Hormuz (2/day).',
  trumpClaims: "Iran agreed to 'most of' 15-point plan. Gave US oil as proof of seriousness.",
  iranDenials: "FM Araghchi: 'No negotiations have happened with the enemy. We do not plan on any negotiations.'",
  trumpDeadline: 'Power plant strikes extended to April 6, 2026',
  khargIsland: "Trump considering seizure. 'Maybe we take Kharg Island, maybe we don't. We'd have to be there for a while.'",
};

export const russiaInvolvement = {
  date: '2026-03-28',
  allegation: 'Zelensky claims Russia provided Iran updated satellite imagery of Prince Sultan Air Base before Iranian strike',
  ukraineSituation: 'Ukraine facing growing pressure as war in Iran draws US attention and resources away',
  significance: 'Russia-Iran intelligence sharing confirmed. The Iran war is not isolated — it\'s connected to the Russia-Ukraine dynamic.',
};

export const globalEconomicImpactDay31 = {
  ieaAssessment: 'Biggest oil shock in history. Largest supply disruption ever.',
  australiaResponse: 'Free public transport in 2 states. Considering fuel rationing.',
  sriLanka: 'Cutting energy consumption 25%',
  chinaGas: 'Up 20% since war began. Government subsidizing to limit to +50 cents/gallon',
  usGas: '$3.93 national avg. California $5.62. Up 40% since January.',
  brentSinceWar: 'Up 50%+ from pre-war $73',
  oilOnWater: '20M bpd disrupted from Middle East producers',
};

export const iraqPMFInIran = {
  date: '2026-03-29',
  description: "Footage showed Iraq's Popular Mobilization Forces deployed inside Iran — Iraqi militia fighting alongside Iranian forces",
  significance: 'Iraq-based Shia militia now physically present in Iran. Combined with PM\'s green light for self-defense, Iraq is becoming an active combatant.',
};

// Legacy export for backwards compatibility
export const fifteenPointPlan = usFifteenPointPlan;

// =============================================================================
// REFERENCE DATA
// =============================================================================

export const costAsymmetry: CostAsymmetryItem[] = [
  {
    name: 'Shahed Drone',
    shortName: 'Shahed Drone',
    iranCost: 35000,
    interceptorCost: 3700000,
    ratio: Math.round(3700000 / 35000),
    category: 'drone',
    iranLabel: '$35K',
    interceptorLabel: '$3.7M',
  },
  {
    name: 'Ballistic Missile (low)',
    shortName: 'Missile (low)',
    iranCost: 200000,
    interceptorCost: 9700000,
    ratio: Math.round(9700000 / 200000),
    category: 'missile',
    iranLabel: '$200K',
    interceptorLabel: '$9.7M',
  },
  {
    name: 'Ballistic Missile (high)',
    shortName: 'Missile (high)',
    iranCost: 500000,
    interceptorCost: 27900000,
    ratio: Math.round(27900000 / 500000),
    category: 'missile',
    iranLabel: '$500K',
    interceptorLabel: '$27.9M',
  },
];

export const sectorVulnerability: SectorVulnerabilityItem[] = [
  {
    sector: 'Retail',
    leverage: 85,
    refinancingExposure: 90,
    oilSensitivity: 70,
    consumerDependence: 95,
    currentSpread: 75,
    notes: 'Already distressed subsectors face accelerating consumer pullback',
    color: '#C8102E',
  },
  {
    sector: 'Commercial RE',
    leverage: 90,
    refinancingExposure: 95,
    oilSensitivity: 40,
    consumerDependence: 60,
    currentSpread: 85,
    notes: 'Office, mall, and hotel REITs face distressed refinancings',
    color: '#B07D2B',
  },
  {
    sector: 'Airlines',
    leverage: 80,
    refinancingExposure: 70,
    oilSensitivity: 95,
    consumerDependence: 85,
    currentSpread: 70,
    notes: 'Double hit: fuel costs spike while Middle East routes shut',
    color: '#B7791F',
  },
  {
    sector: 'Cruise Lines',
    leverage: 95,
    refinancingExposure: 85,
    oilSensitivity: 80,
    consumerDependence: 100,
    currentSpread: 90,
    notes: 'Most leveraged consumer discretionary subsector',
    color: '#2E7D4F',
  },
  {
    sector: 'Speculative Tech',
    leverage: 60,
    refinancingExposure: 80,
    oilSensitivity: 20,
    consumerDependence: 40,
    currentSpread: 65,
    notes: 'Pre-revenue companies burning cash faster than they can raise it',
    color: '#4F7F7A',
  },
  {
    sector: 'Energy E&P',
    leverage: 50,
    refinancingExposure: 45,
    oilSensitivity: 30,
    consumerDependence: 15,
    currentSpread: 40,
    notes: 'Short-term windfall, long-term policy headwind',
    color: '#7A6C9D',
  },
  {
    sector: 'Healthcare',
    leverage: 35,
    refinancingExposure: 40,
    oilSensitivity: 25,
    consumerDependence: 50,
    currentSpread: 30,
    notes: 'Economic stress + Democratic trifecta = expanded coverage',
    color: '#7A6C9D',
  },
];

export const hySpreadHistory: HySpreadHistoryEntry[] = [
  { date: '2008', spread: 1800, event: 'Financial Crisis Peak' },
  { date: '2009', spread: 800, event: 'Recovery begins' },
  { date: '2010', spread: 600 },
  { date: '2011', spread: 700, event: 'European debt crisis' },
  { date: '2012', spread: 550 },
  { date: '2013', spread: 400 },
  { date: '2014', spread: 350 },
  { date: '2015', spread: 650, event: 'Oil crash / China fears' },
  { date: '2016', spread: 700, event: 'Energy defaults peak' },
  { date: '2017', spread: 350 },
  { date: '2018', spread: 400, event: 'Q4 selloff' },
  { date: '2019', spread: 350 },
  { date: '2020', spread: 1100, event: 'COVID-19 shock' },
  { date: '2021', spread: 300, event: 'Easy money peak' },
  { date: '2022', spread: 500, event: 'Russia-Ukraine / Fed hikes' },
  { date: '2023', spread: 400 },
  { date: '2024', spread: 320 },
  { date: '2025', spread: 281, event: 'Historic lows' },
  { date: 'Mar 2026', spread: 565, event: 'Iran conflict Day 21 — Ras Laffan structural damage, Larijani killed, $119 oil', isCurrent: true },
];

// =============================================================================
// FIELD NOTES DATA
// =============================================================================

export const fieldNotes: Record<number, FieldNoteDay> = {
  6: {
    day: 6,
    date: 'March 5, 2026',
    title: 'P&I Expiration Day: The Insurance Chokepoint Arrives',
    summary: "Lloyd's P&I coverage officially expires. Zero tanker transits for 3rd consecutive day. 200+ tankers stranded, 60 VLCCs trapped (8% of global fleet). WTI jumps 8.5% - biggest single-day gain since May 2020. Dow wipes out all 2026 gains. War costing U.S. $1B/day.",
    thesisScorecard: [
      {
        thesis: 'Insurance mechanism as primary leverage tool',
        initialConfidence: 75,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          "Lloyd's P&I coverage officially expired",
          'Zero tanker transits for 3 consecutive days',
          '200+ tankers stranded, 60 VLCCs trapped',
          '20,000 seafarers stranded (IMO)',
        ],
      },
      {
        thesis: 'GCC infrastructure targeting over military',
        initialConfidence: 70,
        currentConfidence: 88,
        status: 'confirmed',
        evidence: [
          'Ras Laffan, Mesaieed, Dubai systematically hit',
          'Desalination plants prioritized',
          'Pattern consistent with economic coercion',
        ],
      },
      {
        thesis: 'Interceptor cost asymmetry unsustainable',
        initialConfidence: 80,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'War costing U.S. $1B/day (NBC sources)',
          'Iran drone-heavy strategy continues',
          'Heritage warning thresholds reached',
        ],
      },
      {
        thesis: 'Credit market transmission mechanism',
        initialConfidence: 65,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          '10yr yield 4.13% (up 16bps from pre-war)',
          'Fed cuts pushed to summer',
          'AAL downgraded, negative EPS forecast',
          'Airlines down 5%+ in single day',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[5], // Day 6 update
    keyDevelopments: [
      {
        category: 'Insurance & Shipping',
        items: [
          "Lloyd's P&I coverage officially expires",
          'Zero tanker transits for 3rd consecutive day',
          '200+ tankers stranded, 60 VLCCs trapped (8% of global fleet)',
          '20,000 seafarers and 15,000 cruise passengers stranded (IMO)',
          'Cape of Good Hope diversions surged 112% in single day',
        ],
      },
      {
        category: 'Energy Markets',
        items: [
          'Brent crude closes at $85.41 (+4.9% on Day 6)',
          'WTI +8.5%, biggest single-day gain since May 2020',
          'Oil up ~20% for the week',
          'Trump refuses to tap Strategic Petroleum Reserve',
          'U.S. gas at $3.26/gal, up 26 cents in one week',
        ],
      },
      {
        category: 'Military Situation',
        items: [
          'Iranian casualties now exceed 1,230',
          'Azerbaijan airport struck',
          'WHO reports 13 attacks on Iranian health infrastructure',
          'Cyprus: U.S. evacuation operations',
          'Turkey: NATO intercepted Iranian missile',
        ],
      },
      {
        category: 'Credit & Equity Markets',
        items: [
          'Dow wipes out all 2026 gains',
          '10-year yield at 4.13% (up from 3.97% pre-war)',
          'Airlines destroyed: AAL -5.4%, UAL -5%, DAL -4%, LUV -6%',
          'AAL downgraded by Rothschild, negative EPS forecast',
          'Fed rate cut expectations pushed to summer',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 85.41,
      vlccRate: 460000,
      hySpread: 410,
      vix: 26.5,
      usGas: 3.26,
    },
    tradingImplications: [
      'Long oil thesis validated - WTI +8.5% single day confirms transmission',
      'Airlines now active restructuring candidates - AAL negative EPS forecast',
      'Dow wiped out 2026 gains - systematic risk repricing underway',
      '10yr yield at 4.13% - Fed cuts pushed to summer, stagflation risk rising',
      'War at $1B/day with no off-ramps - protracted attrition confirmed',
    ],
  },
  7: {
    day: 7,
    date: 'March 6, 2026',
    title: "Zero Transits, $1B/Day Burn Rate, and No Off-Ramps",
    summary: "Every off-ramp has been systematically closed. Congress won't act - both chambers killed war powers resolutions. Iran won't negotiate - FM Araghchi refuses all talks. Trump promising open-ended commitment: 'no time limits.' The strait is sealed by insurance, not mines. The macro transmission chain from Part II is running ahead of base case timeline.",
    thesisScorecard: [
      {
        thesis: 'Hormuz closed by insurance, not navy',
        initialConfidence: 75,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          'Zero tanker transits for 4 consecutive days',
          '200+ tankers stranded, 60 VLCCs trapped (8% of global fleet)',
          "P&I coverage officially expired - Lloyd's war risk cancellation in effect",
          '20,000 seafarers and 15,000 cruise passengers stranded (IMO)',
        ],
      },
      {
        thesis: 'Protracted attrition > 4 weeks',
        initialConfidence: 50,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Trump: "no time limits"',
          'Hegseth: war "only just begun"',
          'Both House and Senate kill war powers resolutions',
          'Iran FM refuses all negotiation',
        ],
      },
      {
        thesis: 'Iran refuses to negotiate',
        initialConfidence: 60,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'FM Araghchi on NBC: "no reason to negotiate with those who are not honest"',
          'U.S. attacked during active talks - trust destroyed',
          'Mojtaba Khamenei emerging as next supreme leader',
        ],
      },
      {
        thesis: 'Credit/macro transmission active',
        initialConfidence: 65,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          '10yr yield 4.13% (up 16bps from pre-war)',
          'Fed cuts pushed to summer',
          'AAL downgraded, negative EPS forecast',
          'Dow wiped out all 2026 gains',
        ],
      },
      {
        thesis: 'Cost asymmetry bankrupting defenders',
        initialConfidence: 80,
        currentConfidence: 88,
        status: 'developing',
        evidence: [
          'War costing U.S. $1B/day (NBC sources)',
          'Iran drone-heavy strategy continues',
          'Interceptor stockpiles depleting faster than production',
        ],
      },
      {
        thesis: 'Airlines as restructuring candidates',
        initialConfidence: 55,
        currentConfidence: 85,
        status: 'developing',
        evidence: [
          'AAL downgraded by Rothschild, negative EPS forecast',
          'Sector down 5%+ in single day',
          'Middle East routes closed, fuel costs spiking',
        ],
      },
      {
        thesis: 'Geographic escalation',
        initialConfidence: 70,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Now 15+ countries involved',
          'Kurdish ground offensive opens new front',
          'Cyprus: U.S. evacuation',
          'Turkey: NATO missile intercept',
          'Pakistan: U.S. consulate closed',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[6], // Day 7 update
    keyDevelopments: [
      {
        category: 'Political/Diplomatic',
        items: [
          'Both House and Senate kill war powers resolutions — zero legislative off-ramps',
          'Trump: "no time limits"',
          'Hegseth: war "only just begun"',
          'Iran FM Araghchi on NBC: refuses all negotiation, says U.S. attacked during active talks',
          'Mojtaba Khamenei (son) emerging as next supreme leader',
          'Trump demands role in choosing next Iranian leader — "unacceptable"',
          'China dispatches special envoy',
        ],
      },
      {
        category: 'Military Escalation',
        items: [
          'Israel launches "broad-scale wave" on Tehran overnight',
          'Tehran residential areas and Tehran University vicinity hit',
          'Israel orders evacuation of ALL southern Beirut — 500K+ people',
          'Kurdish ground offensive in northwest Iran — first ground front',
          'Iran targeting radar systems across Arabian Peninsula to degrade air defenses',
          'IRIS Bushehr interned by Sri Lanka — first warship interned in neutral country since WWII',
        ],
      },
      {
        category: 'Shipping & Trade',
        items: [
          'Zero tanker transits for 4th consecutive day',
          'Strait effectively sealed by insurance mechanism',
          'IMO: 20,000 seafarers + 15,000 cruise passengers stranded',
          'Cape of Good Hope diversions continue surging',
        ],
      },
      {
        category: 'Markets & Economy',
        items: [
          'War costing U.S. $1B/day (NBC sources)',
          'Dow wiped out all 2026 gains',
          'Oil up 20%+ for the week',
          'Airlines getting destroyed — sector down 5%+ in single day',
          'AAL negative EPS forecast — first concrete restructuring signal',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 85.41,
      vlccRate: 460000,
      hySpread: 410,
      vix: 26.5,
      usGas: 3.26,
    },
    tradingImplications: [
      'Quick Resolution probability → 5%. All off-ramps systematically closed',
      'Protracted Attrition → 60%. This is now the base case',
      'AAL negative EPS = first concrete company transitioning to restructuring candidate',
      'The macro transmission chain from Part II is running ahead of base case timeline',
      'Insurance thesis fully validated — strait sealed without mines or naval blockade',
      'Every indicator suggests extended conflict with no negotiated resolution',
    ],
  },
  8: {
    day: 8,
    date: 'March 7, 2026',
    title: "1,465 Munitions on Tehran, Selective Transit Emerges, GPS Jamming Spreads",
    summary: "Israel's weekend bombing campaign (400+ targets, 1,465 munitions) is the most intense since war began. Targeting Mehrabad Airport and IRGC university signals intent to degrade regime infrastructure. Selective transit emerging (China/Iran-linked vessels) creates de facto two-tier Hormuz — closed to West, open to strategic allies. This fundamentally changes the conflict economics.",
    thesisScorecard: [
      {
        thesis: 'Insurance mechanism as primary leverage tool',
        initialConfidence: 75,
        currentConfidence: 97,
        status: 'confirmed',
        evidence: [
          "P&I expired, de facto blockade sustained by market forces not navy",
          'Selective transit for China/Iran-linked vessels only',
          '98% transit collapse for Western shipping',
        ],
      },
      {
        thesis: 'GCC infrastructure targeting',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Continued strikes on Gulf states',
          'PRIMA tanker struck by Iranian drone',
          'GPS jamming affecting 1,650+ ships',
        ],
      },
      {
        thesis: 'Interceptor cost asymmetry',
        initialConfidence: 80,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          '1,465 munitions in one weekend — Israel burning through stockpiles',
          '400+ targets hit by 80+ fighter jets',
          'War costing U.S. $1B/day continues',
        ],
      },
      {
        thesis: 'Credit market transmission',
        initialConfidence: 65,
        currentConfidence: 88,
        status: 'confirmed',
        evidence: [
          'Oil climbing toward $100',
          'Fed cuts increasingly unlikely',
          'HY spreads at 435 bps',
        ],
      },
      {
        thesis: 'Selective Hormuz access (China/allies)',
        initialConfidence: 80,
        currentConfidence: 85,
        status: 'developing',
        evidence: [
          'Iran allowing Chinese vessels through',
          'Only 3 transits: Palau, Iran, Liberia flagged',
          'Western shipping blocked entirely',
          'If confirmed as policy, most significant geopolitical development of conflict',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[7], // Day 8 update
    keyDevelopments: [
      {
        category: 'Military',
        items: [
          'Israeli Air Force attacks 400+ targets, drops 1,465 munitions',
          '80+ fighter jets strike Tehran alone with ~230 munitions',
          'IDF destroys 16 Quds Force cargo aircraft at Mehrabad Airport',
          'IRGC university targeted',
          'Kurdish ground offensive continues',
        ],
      },
      {
        category: 'Shipping',
        items: [
          'Only 3 vessels transit Hormuz (Palau, Iran, Liberia flagged)',
          'PRIMA tanker struck by Iranian drone',
          'GPS jamming affects 1,650+ ships in Gulf (up 55%)',
          'Iran confirms selective access — closed to US/Israel/West, open to China/others',
        ],
      },
      {
        category: 'Energy',
        items: [
          'Oil climbing toward $100',
          'Brent at ~$92+ (WTI closed Friday Mar 7 up +$9.89 / +12.21%)',
          'WTI surged 12.2% on Friday alone — largest single-day percentage gain in months',
          'VLCC rates sustained at $440K/day',
          "Qatar's energy minister told FT the war could 'bring down the economies of the world' — predicted $150/bbl and all Gulf exporters shut down within weeks",
        ],
      },
      {
        category: 'Geopolitical',
        items: [
          'Two-tier Hormuz emerging — fundamental change in energy geopolitics',
          'China gets preferential oil access',
          'Western shipping blocked entirely',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 92.0,
      vlccRate: 440000,
      hySpread: 435,
      vix: 27.5,
      usGas: 3.38,
    },
    tradingImplications: [
      'WTI surged 12.2% on Friday alone — largest single-day percentage gain in months',
      'Selective Hormuz access changes energy geopolitics permanently — China gets preferential oil access',
      "Israel's munitions burn rate raises stockpile sustainability questions",
      'GPS jamming affecting 1,650+ ships — maritime insurance costs will stay elevated even after conflict',
      'Oil approaching $100 — credit market transmission accelerating',
    ],
  },
  9: {
    day: 9,
    date: 'March 8, 2026',
    title: "New Supreme Leader, Oil Infrastructure Targeted, War Enters 'New Phase'",
    summary: "Three escalatory developments in 24 hours. First: Israel strikes Iranian oil infrastructure for the first time — Shahr Rey, Shahran, Nobonyad depots. This crosses a threshold that had been avoided for 9 days. Second: Mojtaba Khamenei named Supreme Leader — regime continuity, no moderation signal, IRGC allegiance pledged. Third: senior Iranian official explicitly warns of retaliatory strikes on regional energy infrastructure, calling this a 'new phase.' Both sides are now targeting each other's energy infrastructure.",
    thesisScorecard: [
      {
        thesis: 'Insurance mechanism as primary leverage tool',
        initialConfidence: 75,
        currentConfidence: 97,
        status: 'confirmed',
        evidence: [
          'De facto blockade sustained for 9+ days',
          'Selective transit only for non-Western vessels',
          '250+ tankers now stranded',
        ],
      },
      {
        thesis: 'Protracted attrition confirmed',
        initialConfidence: 50,
        currentConfidence: 96,
        status: 'confirmed',
        evidence: [
          'New Supreme Leader named — no moderation signal',
          'Trump: "terms of surrender"',
          'IRGC pledges allegiance to Mojtaba Khamenei',
        ],
      },
      {
        thesis: 'Credit market transmission',
        initialConfidence: 65,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'HY spreads at 450 bps',
          'Oil at $93 and climbing',
          'G7 discusses emergency SPR release',
        ],
      },
      {
        thesis: 'Energy infrastructure targeting bilateral',
        initialConfidence: 85,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Israel strikes Iranian oil depots for first time',
          'Iran threatens retaliatory strikes on regional energy infrastructure',
          'Senior official declares "new phase"',
          'Escalation spiral toward energy war',
        ],
      },
      {
        thesis: 'Geographic escalation',
        initialConfidence: 70,
        currentConfidence: 97,
        status: 'confirmed',
        evidence: [
          'Saudi Arabia first fatalities (2 dead, 12 injured)',
          'Bahrain desalination plant hit',
          'Kuwait airport fuel tanks targeted',
          'Israel strikes central Beirut hotel',
        ],
      },
      {
        thesis: 'GCC water infrastructure targeted',
        initialConfidence: 70,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'BILATERAL — U.S. struck Qeshm Island desalination plant (Day 8), cutting water to 30 villages',
          'Iran struck Bahrain desalination plant (Day 9) — first Gulf water infrastructure strike of war',
          'Both sides have now crossed water infrastructure targeting threshold',
          "Part I's 'GCC Water Clock' framework is now live",
          'Chatham House called Bahrain strike a "major escalation"',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[8], // Day 9 update
    keyDevelopments: [
      {
        category: 'Leadership',
        items: [
          'Mojtaba Khamenei (son) named new Supreme Leader',
          'IRGC and top leaders pledge allegiance',
          'Trump calls him "lightweight"',
          'No moderation signal from new leadership',
        ],
      },
      {
        category: 'Military',
        items: [
          'Israel strikes Iranian oil infrastructure for first time',
          'Shahr Rey, Shahran, Nobonyad oil depots hit in Tehran',
          'Military refineries and IRGC university targeted',
          'Israel strikes hotel in central Beirut, killing 4',
        ],
      },
      {
        category: 'Regional',
        items: [
          'Saudi Arabia first fatalities: 2 killed, 12 injured in Riyadh Province',
          'Kuwait airport fuel tanks targeted by drones',
          'US orders non-emergency diplomats out of Saudi Arabia',
        ],
      },
      {
        category: 'Water Infrastructure (NEW ESCALATION)',
        items: [
          'Bahrain desalination plant hit by Iranian drone — FIRST Gulf water infrastructure strike of the war',
          "Iran's justification: U.S. struck Qeshm Island desalination plant first (Day 8), cutting water to 30 villages",
          'FM Araghchi on X: "the U.S. set this precedent, not Iran"',
          'Water infrastructure targeting is now BILATERAL — both sides have crossed this line',
          'Chatham House called it a "major escalation" — Iran moving from economic targets to ones affecting "livelihoods of Gulf citizens"',
          '400+ desalination plants in the Gulf produce 40% of world\'s desalinated water',
          'Bahrain has 103 plants, zero natural aquifers, majority of drinking water from desalination',
          'Bahrain, Kuwait, Qatar rank among five most water-stressed countries globally',
          'Bahrain confirmed this specific strike did NOT disrupt operations — but capability and willingness now demonstrated',
          'Deliberate attacks on civilian water infrastructure violate Article 54 of Additional Protocol I to the Geneva Conventions',
        ],
      },
      {
        category: 'Diplomatic',
        items: [
          '7th US service member killed',
          'Trump says he and Israel will set "terms of surrender"',
          'G7 finance ministers discuss coordinated emergency SPR release',
          'Senior Iranian official warns of "new phase" — threatens regional energy infrastructure',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 92.69,
      vlccRate: 450000,
      hySpread: 450,
      vix: 28.0,
      usGas: 3.42,
    },
    tradingImplications: [
      'Oil infrastructure targeting is now bilateral — energy war thesis confirmed',
      'New supreme leader = no off-ramp from Iranian side',
      'Saudi fatalities could trigger Saudi response — MBS was already pushing for war',
      '$100/bbl oil now inevitable — question is $120 or $150',
      'G7 SPR release discussion signals panic at governmental level',
      'Water infrastructure targeting introduces risk vector markets haven\'t priced: if desalination capacity degraded 30-50% in any GCC state, potable water exhaustion occurs within 7-14 days (per Part I analysis). This would force evacuation of civilian populations and collapse of economic activity — an outcome that dwarfs oil price impact',
    ],
  },
  10: {
    day: 10,
    date: 'March 9, 2026',
    title: "Oil Breaches $100, Asia Crashes, $119 Intraday — Energy Crisis Arrives",
    summary: "Full Escalation becomes base case for the first time. Oil breaching $100 is the threshold that transforms this from a regional military conflict into a global economic event. The Brent move — 23% in a single session, largest since 1988 — is not a spike, it's a regime change in energy pricing. Saudi Arabia and Iraq cutting production due to storage constraints means supply destruction is now structural. G7 discussing coordinated SPR release is the governmental equivalent of a margin call.",
    thesisScorecard: [
      {
        thesis: 'Insurance mechanism as primary leverage tool',
        initialConfidence: 75,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          'De facto blockade sustained for 10 days',
          'Selective transit only — Western shipping blocked',
          '250+ tankers stranded, 60 VLCCs trapped',
        ],
      },
      {
        thesis: 'Credit market transmission',
        initialConfidence: 65,
        currentConfidence: 93,
        status: 'confirmed',
        evidence: [
          'Oil above $100, VIX approaching 30',
          'Asian markets crash: Nikkei -7.5%, KOSPI -8.1%',
          'HY spreads at 475 bps',
          'G7 discussing SPR release',
        ],
      },
      {
        thesis: 'Cost asymmetry unsustainable',
        initialConfidence: 80,
        currentConfidence: 94,
        status: 'confirmed',
        evidence: [
          'War cost accelerating — $1B/day confirmed',
          'Oil infrastructure damage on both sides',
          'Israel needs 3 more weeks to accomplish goals',
        ],
      },
      {
        thesis: 'Energy infrastructure targeting bilateral',
        initialConfidence: 85,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          'Confirmed — both sides now hitting energy assets',
          'Iranian oil depots struck',
          'Regional GCC infrastructure under attack',
        ],
      },
      {
        thesis: 'Airlines as restructuring candidates',
        initialConfidence: 55,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'AAL, Spirit already distressed pre-war',
          'Entire sector now in crisis territory',
          'Fuel hedges expiring, ticket demand dropping',
        ],
      },
      {
        thesis: 'Full Escalation becomes base case',
        initialConfidence: 35,
        currentConfidence: 53,
        status: 'confirmed',
        evidence: [
          'Oil above $100 — global economic event',
          'Both sides targeting energy infrastructure',
          'No off-ramps: Congress rejected, Iran refuses negotiation',
          'G7 emergency coordination signals systemic threat',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[9], // Day 10 update
    keyDevelopments: [
      {
        category: 'Energy',
        items: [
          'Brent crude hits $119 intraday, settles ~$108-110',
          'WTI $108.62 (+19.4% single session) — largest daily $ gain since 1988',
          'Crude up ~50% since conflict started',
          'First time above $100 since 2022',
          'Trump still refuses to tap Strategic Petroleum Reserve',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Asian markets crash: Nikkei -7.5%, KOSPI -8.1%',
          'European markets down 2-3%',
          'S&P futures -1.7% to -2.1%',
          'VIX 29.48 (+24%), approaching crisis territory (30+)',
          'US gas hits $3.478/gal (AAA), up $0.50 in one week',
        ],
      },
      {
        category: 'Supply',
        items: [
          'Saudi Arabia production cuts deepening — running out of storage',
          'Iraq output down 70% due to storage saturation from Hormuz closure',
          'Bahrain\'s Bapco declared force majeure — analysts expect more Gulf producers to follow as storage fills',
          'JPMorgan warns Brent could hit $120 if Gulf producers exhaust storage',
          'Goldman Sachs warns $140-150 if Hormuz stays disrupted beyond 30 days, potentially triggering synchronized global downturn',
          'G7 considering coordinated SPR release',
        ],
      },
      {
        category: 'Conflict',
        items: [
          '8th US service member killed',
          'Iran announces nationwide gathering to pledge allegiance to new Supreme Leader',
          'Israel says needs 3 more weeks to accomplish goals',
          'Regional energy infrastructure attacks continue',
          'Nearly 3,000 Iranian missiles and drones launched at Gulf states since war began (Arab League figures)',
          'Bahrain alone: intercepted 95 missiles and 164 drones',
          'UAE: 100+ missiles and drones in single barrages',
        ],
      },
      {
        category: 'Rhetoric Divergence (CRITICAL)',
        items: [
          'Trump: war could end "soon," goals "pretty much complete," called it "short-term excursion"',
          'Hegseth on 60 Minutes (same day): plans 500-lb, 1,000-lb, 2,000-lb bombs, says "we haven\'t even really got to start that effort"',
          'IDF says needs 3 more weeks to accomplish goals',
          'This Pentagon vs White House disconnect is significant — markets reacting to rhetoric, not reality',
        ],
      },
      {
        category: 'Oil Price Whiplash',
        items: [
          'Oil hit $119 intraday then dropped sharply toward $80-88 WTI in post-settlement trading after Trump\'s "could end soon" remarks',
          'Brent stayed higher at ~$99 while WTI fell to ~$88 — divergence between U.S. benchmark (reacting to rhetoric) and international benchmarks (pricing physical reality)',
          'This divergence itself is a data point: U.S. markets pricing Trump statements, global markets pricing supply fundamentals',
        ],
      },
      {
        category: 'Intelligence & Geopolitical',
        items: [
          'AP sources: Russia gave Iran information to help hit U.S. military targets — new escalation vector',
          'Araghchi on Meet the Press declined to confirm or deny Russian intelligence sharing',
          'Iran internal rift: Pezeshkian (apologized to neighbors, called for diplomacy) vs hardliners/IRGC (continued strikes)',
          'Mojtaba Khamenei appointment resolved the rift — hardline continuity wins',
        ],
      },
      {
        category: 'U.S. Forces On-Ground (Stars & Stripes)',
        items: [
          'U.S. service members and families in Bahrain relying on local markets — on-base commissaries shuttered',
          'Bahrain government cracking down on price gouging, shut down at least one food store',
          'King Fahd Causeway to Saudi Arabia is primary ground route out of Bahrain',
          'Bahrain airspace remains closed',
        ],
      },
      {
        category: 'Israeli Casualties (Alma Research Center)',
        items: [
          '12 Israeli civilians killed, 2,142 injured since war began',
          '3,000+ Israelis displaced',
          'Hezbollah: 223 attack waves since joining March 2',
          'Iran attack wave frequency declining: peaked 55 on Day 2, down to 9 on Day 9 — confirms missile rationing thesis',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 108.75,
      vlccRate: 455000,
      hySpread: 475,
      vix: 29.48,
      usGas: 3.478,
    },
    tradingImplications: [
      '$100 oil is not a ceiling — it\'s a floor if Hormuz stays closed. JPMorgan warns $120 if storage exhausted. Goldman Sachs warns $140-150 if Hormuz stays disrupted beyond 30 days, potentially triggering synchronized global economic downturn',
      'Futures curve sharply backwardated: April WTI $108, May $103, June $95, July $88. Market expects eventual resolution but near-term pricing is crisis-level. The steepness of backwardation signals physical supply panic, not just speculative bidding',
      'G7 SPR release = temporary band-aid. Global SPR covers ~90 days of imports. Hormuz disrupts 20% of supply indefinitely',
      'Asia is the transmission vector — Japan and Korea are Hormuz-dependent. Their market crashes will feed back into global risk-off',
      'Credit spreads about to blow out. HY at 475 with oil above $100 and equity markets crashing',
      'Airline sector now in active distress. Fuel hedges expire. Ticket demand drops. RX pipeline building',
      'The Fed is trapped — inflation surging from energy, but cutting rates would amplify it. Stagflation scenario materializing',
    ],
  },
  11: {
    day: 11,
    date: 'March 10, 2026',
    title: "Mojtaba's First Order — Keep Hormuz Closed. Mines in the Water.",
    summary: "The new supreme leader's first public directive is to maintain the economic weapon. Mining the strait crosses a new threshold — from insurance-driven closure to physical military closure. Qatar strikes back against Iran (first GCC offensive action). Oil whiplash ($119 to $88) reflects market confusion, not resolution.",
    thesisScorecard: [
      {
        thesis: 'Mining of Hormuz as escalation',
        initialConfidence: 75,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'CNN reports Iran laying naval mines in Strait of Hormuz',
          "Trump demands mines removed 'IMMEDIATELY'",
          'US warns of consequences "at level never seen before"',
          'Crosses threshold from insurance closure to physical military closure',
        ],
      },
      {
        thesis: 'New Supreme Leader maintains hardline',
        initialConfidence: 70,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          "Mojtaba's first message: keep Hormuz closed as 'tool to pressure enemy'",
          'No moderation signal from new leadership',
          'IRGC strategy continues unchanged',
        ],
      },
      {
        thesis: 'GCC escalation',
        initialConfidence: 60,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'Qatar shoots down 2 Iranian Su-24 bombers — first GCC offensive action',
          'Attack was attempt to bomb Doha airport',
          'Expands conflict from defensive interceptions to offensive engagement',
        ],
      },
      {
        thesis: 'Market volatility not resolution',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          "Oil hit $119 intraday, collapsed to $88 on Trump 'ending soon' rhetoric",
          'Fundamentals unchanged — strait still closed',
          'Whiplash reflects market confusion, not resolution',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[10], // Day 11 update
    keyDevelopments: [
      {
        category: 'Leadership',
        items: [
          "Mojtaba Khamenei's first public message: Hormuz should remain closed as 'tool to pressure enemy'",
          '8th US service member dies',
          'Pezeshkian backtracks on earlier Gulf apology',
        ],
      },
      {
        category: 'Military',
        items: [
          'CNN reports Iran laying naval mines in Strait of Hormuz',
          "Trump demands mines removed 'IMMEDIATELY' or consequences 'at level never seen before'",
          'Qatar shoots down 2 Iranian Su-24 bombers attempting to bomb Doha airport',
          'First GCC offensive action of the war',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil hit $119 intraday then crashed to $88 on conflicting Trump signals',
          'Trump says war could end "soon" — Pentagon says opposite',
          'Market whiplash reflects rhetoric, not fundamentals',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 94,
      vlccRate: 460000,
      hySpread: 485,
      vix: 28.5,
      usGas: 3.52,
    },
    tradingImplications: [
      "Oil whiplash ($119 → $88) is noise, not signal — strait still closed, mines now in water",
      "Mining the strait = physical military closure layered on top of insurance closure",
      "Qatar offensive action expands conflict scope — no longer just US/Israel vs Iran",
      "Quick Resolution probability at 2% — all off-ramps remain closed",
    ],
  },
  12: {
    day: 12,
    date: 'March 11, 2026',
    title: "Record 400M Barrel Release — Market Says 'Not Enough'",
    summary: "The IEA announces the largest strategic reserve release in history: 400 million barrels, with the US contributing 172 million. Oil crashed 11% intraday on the news — then recovered. Within 24 hours, Brent is back above $100. This validates the Part II thesis that supply response cannot break the transmission chain. Goldman says 400M barrels offsets only 12 days of Gulf disruption.",
    thesisScorecard: [
      {
        thesis: 'SPR cannot break transmission chain',
        initialConfidence: 85,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          'Record 400M barrel release announced — largest in IEA history',
          'Oil crashed 11% intraday on news, then recovered',
          'Brent back above $100 within 24 hours',
          'Goldman: release offsets only 12 days of Gulf disruption',
        ],
      },
      {
        thesis: 'Physical attacks continuing',
        initialConfidence: 85,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'US destroys 16 Iranian mine-laying vessels near Hormuz',
          'Thai ship Mayuree Naree set ablaze in strait',
          'Container ship Express Rome struck',
          'Japanese tanker One Majesty damaged at anchor',
        ],
      },
      {
        thesis: 'IRGC control of strait',
        initialConfidence: 80,
        currentConfidence: 94,
        status: 'confirmed',
        evidence: [
          'IRGC declares all ships need Iran permission to transit',
          'Selective enforcement continues',
          '3+ ships attacked despite US mine-clearing operations',
        ],
      },
      {
        thesis: 'US casualties mounting',
        initialConfidence: 70,
        currentConfidence: 88,
        status: 'confirmed',
        evidence: [
          'US confirms 140 service members wounded in first 10 days',
          'First official wounded count disclosure',
          'Lebanon: 750,000+ displaced, 634 killed',
        ],
      },
      {
        thesis: 'International involvement expanding',
        initialConfidence: 65,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'Ukrainian anti-drone teams now operating in Qatar, UAE, Saudi Arabia',
          'Israel ground incursion in southern Lebanon',
          'Conflict geography expanding',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[11], // Day 12 update
    keyDevelopments: [
      {
        category: 'Energy/Markets',
        items: [
          'IEA announces record 400M barrel strategic reserve release — largest in history',
          'US contributing 172M barrels (43% of total)',
          'Previous record: 182M barrels after Russia-Ukraine 2022',
          'Oil crashed 11% intraday on SPR news, then recovered',
          'Goldman: 400M barrels offsets only 12 days of Gulf disruption',
          'Feb CPI: 2.4% YoY (pre-war baseline)',
          "Trump reverses — will tap SPR 'a little bit'",
        ],
      },
      {
        category: 'Shipping/Strait',
        items: [
          'US destroys 16 Iranian mine-laying vessels near Hormuz',
          'Thai bulk carrier Mayuree Naree set ablaze',
          'Container ship Express Rome (Liberia-flagged) struck',
          'Japanese tanker One Majesty damaged at anchor',
          'IRGC: all ships need Iran permission to transit',
        ],
      },
      {
        category: 'Military/Casualties',
        items: [
          'US confirms 140 service members wounded in first 10 days — first disclosure',
          "Hegseth: today would be 'most intense day yet' of US strikes",
          'Lebanon: 750,000+ displaced, 634 killed',
          'Israel ground incursion in southern Lebanon',
        ],
      },
      {
        category: 'Political',
        items: [
          'Ukrainian anti-drone teams deployed to Qatar, UAE, Saudi Arabia',
          "Joe Rogan criticizes Trump: war 'seems so insane based on what he ran on'",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 87.69,
      vlccRate: 450000,
      hySpread: 480,
      vix: 27.2,
      usGas: 3.58,
    },
    tradingImplications: [
      "SPR release is band-aid, not cure — validates Part II transmission thesis",
      "400M barrels = 12 days of Gulf disruption coverage per Goldman",
      "Oil recovered above $100 within 24 hours despite largest release in history",
      "Ship attacks continuing during mine-clearing = Iran can overwhelm defensive measures",
      "140 wounded disclosure signals higher actual casualty toll than reported",
    ],
  },
  13: {
    day: 13,
    date: 'March 12, 2026',
    title: "$100 Oil Is the New Floor. Iraq Ports Shut. Navy 'Not Ready.'",
    summary: "Oil is above $100 DESPITE the largest reserve release in history. This is the price floor, not a spike. Iraq shutting Basra ports means supply destruction is structural and expanding beyond Hormuz. Energy Secretary Wright admitting the Navy 'can\'t escort tankers for weeks' destroys the Day 4 naval escort narrative. Pezeshkian's 3 conditions for peace (recognition, reparations, guarantees) are structurally unachievable. IEA calls this the 'largest supply disruption in history of global oil market.'",
    thesisScorecard: [
      {
        thesis: '$100 as price floor, not spike',
        initialConfidence: 75,
        currentConfidence: 97,
        status: 'confirmed',
        evidence: [
          'Brent back above $100 despite record 400M barrel SPR release',
          'WTI surges 8% to $94',
          'Price recovered within 24 hours of largest reserve release in history',
          "IEA: 'largest supply disruption in history of global oil market'",
          'IEA: global supply could fall 8 million bpd in March (nearly 8% of global supply)',
        ],
      },
      {
        thesis: 'Naval escort solution invalidated',
        initialConfidence: 40,
        currentConfidence: 98,
        status: 'invalidated',
        evidence: [
          "Energy Secretary Wright admits Navy 'not ready' to escort tankers",
          "Won't be ready until end of month",
          'Destroys Day 4 naval escort narrative',
          'Ships being attacked while Navy conducts mine-clearing operations',
          'US-owned tanker Safesea Vishnu attacked off Iraq coast',
        ],
      },
      {
        thesis: 'Supply destruction expanding',
        initialConfidence: 80,
        currentConfidence: 97,
        status: 'confirmed',
        evidence: [
          'Iraq shuts down oil port operations at Basra after tanker attacks',
          'Iraq oil exports halted — not just Hormuz now',
          '3 more ships struck overnight',
          'Supply destruction spreading beyond strait to regional ports',
          'US-owned tanker, Liberian ship, Japanese vessel all attacked',
          'Two tankers caught fire in Iraqi territorial waters',
        ],
      },
      {
        thesis: 'Peace conditions unachievable',
        initialConfidence: 70,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Pezeshkian sets 3 conditions: recognition of rights, reparations, guarantees',
          'None achievable in current US political environment',
          "Khamenei adviser calls Trump 'Satan himself'",
          "Iran: ready for 'long-term war of attrition that will destroy the entire American economy'",
          "Mojtaba warned war could spread to 'other fronts'",
        ],
      },
      {
        thesis: 'Regional infrastructure collapse',
        initialConfidence: 75,
        currentConfidence: 93,
        status: 'confirmed',
        evidence: [
          'Bahrain airport fuel storage hit by drone',
          'Kuwait: 6 power lines downed by interceptor debris',
          'Oman: Salalah port fuel tanks hit — first Omani damage',
          'Dubai airport hit by drones, 4 wounded',
          'Kuwait airport targeted by drones',
          'GCC infrastructure under sustained attack',
        ],
      },
      {
        thesis: 'Inflation transmission accelerating',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Goldman raises inflation forecast to 2.9-3.3%',
          'Gas at $3.60/gal (AAA)',
          'Greece caps gasoline profit margins for 3 months',
          'Cathay Pacific raises fuel surcharges 105%',
          'Global policy response beginning',
        ],
      },
      {
        thesis: 'War cost asymmetry unsustainable',
        initialConfidence: 80,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Pentagon: first 6 days cost $11.3B+ (~$1.9B/day — nearly double Day 6 estimate)',
          "Sen. Coons: actual total 'significantly higher'",
          'Munitions replacement costs alone exceed $10B',
          'Day 6 estimate of $1B/day was undercount',
        ],
      },
      {
        thesis: 'Financial infrastructure as new threat vector',
        initialConfidence: 50,
        currentConfidence: 70,
        status: 'developing',
        evidence: [
          'Iran threatens to target US-linked banks across Middle East',
          'New escalation vector beyond energy/water/transport',
          'Handala cyberattack (50TB from Stryker) demonstrates capability',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[12], // Day 13 update
    keyDevelopments: [
      {
        category: 'War Cost',
        items: [
          'Pentagon briefed senators: first 6 days cost $11.3B+ (roughly $1.9B/day — nearly double Day 6 estimate)',
          "Sen. Coons: actual total 'significantly above that'",
          'Munitions replacement costs alone exceed $10B',
        ],
      },
      {
        category: 'Energy/Markets',
        items: [
          'Brent crude back above $100 despite record SPR release',
          'WTI surges 8% to $94',
          "Energy Secretary Wright: Navy 'not ready' to escort tankers — won't be ready until end of month",
          'IEA: global supply could fall 8 million bpd in March (nearly 8% of global supply)',
          'Goldman raises inflation forecast to 2.9-3.3%',
          "IEA: 'largest supply disruption in history of global oil market'",
          'Gas: $3.60/gal (AAA)',
          'Greece caps gasoline profit margins for 3 months',
          'Cathay Pacific raises fuel surcharges 105%',
          'Market close: Dow -571pts (-1.2%), S&P -1.1%, Nasdaq -1.4%',
        ],
      },
      {
        category: 'Shipping/Ports',
        items: [
          '3 more ships struck overnight near Hormuz and Dubai',
          'US-owned tanker Safesea Vishnu attacked off Iraq coast',
          'Two tankers caught fire in Iraqi territorial waters',
          'Iraq shuts down oil port operations at Basra after tanker attacks',
          'Iraq oil exports halted',
          'Iran: some ships allowed through with permission',
          'IRGC: all ships must get Iran approval or face attack',
          'IMO convening extraordinary session March 18-19',
        ],
      },
      {
        category: 'Military/Iran Escalation',
        items: [
          "Iran launched 'most intense operation since beginning of war' — most advanced ballistic missiles toward Tel Aviv and Haifa",
          'IRGC + Hezbollah launch joint missile operation against Israel',
          'Iran threatens to target US-linked banks across Middle East (new vector: financial infrastructure)',
          "Mojtaba Khamenei warned war could spread to 'other fronts'",
          "Khamenei's first message was text-only, read by TV anchor — no video/audio raises injury questions",
          'Dubai airport hit by drones, 4 wounded (still operating)',
          'Kuwait airport targeted by drones (material damage only)',
          'Bahrain airport fuel storage hit by drone',
          'Kuwait: 6 power lines downed by interceptor debris',
          'Oman: Salalah port fuel tanks hit — first Omani damage',
        ],
      },
      {
        category: 'Humanitarian',
        items: [
          '3.2 million Iranians displaced (UN refugee agency)',
          'Lebanon: 687 killed, 750,000+ displaced',
          'Iran UN rep: 1,348 civilians killed, 17,000+ injured',
          "UNICEF: 'catastrophic' situation, 1,100+ children injured or killed",
          '46 senators sign letter demanding investigation of Minab school strike',
        ],
      },
      {
        category: 'Diplomatic',
        items: [
          'Pezeshkian sets 3 conditions: recognition of rights, reparations, guarantees against future aggression',
          "Khamenei adviser calls Trump 'Satan himself'",
          "Iran says ready for 'long-term war of attrition that will destroy the entire American economy'",
          'Spain withdraws ambassador to Israel',
          'UN Security Council adopts resolution urging Iran to stop Gulf attacks',
        ],
      },
      {
        category: 'Cyber',
        items: [
          'Iran-linked hackers (Handala) steal 50TB from medical device company Stryker — retaliation for Minab school strike',
          'Cyberwarfare front now active alongside kinetic operations',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 100.11,
      vlccRate: 460000,
      hySpread: 495,
      vix: 24.77,
      usGas: 3.60,
    },
    tradingImplications: [
      "$100 oil is the floor, not the ceiling — record SPR release couldn't hold it below",
      "IEA: 8M bpd supply loss in March = ~8% of global supply. This is structural, not transient",
      "Naval escort thesis destroyed — Navy 'not ready' for weeks per Energy Secretary",
      "Supply destruction expanding beyond Hormuz — Iraq ports now shut, US tanker Safesea Vishnu attacked",
      "War cost accelerating: $11.3B first 6 days (~$1.9B/day) per Pentagon — nearly double Day 6 estimate. Munitions alone $10B+",
      "Pezeshkian's 3 conditions = no achievable off-ramp. Iran ready for 'long-term war of attrition'",
      "New threat vector: Iran threatens US-linked banks across Middle East. Financial infrastructure now target",
      "Goldman inflation forecast 2.9-3.3% = stagflation thesis accelerating. Cathay raises fuel surcharges 105%",
      "Full Escalation at 58% — remains base case. Khamenei warns war could spread to 'other fronts'",
    ],
  },
  14: {
    day: 14,
    date: 'March 13, 2026',
    title: "Yuan for Oil, Wounded Leader, and the 1973 Playbook Returns",
    summary: "Yuan-denominated Hormuz transit is the biggest structural development of the war — Iran weaponizing the strait not just to block oil but to restructure HOW oil is traded. This is petrodollar disruption, not just supply disruption. If this becomes policy, it outlasts the war. Mojtaba wounded/disfigured changes succession calculus. Iran military losing control of units = decentralized escalation risk. Fed cuts priced out to 2027-2028 = your Part II stagflation thesis confirmed by the rates market. 1973 OPEC crisis comparisons going mainstream.",
    thesisScorecard: [
      {
        thesis: 'Yuan-denominated Hormuz access',
        initialConfidence: 30,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          'Iran considering allowing limited tanker transit if oil traded in yuan not dollars',
          'Two Indian-flagged LPG carriers allowed through',
          'Direct attack on petrodollar system',
          'Selective access expanding beyond China',
        ],
      },
      {
        thesis: 'Stagflation thesis',
        initialConfidence: 65,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          'Fed rate cuts priced out until 2027-2028',
          '1973 OPEC crisis comparisons now mainstream',
          'S&P first 3-week losing streak in a year',
          'Brent second close above $100 at $103.14',
        ],
      },
      {
        thesis: 'Leadership succession instability',
        initialConfidence: 60,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'Hegseth: Mojtaba Khamenei "wounded and likely disfigured"',
          'Iran Foreign Ministry says military lost control of several units',
          'Decentralized escalation risk increasing',
        ],
      },
      {
        thesis: 'US military overextension',
        initialConfidence: 70,
        currentConfidence: 88,
        status: 'confirmed',
        evidence: [
          '13+ US dead, 140 wounded',
          'US refueling plane crashes in Iraq — 6 crew killed',
          '2,200 Marines deploying from Okinawa',
          '250+ US orgs demand Congress halt war funding',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[13], // Day 14 update
    keyDevelopments: [
      {
        category: 'Petrodollar Disruption',
        items: [
          'Iran considering yuan-only Hormuz transit — petrodollar disruption',
          'Two Indian LPG carriers allowed through under yuan framework',
          'Direct attack on dollar-denominated oil system',
          'If this becomes policy, it outlasts the war',
        ],
      },
      {
        category: 'Leadership & Military',
        items: [
          'Hegseth: Mojtaba Khamenei "wounded and likely disfigured"',
          'Explosions near Tehran rally attended by top officials',
          'Iran Foreign Ministry says military lost control of several units',
          '2,200 Marines deploying from Okinawa to Gulf region',
        ],
      },
      {
        category: 'Casualties',
        items: [
          '1,444 Iranian civilians killed',
          '4,400 Iranian military killed',
          '826 killed in Lebanon',
          '13+ US dead, 140 wounded',
          'US refueling plane crashes in Iraq — 6 crew killed',
        ],
      },
      {
        category: 'Markets & Economy',
        items: [
          'Brent $103.14 — second close above $100',
          'WTI $98.71',
          'S&P first 3-week losing streak in a year',
          'Fed rate cuts priced out until 2027-2028',
          'Stagflation comparisons to 1973 now mainstream',
          '250+ US orgs demand Congress halt war funding',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 103.14,
      vlccRate: 460000,
      hySpread: 505,
      vix: 25.5,
      usGas: 3.60,
    },
    tradingImplications: [
      "Yuan-denominated Hormuz transit is structural petrodollar disruption — this changes global oil trading architecture",
      "Fed cuts priced out to 2027-2028 = stagflation now consensus, not thesis",
      "Mojtaba wounded/disfigured introduces succession uncertainty within succession uncertainty",
      "Iran military losing control of units = decentralized escalation, harder to negotiate with",
      "1973 comparisons going mainstream — market participants now pricing 1970s-style energy crisis",
      "S&P 3-week losing streak + oil above $100 = credit transmission accelerating",
    ],
  },
  15: {
    day: 15,
    date: 'March 14, 2026',
    title: "Kharg Island — The Crown Jewel Gets Hit",
    summary: "Kharg Island is the escalation everyone feared. 90% of Iran's oil exports flow through it. Trump says he spared the oil infrastructure 'this time' — that's a direct threat and negotiating lever. But Iran's response ('any energy facility attack triggers regional retaliation') means the next step could be Iran hitting Saudi Aramco facilities, UAE export terminals, or Ras Tanura. This is the bilateral energy infrastructure targeting from Day 9 taken to its logical extreme. The $200 oil warning from Iran's spokesperson is not hyperbole if Kharg oil infrastructure is hit and Iran retaliates against Saudi/UAE export capacity. Trump asking other countries to send warships = admission the US can't reopen Hormuz alone.",
    thesisScorecard: [
      {
        thesis: 'Bilateral energy infrastructure targeting',
        initialConfidence: 85,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          "US bombs Kharg Island — Iran's 'crown jewel'",
          "90% of Iran's oil exports pass through Kharg",
          'Trump threatens oil infrastructure next',
          'Iran warns retaliation on regional oil infrastructure',
        ],
      },
      {
        thesis: '$200 oil scenario',
        initialConfidence: 40,
        currentConfidence: 65,
        status: 'developing',
        evidence: [
          'Iran spokesperson warns oil could hit $200',
          'If Kharg oil infrastructure hit + Iran retaliates on Saudi/UAE',
          'Brent already at $103',
          'Bilateral energy targeting now explicit policy',
        ],
      },
      {
        thesis: 'US cannot reopen Hormuz alone',
        initialConfidence: 60,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'Trump calls on China, France, Japan, SK, UK to send warships',
          'Admission US Navy overstretched',
          'Energy Sec Wright: Navy not ready until end of month',
        ],
      },
      {
        thesis: 'Regional infrastructure under sustained attack',
        initialConfidence: 75,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Fujairah bunkering hub fire',
          '56 Iranian cultural sites damaged',
          "IRGC tells UAE residents to evacuate near US 'hideouts'",
          'Jordan intercepted 79/85 projectiles in week 2',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[14], // Day 15 update
    keyDevelopments: [
      {
        category: 'Kharg Island Strike',
        items: [
          "US bombs Kharg Island military targets — Trump calls it Iran's 'crown jewel'",
          "90% of Iran's oil exports pass through Kharg",
          "First strike on the island in 14 days of war",
          "Trump warns oil infrastructure is next if Hormuz stays blocked",
          "Iran: any attack on energy facilities triggers retaliation on regional oil infrastructure",
        ],
      },
      {
        category: 'Regional Escalation',
        items: [
          'Fujairah bunkering hub fire',
          "IRGC tells UAE residents to evacuate near US 'hideouts'",
          'Jordan: intercepted 79/85 projectiles in week 2',
          '56 Iranian cultural sites damaged',
        ],
      },
      {
        category: 'International Response',
        items: [
          'Trump calls on China, France, Japan, South Korea, UK to send warships',
          'Admission US cannot reopen Hormuz alone',
          'Iran spokesperson warns oil could hit $200 if energy facilities targeted',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Brent ~$103, WTI ~$99',
          'S&P at 2026 lows',
          'All three indexes hit 2026 closing lows on Day 13',
          'Weekly: Brent +10%, WTI +8%',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 103,
      vlccRate: 460000,
      hySpread: 515,
      vix: 26.0,
      usGas: 3.60,
    },
    tradingImplications: [
      "Kharg Island strike is the escalation threshold — next step is actual oil infrastructure",
      "$200 oil is not hyperbole if Kharg oil infrastructure hit and Iran retaliates on Saudi/UAE export capacity",
      "Trump asking allies for warships = US Navy overextended, cannot reopen Hormuz unilaterally",
      "Bilateral energy targeting now explicit — both sides have drawn red lines around energy infrastructure",
      "S&P at 2026 lows, oil at $103 — credit transmission chain fully active",
      "Full Escalation at 63% — highest of the war. Next Iranian response could define $120 vs $150 vs $200",
    ],
  },
  16: {
    day: 16,
    date: 'March 15, 2026',
    title: "'We Never Asked for a Ceasefire' — Araghchi Shuts the Door",
    summary: "Iran's foreign minister publicly and explicitly rejects ceasefire, negotiations, and any engagement with the US. Combined with 6 more US deaths in Iraq plane crash, the political math for Trump gets worse daily. Hezbollah drone hits Cyprus RAF base — war touching NATO territory.",
    thesisScorecard: [
      {
        thesis: 'Iran refuses all negotiation',
        initialConfidence: 60,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          "Araghchi on CBS: 'We never asked for a ceasefire'",
          'Flatly contradicts Trump claim that Iran wants deal',
          'No diplomatic channel remaining',
        ],
      },
      {
        thesis: 'Geographic escalation continues',
        initialConfidence: 70,
        currentConfidence: 97,
        status: 'confirmed',
        evidence: [
          'Hezbollah drone strikes Cyprus RAF base — NATO territory',
          'Israeli strikes on Hamadan and Isfahan continue',
          'War geography expanding beyond original theater',
        ],
      },
      {
        thesis: 'US casualties mounting political pressure',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          '6 US crew from KC-135 crash in Iraq confirmed dead',
          '13+ US dead, 140+ wounded total',
          'Political cost of war increasing daily',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[15],
    keyDevelopments: [
      {
        category: 'Diplomatic',
        items: [
          "Araghchi on CBS Face the Nation: 'We never asked for a ceasefire'",
          "'We are ready to defend ourselves as long as it takes'",
          'Trump claims Iran wants deal — Araghchi flatly denies',
          'No diplomatic off-ramp remaining',
        ],
      },
      {
        category: 'Military',
        items: [
          '6 US crew from KC-135 crash in Iraq identified and confirmed dead',
          'Israeli strikes on Hamadan and Isfahan continue',
          'Hezbollah drone strikes Cyprus British RAF base',
          'War now touching NATO territory',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Brent ~$102, WTI ~$97',
          'Oil stabilizing above $100 floor',
          'Markets pricing in extended conflict',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 102,
      vlccRate: 465000,
      hySpread: 520,
      vix: 26.5,
      usGas: 3.65,
    },
    tradingImplications: [
      "Ceasefire rejection eliminates near-term resolution scenario",
      "Cyprus strike = NATO territory involved — potential Article 5 implications",
      "US casualties at 13+ dead create domestic political pressure on Trump",
      "Oil above $100 floor now consensus — question is $120 or $150",
    ],
  },
  17: {
    day: 17,
    date: 'March 16, 2026',
    title: "Formula One Cancels, FCC Threatens Media, Ground War in Lebanon",
    summary: "The war's second-order effects are spreading into civilian life (F1 cancellations), press freedom (FCC threats), and new fronts (Israel ground ops in Lebanon). These aren't military developments — they're indicators of how deeply the conflict is embedding into the global system.",
    thesisScorecard: [
      {
        thesis: 'Second-order effects spreading',
        initialConfidence: 65,
        currentConfidence: 88,
        status: 'confirmed',
        evidence: [
          'Formula One cancels Bahrain and Saudi Arabia Grand Prix',
          'Major sporting events affected',
          'Global entertainment industry disrupted',
        ],
      },
      {
        thesis: 'Press freedom under pressure',
        initialConfidence: 50,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          'FCC Chair threatens broadcaster licenses over war coverage',
          "Sen. Murphy: 'middle of a totalitarian takeover'",
          'Domestic political dynamics shifting',
        ],
      },
      {
        thesis: 'Ground war expanding',
        initialConfidence: 70,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          'Israel expands ground operations in southern Lebanon',
          'Multiple ground fronts now active',
          'War geography expanding',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[15],
    keyDevelopments: [
      {
        category: 'Civilian Impact',
        items: [
          'Formula One cancels Bahrain and Saudi Arabia Grand Prix races',
          'Major international events being cancelled',
          'Global tourism to region halted',
        ],
      },
      {
        category: 'Domestic Politics',
        items: [
          'FCC Chair Brendan Carr threatens to revoke broadcaster licenses over Iran war coverage',
          "Sen. Murphy calls it 'middle of a totalitarian takeover'",
          'Press freedom concerns escalating',
        ],
      },
      {
        category: 'Military',
        items: [
          'Israel expands ground operations in southern Lebanon',
          'Multiple ground fronts now active',
          'Lebanon casualties mounting',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 103,
      vlccRate: 468000,
      hySpread: 525,
      vix: 27.0,
      usGas: 3.68,
    },
    tradingImplications: [
      "Second-order effects (F1 cancellation) signal war embedding into global system",
      "Press freedom threats indicate domestic political stress",
      "Ground operations in Lebanon expand conflict scope",
      "Full Escalation probability stable at 67%",
    ],
  },
  18: {
    day: 18,
    date: 'March 17, 2026',
    title: "Larijani Dead — The Last Off-Ramp Is Gone",
    summary: "Larijani was the one person in Iranian leadership with both the credibility and pragmatism to negotiate a deal. He advanced the JCPOA in 2015. He was de facto leader after Khamenei's death. Now he's dead. Mojtaba is wounded/hidden, Pezeshkian's conditions are unachievable, Araghchi refuses to talk. There is literally no one left to negotiate with on the Iranian side. This is the diplomatic equivalent of a company's board being eliminated during a restructuring — there's no one authorized to sign a deal.",
    thesisScorecard: [
      {
        thesis: 'Diplomatic off-ramp eliminated',
        initialConfidence: 70,
        currentConfidence: 99,
        status: 'confirmed',
        evidence: [
          'Ali Larijani killed — most credible negotiation partner',
          'Advanced JCPOA in 2015',
          'De facto post-Khamenei leader eliminated',
          'No one left to negotiate with',
        ],
      },
      {
        thesis: 'Command and control fragmenting',
        initialConfidence: 60,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'IRGC warns military lost control of several units',
          'Units operating on old instructions',
          'Decentralized escalation risk increasing',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[15],
    keyDevelopments: [
      {
        category: 'Leadership',
        items: [
          'Ali Larijani killed in strikes',
          'De facto post-Khamenei leader eliminated',
          'Most credible negotiation partner gone',
          'Instrumental in advancing JCPOA in 2015',
        ],
      },
      {
        category: 'Military',
        items: [
          'IRGC warns military has lost control over several units',
          'Units operating on old instructions',
          'Decentralized escalation risk increasing',
        ],
      },
      {
        category: 'Diplomatic',
        items: [
          'Mojtaba wounded/hidden',
          "Pezeshkian's conditions unachievable",
          'Araghchi refuses to talk',
          'No one authorized to sign a deal',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 103,
      vlccRate: 470000,
      hySpread: 530,
      vix: 27.5,
      usGas: 3.72,
    },
    tradingImplications: [
      "CRITICAL: Larijani death eliminates last viable negotiation partner",
      "Diplomatic off-ramp: CLOSED",
      "Command fragmentation = decentralized escalation risk",
      "Full Escalation probability rising to 69%",
    ],
  },
  19: {
    day: 19,
    date: 'March 18, 2026',
    title: "South Pars → Ras Laffan — The Energy War Goes Structural",
    summary: "THE most important day of the war for the thesis since Day 1. Israel strikes South Pars. Iran retaliates against Ras Laffan. QatarEnergy says 17% LNG capacity lost, 5 years to repair. This single exchange transforms the conflict from a temporary disruption into permanent structural damage to global energy infrastructure. Even a ceasefire tomorrow doesn't fix a 5-year LNG repair timeline. The 'protracted attrition' vs 'full escalation' distinction is now academic — the damage is already done and will outlast the war itself.",
    thesisScorecard: [
      {
        thesis: 'Energy infrastructure targeting structural',
        initialConfidence: 85,
        currentConfidence: 100,
        status: 'confirmed',
        evidence: [
          "Israel strikes Iran's South Pars gas field",
          "Iran retaliates on Qatar's Ras Laffan — world's largest LNG facility",
          '17% LNG export capacity lost',
          '5 years to repair',
        ],
      },
      {
        thesis: 'Damage outlasts war',
        initialConfidence: 70,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          'Ceasefire tomorrow cannot fix 5-year repair timeline',
          'Structural damage to global LNG markets',
          'European energy crisis accelerated',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[15],
    keyDevelopments: [
      {
        category: 'Energy Infrastructure',
        items: [
          "Israel strikes Iran's South Pars gas field",
          "Iran retaliates against Qatar's Ras Laffan",
          "World's largest LNG facility damaged",
          'QatarEnergy: 17% export capacity lost',
          'Up to 5 years to fully repair',
        ],
      },
      {
        category: 'Regional',
        items: [
          'Kuwait oil refinery hit',
          'Energy infrastructure targeting now bilateral AND structural',
          'Damage will outlast the war',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Brent surges to $108.78',
          'Triple-digit oil as new floor confirmed',
          'European LNG supply gap permanent',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 108.78,
      vlccRate: 485000,
      hySpread: 550,
      vix: 30.0,
      usGas: 3.75,
    },
    tradingImplications: [
      "Ras Laffan damage creates permanent European LNG supply gap: 90% confidence",
      "5-year repair timeline means structural energy shortfall regardless of ceasefire",
      "Part II restructuring cycle timeline accelerated from 24 months to 12-18 months",
      "Full Escalation at 71% — structural damage already done",
    ],
  },
  20: {
    day: 20,
    date: 'March 19, 2026',
    title: "$119 Intraday, Goldman Says $147 Possible, JPM Cuts Targets",
    summary: "Goldman Sachs now warning oil could exceed the 2008 all-time high. JPMorgan cutting equity targets. Fed rate cuts priced out to 2027-2028. The institutional consensus has shifted from 'this will be brief' to 'this could be structural.' That's the market catching up to what the memos predicted on Day 1. Netanyahu saying war 'may end sooner than people think' is the first potential off-ramp signal — but Iran has rejected every ceasefire attempt, and the Ras Laffan damage can't be undone.",
    thesisScorecard: [
      {
        thesis: 'Institutional consensus shifts to structural',
        initialConfidence: 65,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Goldman warns oil could exceed 2008 all-time high of $147',
          'JPMorgan cuts S&P year-end target',
          "Consensus shifted from 'brief' to 'structural'",
        ],
      },
      {
        thesis: 'Fed trapped in stagflation',
        initialConfidence: 70,
        currentConfidence: 94,
        status: 'confirmed',
        evidence: [
          'Fed rate cuts priced out to 2027-2028',
          'Stagflation scenario materializing',
          'Cannot cut rates with inflation surging',
        ],
      },
      {
        thesis: 'Triple-digit oil as new floor',
        initialConfidence: 75,
        currentConfidence: 97,
        status: 'confirmed',
        evidence: [
          'Brent hit $119 intraday',
          'Goldman warns of sustained triple digits',
          'Structural supply damage confirms floor',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[15],
    keyDevelopments: [
      {
        category: 'Markets',
        items: [
          'Brent spikes to $119 intraday before settling $108.65',
          'Goldman warns oil could exceed 2008 all-time high of $147',
          'JPMorgan cuts S&P 500 year-end target',
          'Fed rate cuts priced out to 2027-2028',
        ],
      },
      {
        category: 'Diplomatic',
        items: [
          "Netanyahu: war 'may end sooner than people think'",
          'Israel helping to open Hormuz',
          'First potential off-ramp signal from Israel',
          'But Iran rejected every ceasefire attempt',
        ],
      },
      {
        category: 'Shipping',
        items: [
          'India negotiating with Iran to get 22 ships through Hormuz',
          '2 Indian-flagged ships already through',
          'Selective access expanding',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 108.65,
      vlccRate: 490000,
      hySpread: 560,
      vix: 31.0,
      usGas: 3.80,
    },
    tradingImplications: [
      "Goldman $147 warning = institutional consensus now aligned with Part II thesis",
      "JPMorgan cutting targets = equity markets pricing structural damage",
      "Fed cuts priced out to 2027-2028 = stagflation trap confirmed by rates market",
      "Part II base case is now consensus",
    ],
  },
  21: {
    day: 21,
    date: 'March 20, 2026',
    title: "Three Weeks In — No Ceasefire, No Hormuz, No Off-Ramps",
    summary: "The war enters its fourth week. Trump explicitly rejects ceasefire. Calls NATO 'cowards.' More Marines deploying. Strikes hit Tehran during Nowruz — Iran's most sacred holiday. A senior Iranian source says Hormuz 'will not return to pre-war conditions.' Goldman says triple-digit oil could persist for years. The 4-week disruption that the market originally priced has arrived — and there's no resolution in sight.",
    thesisScorecard: [
      {
        thesis: 'No ceasefire possible',
        initialConfidence: 70,
        currentConfidence: 99,
        status: 'confirmed',
        evidence: [
          "Trump rejects ceasefire: 'You don't do a ceasefire when you're literally obliterating the other side'",
          "Calls NATO allies 'cowards'",
          'No off-ramps remaining',
        ],
      },
      {
        thesis: 'Hormuz closure permanent',
        initialConfidence: 60,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          'Hormuz closed 21 consecutive days',
          "Senior Iranian source: 'will not return to pre-war conditions'",
          'Mojtaba: lever of closing Hormuz must continue',
        ],
      },
      {
        thesis: 'Post-war oil structurally higher',
        initialConfidence: 80,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Ras Laffan 5-year repair timeline',
          'Infrastructure damage persists regardless of ceasefire',
          'Goldman says triple-digit oil for extended period',
        ],
      },
      {
        thesis: 'Selective Hormuz access creates petrodollar erosion',
        initialConfidence: 60,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          'Yuan and rupee denominated transit now operational',
          'India negotiating for 22 ships, 2 already through',
          'Precedent set even after war ends',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[15],
    keyDevelopments: [
      {
        category: 'Political',
        items: [
          "Trump rejects ceasefire: 'You don't do a ceasefire when you're literally obliterating the other side'",
          "Calls NATO allies 'cowards' for not helping with Hormuz",
          'More Marines and sailors (11th MEU, Boxer ARG) rerouted to Middle East',
        ],
      },
      {
        category: 'Military',
        items: [
          'Strikes hit Tehran during Nowruz — Persian New Year',
          "Iran's most sacred holiday targeted",
          'Iran threatens world tourism sites',
        ],
      },
      {
        category: 'Shipping/Hormuz',
        items: [
          'Hormuz closed for 21 consecutive days',
          "Senior Iranian source: 'will not return to pre-war conditions'",
          'India: 2 ships through, 22 more in negotiations',
        ],
      },
      {
        category: 'Casualties',
        items: [
          'Iranian Red Crescent: 204 children among 1,444 civilians killed',
          'Lebanon exceeds 1,000 dead',
          '13+ US dead, 140+ wounded',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 107.40,
      vlccRate: 495000,
      hySpread: 565,
      vix: 30.5,
      usGas: 3.85,
    },
    tradingImplications: [
      "Day 21: Full Escalation dominant at 69%",
      "Larijani killed — diplomatic off-ramp: CLOSED",
      "Energy infrastructure targeting bilateral AND structural — Ras Laffan 5yr repair",
      "SPR release failure RECONFIRMED — 400M barrels couldn't hold oil below $100",
      "Triple-digit oil as new floor: CONFIRMED by Goldman, JPMorgan, market action",
      "Fed stagflation trap: CONFIRMED — rate cuts priced out to 2027-2028",
      "Hormuz closure exceeds market pricing — at 3 weeks with 'will not return to pre-war conditions'",
      "Part II restructuring cycle: NOW INSTITUTIONAL CONSENSUS",
    ],
  },
  22: {
    day: 22,
    date: 'March 21, 2026',
    title: "Coalition Forms, Kuwait Hit, Fatigue Sets In",
    summary: "Day 22 brings the first signs of coordination — and exhaustion. A US-UK-France-Egypt naval coalition announces plans for Hormuz escort operations. But Iran isn't slowing down: drones hit Kuwait's Mina al-Ahmadi refinery (730K bpd), the 21st commercial ship is attacked, and GCC air defenses intercept nearly 90 drones overnight. Yet for the first time, Trump floats 'winding down.' The rhetoric shift is notable — but the violence isn't matching it.",
    thesisScorecard: [
      {
        thesis: 'Naval coalition forming',
        initialConfidence: 40,
        currentConfidence: 65,
        status: 'developing',
        evidence: [
          'US-UK-France-Egypt coalition announced for Hormuz escorts',
          'First coordinated international response',
          'Still weeks from operational readiness',
        ],
      },
      {
        thesis: 'GCC infrastructure targeting sustained',
        initialConfidence: 90,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          "Kuwait's Mina al-Ahmadi refinery hit — 730K bpd capacity",
          '21 commercial ships attacked total (UKMTO)',
          'Saudi intercepted 47 drones, UAE 19, Qatar 23 overnight',
        ],
      },
      {
        thesis: 'War fatigue emerging',
        initialConfidence: 30,
        currentConfidence: 45,
        status: 'developing',
        evidence: [
          "Trump floats 'winding down' for first time",
          'Rhetoric shift from escalation to exit framing',
          'But violence not matching rhetoric yet',
        ],
      },
      {
        thesis: 'Hormuz closure persistent',
        initialConfidence: 85,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Strait closed 22 consecutive days',
          'Coalition weeks from operational',
          'Insurance still suspended',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[16],
    keyDevelopments: [
      {
        category: 'Military',
        items: [
          "Iranian drones hit Kuwait's Mina al-Ahmadi refinery — 730K bpd capacity",
          'Fire sparked at major Gulf refining facility',
          'Saudi intercepted 47 drones overnight',
          'UAE intercepted 19, Qatar 23',
        ],
      },
      {
        category: 'Shipping',
        items: [
          '21 commercial ships attacked since war began (UKMTO)',
          'US-UK-France-Egypt naval coalition announced',
          'Escort operations planned but weeks away',
        ],
      },
      {
        category: 'Political',
        items: [
          "Trump floats 'winding down' for first time",
          'First hint of exit strategy framing',
          'But operations continue unabated',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 108.22,
      vlccRate: 498000,
      hySpread: 570,
      vix: 31.2,
      usGas: 3.92,
    },
    tradingImplications: [
      "Day 22: Markets caught between violence and rhetoric",
      "Mina al-Ahmadi hit — Kuwait refining capacity disrupted",
      "Naval coalition: FORMING but weeks from operational",
      "Trump 'winding down' comment: FIRST EXIT SIGNAL but unconfirmed",
      "21 ships attacked — maritime insurance frozen indefinitely",
      "Watch for: Escalation vs. de-escalation signals this week",
    ],
  },
  23: {
    day: 23,
    date: 'March 22, 2026',
    title: "The Ultimatum — 48 Hours to Armageddon",
    summary: "This is the day we came closest to total war. Trump issues a 48-hour ultimatum: open Hormuz or Iran's power plants will be 'obliterated.' Iran's response is immediate and terrifying — Pezeshkian warns Hormuz will be 'completely closed indefinitely' if power infrastructure is hit. Then Iran fires an ICBM at Diego Garcia and missiles at Dimona. Both sides are now threatening civilization-ending moves. Oil surges to $114.85. Markets price 60%+ Full Escalation probability.",
    thesisScorecard: [
      {
        thesis: 'Ultimatum as escalation trigger',
        initialConfidence: 70,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          "Trump: 48 hours to open Hormuz or power plants 'obliterated'",
          "Iran: Hormuz 'completely closed indefinitely' if hit",
          'Both sides threatening maximum escalation',
        ],
      },
      {
        thesis: 'Nuclear facility targeting',
        initialConfidence: 25,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          'Iranian missiles strike near Dimona — first nuclear facility area targeted',
          '100+ injured including 10 serious in Arad',
          'Escalation threshold crossed',
        ],
      },
      {
        thesis: 'ICBM deployment',
        initialConfidence: 20,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Iran fires ICBM at Diego Garcia',
          'First ICBM used against US installation',
          'No interception reported',
        ],
      },
      {
        thesis: 'Full Escalation probability maximum',
        initialConfidence: 50,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Markets pricing 60%+ Full Escalation',
          'Both sides threatening civilization-level moves',
          'No diplomatic channels open',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[17],
    keyDevelopments: [
      {
        category: 'Ultimatum',
        items: [
          "Trump: 48 hours to open Hormuz or power plants 'obliterated'",
          "Iran: Hormuz 'completely closed indefinitely' if hit",
          'Mutual assured destruction framing emerging',
        ],
      },
      {
        category: 'Military',
        items: [
          'Iran fires ICBM at Diego Garcia (US-UK Indian Ocean base)',
          'First ICBM used against US installation',
          'Iranian missiles strike near Dimona nuclear facility',
          '100+ injured including 10 serious in Arad',
        ],
      },
      {
        category: 'Energy',
        items: [
          'Brent surges to $114.85 on ultimatum news',
          'Power plant threats add new escalation dimension',
          'Civilization-level stakes now explicit',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 114.85,
      vlccRate: 510000,
      hySpread: 595,
      vix: 38.7,
      usGas: 4.15,
    },
    tradingImplications: [
      "Day 23: MAXIMUM ESCALATION RISK",
      "Trump ultimatum: 48 hours to open Hormuz or power plants hit",
      "Iran response: 'Completely closed indefinitely' if attacked",
      "ICBM at Diego Garcia: First ever against US installation",
      "Dimona strike: Nuclear facility area targeted",
      "Markets pricing 60%+ Full Escalation",
      "Oil $114.85 — approaching 2008 all-time highs",
      "Position for: Either catastrophic escalation or sudden reversal",
    ],
  },
  24: {
    day: 24,
    date: 'March 23, 2026',
    title: "The Call — First Words Since Bullets Flew",
    summary: "24 hours ago we were pricing Armageddon. Today, Trump announces 'productive conversations' with Iran and delays power plant strikes for 5 days. Pezeshkian drops 'indefinite closure' language. For the first time since February 28, there's a communication channel. Oil crashes 13% — biggest drop since the pandemic. S&P surges 4.1%. But we've seen false dawns before. Hormuz is still closed. 17 Americans are dead. The structural damage to Gulf energy infrastructure is already done. This may be a turning point — or it may be a pause before the final escalation.",
    thesisScorecard: [
      {
        thesis: 'Communication channel opened',
        initialConfidence: 10,
        currentConfidence: 70,
        status: 'developing',
        evidence: [
          "Trump: 'productive conversations' with Iran",
          'First direct communication since war began',
          '5-day pause on power plant strikes',
        ],
      },
      {
        thesis: 'De-escalation signal real',
        initialConfidence: 15,
        currentConfidence: 55,
        status: 'developing',
        evidence: [
          "Pezeshkian drops 'indefinite closure' language",
          "Says Iran 'open to discussing' Hormuz if attacks stop",
          'Rhetoric shift from maximum to negotiation',
        ],
      },
      {
        thesis: 'Structural damage already done',
        initialConfidence: 90,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Ras Laffan: 5-year repair timeline regardless of ceasefire',
          'Mina al-Ahmadi: 730K bpd capacity hit',
          '21+ ships attacked — maritime insurance transformation permanent',
        ],
      },
      {
        thesis: 'False dawn risk',
        initialConfidence: 50,
        currentConfidence: 60,
        status: 'developing',
        evidence: [
          'Hormuz still closed — 24 consecutive days',
          '17 US troops killed, 180+ wounded',
          'Both sides have domestic audiences demanding victory',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[18],
    keyDevelopments: [
      {
        category: 'Diplomatic',
        items: [
          "Trump announces 'productive conversations' with Iran",
          'Delays power plant strikes for 5 days',
          'First direct US-Iran communication since February 28',
        ],
      },
      {
        category: 'Iran Response',
        items: [
          "Pezeshkian drops 'indefinite closure' language",
          "'Open to discussing' Hormuz if attacks stop",
          'Rhetoric shift from maximum escalation to negotiation',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil crashes 13% — biggest single-day drop since pandemic',
          'Brent plunges from $114 to $99.48',
          'S&P surges 4.1% — best day since 2020',
          'Defense stocks sell off sharply',
        ],
      },
      {
        category: 'Reality Check',
        items: [
          'Hormuz still closed — 24 consecutive days',
          '17 US troops killed total, 180+ wounded',
          'War not over — trajectory may have shifted',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 99.48,
      vlccRate: 480000,
      hySpread: 545,
      vix: 28.5,
      usGas: 3.88,
    },
    tradingImplications: [
      "Day 24: POTENTIAL TURNING POINT — but not confirmed",
      "First communication channel: OPENED after 24 days",
      "Oil -11%: Biggest drop since pandemic — but still triple digits",
      "THE PARADOX: Markets celebrating while Hormuz still closed",
      "Structural damage IRREVERSIBLE: Ras Laffan 5yr, insurance transformation, 21 ships",
      "Quick Resolution up from 3% to 8% — still low",
      "Protracted Attrition base case at 45%",
      "Full Escalation still 47% — ultimatum expires in 5 days",
      "CAUTION: 5-day pause ≠ peace. Both sides have domestic audiences demanding victory",
      "Watch for: Whether 'productive conversations' produce concrete steps or collapse",
    ],
  },
  25: {
    day: 25,
    date: 'March 24, 2026',
    title: "The Market Whiplash — $580M Before the Tweet, 290 Wounded After, and the 82nd Airborne en Route",
    summary: "The contradictions are piling up. Trump says 'we've won' while deploying the 82nd Airborne. Claims 'productive talks' while Iran calls him 'deceitful.' Oil crashes 11% on a Truth Social post then rebounds to $104 the next day. $580M in suspicious trades placed 15 minutes before the announcement. 290 troops wounded — doubled in two weeks. Port Arthur refinery exploding adds domestic supply chaos. This is not de-escalation — this is volatility masquerading as progress.",
    thesisScorecard: [
      {
        thesis: 'Diplomatic progress real',
        initialConfidence: 30,
        currentConfidence: 35,
        status: 'developing',
        evidence: [
          "Iran received 'points through mediators'",
          "Zolghadr replaces Larijani — new negotiator appointed",
          "Pakistan emerging as intermediary",
        ],
      },
      {
        thesis: 'Actions contradict rhetoric',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          "82nd Airborne (1,000+) deploying while Trump claims victory",
          "Strikes continue on both sides",
          "Iran calls Trump 'deceitful' while engaging through mediators",
        ],
      },
      {
        thesis: 'Market manipulation/volatility',
        initialConfidence: 50,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          "$580M in bets placed 15 min before Trump post",
          "Oil swings 11% on social media",
          "S&P futures swing from -1% to +3% in minutes",
        ],
      },
      {
        thesis: 'Structural damage persists',
        initialConfidence: 95,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          "290 US wounded — doubled in two weeks",
          "Port Arthur domestic refinery explosion",
          "Hormuz still closed with mines confirmed",
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[19],
    keyDevelopments: [
      {
        category: 'Military',
        items: [
          "82nd Airborne (1,000+) deploying — actions contradict 'we won' rhetoric",
          "290 US troops wounded — doubled in two weeks",
          "Missile hits Tel Aviv street — strikes continue on both sides",
        ],
      },
      {
        category: 'Political',
        items: [
          "Trump approval at 36% (Reuters/Ipsos) — lowest of second term",
          "Iran calls Trump 'deceitful' — IRGC not softening",
          "Zolghadr named to replace killed Larijani",
        ],
      },
      {
        category: 'Market/Financial',
        items: [
          "Oil rebounds to $104 — 11% crash reversed",
          "$580M insider trading probe — bets placed 15 min before Trump post",
          "Port Arthur TX refinery explosion — domestic supply disruption",
        ],
      },
      {
        category: 'Diplomacy',
        items: [
          "Iran denies direct talks but confirms 'received points through mediators'",
          "Trump claims Iran offered 'prize' related to Hormuz",
          "Pakistan emerges as key intermediary",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 104.49,
      vlccRate: 490000,
      hySpread: 555,
      vix: 26.5,
      usGas: 3.95,
    },
    tradingImplications: [
      "Day 25: VOLATILITY MASQUERADING AS PROGRESS",
      "Oil rebound: $104 — 11% crash completely reversed",
      "$580M insider trading probe: If confirmed, largest scandal tied to presidential social media",
      "82nd Airborne deploying while claiming victory — watch the actions, not the words",
      "290 wounded (doubled in 2 weeks) — war accelerating despite rhetoric",
      "Port Arthur explosion: Domestic supply shock on top of global disruption",
      "Trump approval 36%: Political thesis from Part I confirmed",
      "Iran appointing Zolghadr: May indicate willingness to negotiate, or just bureaucratic replacement",
      "Structural damage unchanged: Ras Laffan 5yr, Hormuz mined, insurance frozen",
    ],
  },
  26: {
    day: 26,
    date: 'March 25, 2026',
    title: "Iran's Counter-Offer — Reparations, Hormuz Sovereignty, and the Restructuring of Global Shipping",
    summary: "Iran REJECTS the US 15-point plan and issues 5 counter-conditions: end aggression, guarantees against future attack, war reparations, comprehensive end across ALL fronts (including proxy groups), and recognition of Iran's sovereignty over Hormuz. These are maximalist demands — war reparations from the world's largest military, sovereignty over an international waterway, protection of ALL proxy groups. But this is negotiation, not capitulation. The critical development: Iranian parliament is codifying Hormuz sovereignty into law with transit fees. GCC confirms Iran already charging fees. This converts a wartime blockade into permanent legal control. Even if the war ends tomorrow, this legislation persists.",
    thesisScorecard: [
      {
        thesis: 'Iran refuses to negotiate on US terms',
        initialConfidence: 80,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          "Iran REJECTS US 15-point plan outright",
          "Issues 5 counter-conditions that are non-starters for US/Israel",
          "Araghchi: 'We want to end the war only on our own terms'",
        ],
      },
      {
        thesis: 'Hormuz weaponization goes PERMANENT',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'developing',
        evidence: [
          "Parliament pursuing legislation to codify Hormuz sovereignty",
          "GCC confirms Iran already charging passage fees",
          "UAE calls it 'economic terrorism'",
          "This persists regardless of ceasefire — structural change",
        ],
      },
      {
        thesis: 'Iraq drawn into conflict',
        initialConfidence: 50,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          "Iraqi PM gives PMF 'green light for self-defense' against US",
          "7 Iraqi soldiers killed in US Anbar Province strikes",
          "Iraq summons US diplomat — formal breach of international law complaint",
          "Legal basis for US Iraq presence eroding",
        ],
      },
      {
        thesis: 'Protracted Attrition now clear base case',
        initialConfidence: 50,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          "Both sides exchanging proposals but miles apart",
          "Neither can 'win' militarily but neither will accept other's terms",
          "Quick Resolution drops back to 10% — Iran's conditions non-starters",
          "Saudi MBS pressing Trump to continue strikes",
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 1],
    keyDevelopments: [
      {
        category: 'Diplomatic',
        items: [
          "Iran REJECTS US 15-point plan — issues 5 counter-conditions",
          "Counter-conditions: reparations, Hormuz sovereignty, protection of ALL proxy groups",
          "Araghchi: 'We want to end the war only on our own terms'",
          "Delivered via Pakistan — positions miles apart",
        ],
      },
      {
        category: 'Hormuz Sovereignty — THE GAME-CHANGER',
        items: [
          "Parliament pursuing legislation to codify permanent Hormuz sovereignty",
          "GCC confirms Iran already charging transit fees",
          "UAE oil chief: 'economic terrorism — every nation pays the ransom'",
          "If codified, this persists regardless of any ceasefire",
        ],
      },
      {
        category: 'Iraq Escalation',
        items: [
          "Iraqi PM gives PMF green light for self-defense against US strikes",
          "US A-10 struck PMF in Anbar Province — 7 Iraqi soldiers killed",
          "Iraq summons US diplomat — formal international law complaint",
          "PMF officially part of Iraqi army — legal basis for US presence eroding",
        ],
      },
      {
        category: 'Military',
        items: [
          "Israel strikes Bushehr nuclear complex",
          "IRGC navy chief killed",
          "Iranian military dead: 5,300+ (Hengaw, up from 4,400)",
          "Lebanon: 1,072 killed, 2,966 wounded (33 deaths in 24 hours)",
        ],
      },
      {
        category: 'Global Impact',
        items: [
          "Sri Lanka cutting energy consumption 25%",
          "50% of global urea/sulfur disrupted — food security dimension",
          "Saudi MBS pressing Trump to continue bombing",
          "AP: 'midterm warning signs flash' — Trump at 36% approval",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 100,
      vlccRate: 485000,
      hySpread: 530,
      vix: 23.5,
      usGas: 3.95,
    },
    tradingImplications: [
      "Iran's counter-conditions establish negotiating floor — not final terms",
      "Reparations are bargaining chip; Hormuz sovereignty is non-negotiable",
      "CRITICAL: Hormuz sovereignty legislation is THE structural wild card",
      "If codified into Iranian law, this persists regardless of ceasefire",
      "Iran converting temporary blockade into permanent sovereign control",
      "Quick Resolution drops from 15% to 10% — Iran's conditions non-starters",
      "Protracted Attrition 55% now clear base case",
      "Iraq escalation opens new front — US legal basis eroding",
      "Political pressure on Trump intensifying: 36% approval, AP midterm warnings",
      "Shape of eventual deal visible if you know what to look for — but months away",
    ],
  },
  27: {
    day: 27,
    date: 'March 26, 2026',
    title: "Steel and Atoms: Israel Strikes the Economy, Not Just the Military",
    summary: "Israel striking IRGC-linked steel factories marks the shift from military to economic targeting. This is the 'destroy the debtor's productive capacity' play — not just degrading Iran's ability to fight but its ability to recover economically post-war. Arak reactor strikes and the 10-day deadline extension show the pattern: Trump wants an off-ramp, Israel wants maximum damage before it closes.",
    thesisScorecard: [
      {
        thesis: 'Economic warfare phase begins',
        initialConfidence: 60,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          "Israel strikes 2 largest steel factories — IRGC-owned industrial targets",
          "Khuzestan Steel and Mobarakeh Steel both hit",
          "Targeting economic recovery capacity, not just military capability",
        ],
      },
      {
        thesis: 'Nuclear degradation objective achieved',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'developing',
        evidence: [
          "Arak heavy water reactor struck (evacuated first)",
          "IAEA to confirm non-operational status Day 28",
          "Bushehr, Natanz also damaged",
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 1],
    keyDevelopments: [
      {
        category: 'Nuclear/Industrial',
        items: [
          "Israel strikes Arak heavy water reactor — evacuated first",
          "Khuzestan Steel and Mobarakeh Steel factories struck — IRGC-linked",
          "Economic warfare: destroying industrial base, not just military",
        ],
      },
      {
        category: 'Diplomatic',
        items: [
          "Trump extends power plant deadline 10 days to April 6",
          "First major de-escalation signal since Day 24",
          "Iran blocks 3 container ships at Hormuz",
          "Iran warned hotels in UAE and Bahrain hosting US military forces are legitimate targets — Damascus Four Seasons also named",
        ],
      },
      {
        category: 'Humanitarian',
        items: [
          "18 Israeli civilians killed, 5,492 injured since war began",
          "Reports of child soldiers (age 12+) joining Iran war support",
          "120+ historical sites damaged in Iran",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 105.85,
      vlccRate: 490000,
      hySpread: 545,
      vix: 25.5,
      usGas: 3.95,
    },
    tradingImplications: [
      "Economic warfare phase: Israel targeting post-war recovery capacity",
      "10-day deadline extension = Trump seeking off-ramp while Israel maximizes damage",
      "Nuclear infrastructure being systematically degraded",
      "Scenario: Quick 12% / Protracted 53% / Full 35%",
    ],
  },
  28: {
    day: 28,
    date: 'March 27, 2026',
    title: "WTI Breaks $100, Prince Sultan Burns, and Iran's Military Is 'Neutralized' — Until It Isn't",
    summary: "THE most contradictory day of the war. Trump and Hegseth announce Iran's military is neutralized. Hours later, Iranian missiles wound 15 Americans and damage aircraft at Prince Sultan Air Base — using targeting data from Russia. WTI touches $100 for the first time since 2022. Gas hits $3.93 nationally. The gap between the administration's claims and reality is widening daily.",
    thesisScorecard: [
      {
        thesis: 'WTI above $100',
        initialConfidence: 70,
        currentConfidence: 100,
        status: 'confirmed',
        evidence: [
          "WTI touches $100.04 — first time above $100 since 2022",
          "Brent hits new 2026 high of $112.57",
          "Gas $3.93 national avg, up 40% from January",
        ],
      },
      {
        thesis: 'Russia-Iran intelligence sharing',
        initialConfidence: 60,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          "Zelensky: Russia provided Iran satellite imagery for Prince Sultan targeting",
          "Strike occurred hours after Trump declared Iran 'neutralized'",
          "15 US wounded, 5 critically",
        ],
      },
      {
        thesis: 'Nuclear objective achieved',
        initialConfidence: 90,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          "IAEA confirms Arak reactor 'no longer operational'",
          "Stated US war objective accomplished",
          "But enrichment knowledge persists — can't destroy expertise",
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 1],
    keyDevelopments: [
      {
        category: 'Markets',
        items: [
          "WTI touches $100.04 — first time above $100 since 2022",
          "Brent $112.57 — new 2026 high",
          "Gas $3.93 national avg, California $5.62",
          "Analysts warn $5 national possible",
        ],
      },
      {
        category: 'Military',
        items: [
          "15 US wounded at Prince Sultan Air Base (5 critical)",
          "Strike occurred HOURS after Trump declared Iran 'neutralized'",
          "Russia provided satellite imagery for targeting (per Zelensky)",
        ],
      },
      {
        category: 'Nuclear',
        items: [
          "IAEA confirms Arak reactor 'no longer operational'",
          "Major stated war objective achieved",
          "Israel continues missile production facility strikes",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 112.57,
      vlccRate: 495000,
      hySpread: 560,
      vix: 28.0,
      usGas: 3.93,
    },
    tradingImplications: [
      "WTI $100 threshold crossed — analysts warned this triggers consumer behavior change",
      "Gap between administration claims and reality widening",
      "Russia-Iran axis confirmed — great power dimension explicit",
      "Scenario: Quick 10% / Protracted 50% / Full 40%",
    ],
  },
  29: {
    day: 29,
    date: 'March 28, 2026',
    title: "The Houthis Join: Mediterranean to Red Sea to Indian Ocean",
    summary: "The expansion everyone feared. Houthi strikes on Israel from Yemen mean the war now spans from Lebanon (Mediterranean) to the Gulf (Hormuz) to Yemen (Red Sea/Bab al-Mandab) to Diego Garcia (Indian Ocean). If Houthis resume Red Sea shipping attacks from 2023-2024, BOTH major energy chokepoints could be blocked simultaneously.",
    thesisScorecard: [
      {
        thesis: 'Houthi entry',
        initialConfidence: 50,
        currentConfidence: 100,
        status: 'confirmed',
        evidence: [
          "Houthis launch first strikes on Israel from Yemen",
          "Missile + UAV toward southern Israel and Eilat",
          "War spans Mediterranean to Indian Ocean",
        ],
      },
      {
        thesis: 'Dual chokepoint risk',
        initialConfidence: 40,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          "Houthis control Bab al-Mandab access",
          "Iran controls Hormuz",
          "If both blocked, Middle East energy landlocked",
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 1],
    keyDevelopments: [
      {
        category: 'Geographic Expansion',
        items: [
          "HOUTHIS ENTER WAR — first strikes on Israel from Yemen",
          "Missile + UAV toward southern Israel and Eilat",
          "War now spans Mediterranean to Red Sea to Indian Ocean",
          "One missile intercepted over Red Sea",
        ],
      },
      {
        category: 'Casualties',
        items: [
          "US total: 13 killed, 300+ wounded",
          "3 Lebanese journalists killed in Israeli strikes",
        ],
      },
      {
        category: 'International',
        items: [
          "UK sending mine-clearing ship RFA Lyme Bay",
          "US deploys autonomous unmanned boats",
          "Ukraine-Qatar sign missile/UAV interception agreement",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 110,
      vlccRate: 500000,
      hySpread: 575,
      vix: 29.5,
      usGas: 3.95,
    },
    tradingImplications: [
      "Dual chokepoint risk now real — Hormuz + Bab al-Mandab",
      "If Houthis resume 2023-24 Red Sea attacks, shipping completely rerouted",
      "Russia-Iran-Houthi axis vs US-Israel-GCC structure emerging",
      "Scenario: Quick 8% / Protracted 50% / Full 42%",
    ],
  },
  30: {
    day: 30,
    date: 'March 29, 2026',
    title: "One Month In: Pakistan Convenes, Trump Claims Victory, the War Continues",
    summary: "30 days. The war is now longer than the June 2025 12-day war, longer than any Middle East conflict since 2003. The Pakistan 4-nation meeting (Saudi, Turkey, Egypt) is the most serious multilateral diplomatic effort yet. Trump's musing about Kharg Island seizure is the first public acknowledgment that US ground forces in Iran is on the table.",
    thesisScorecard: [
      {
        thesis: 'Diplomatic framework emerging',
        initialConfidence: 30,
        currentConfidence: 65,
        status: 'developing',
        evidence: [
          "Pakistan/Saudi/Turkey/Egypt FMs meet in Islamabad",
          "Most serious multilateral effort yet",
          "Iran allows 20 Pakistan ships through Hormuz (2/day)",
        ],
      },
      {
        thesis: 'Ground forces on the table',
        initialConfidence: 10,
        currentConfidence: 40,
        status: 'developing',
        evidence: [
          "Trump muses about Kharg Island seizure",
          "'We'd have to be there for a while'",
          "First public acknowledgment of potential occupation",
        ],
      },
      {
        thesis: 'Iraq as combatant',
        initialConfidence: 75,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          "Iraq PMF deployed INSIDE Iran — fighting alongside Iranian forces",
          "PM green light + physical presence = active combatant status",
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 1],
    keyDevelopments: [
      {
        category: 'Diplomatic',
        items: [
          "Pakistan/Saudi/Turkey/Egypt FMs meet in Islamabad",
          "Most serious multilateral diplomatic effort yet",
          "Trump: Iran agreed to 'most of' 15-point plan",
          "Iran FM: 'No negotiations have happened with the enemy'",
        ],
      },
      {
        category: 'Hormuz',
        items: [
          "Iran allows 20 Pakistan ships through (2/day)",
          "Selective access expanding as part of diplomatic engagement",
          "But Western shipping still blocked",
        ],
      },
      {
        category: 'Escalation',
        items: [
          "Trump considering Kharg Island seizure — ground forces discussed",
          "Iraq PMF deployed inside Iran — militia fighting with Iranians",
          "WSJ: Trump open to arming Kurdish militias against Tehran",
        ],
      },
      {
        category: 'Global Impact',
        items: [
          "Australia: free public transit, considering fuel rationing",
          "Brent up 50%+ from pre-war $73",
          "IEA: biggest oil shock in history",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 108,
      vlccRate: 505000,
      hySpread: 565,
      vix: 28.5,
      usGas: 3.98,
    },
    tradingImplications: [
      "Pakistan framework is most credible diplomatic path yet",
      "But pattern continues: Trump claims progress, Iran denies, strikes continue",
      "Kharg seizure discussion = ground war option now on table",
      "Australia rationing shows global demand destruction spreading",
      "Scenario: Quick 15% / Protracted 55% / Full 30%",
    ],
  },
  31: {
    day: 31,
    date: 'March 30, 2026',
    title: "Week Five: The Restructuring Is Already Happening",
    summary: "Your Part II thesis isn't a prediction anymore — it's a description of current reality. Oil up 50% from pre-war. Gas up 40%. S&P at 2026 lows. VIX above 30. Fed cuts priced out to 2027-2028. Airlines hemorrhaging. Australia rationing fuel. The 'coming restructuring cycle' is arriving ahead of schedule.",
    thesisScorecard: [
      {
        thesis: 'Part II restructuring cycle',
        initialConfidence: 85,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          "Oil up 50%+ from pre-war",
          "Gas up 40% from January",
          "S&P at 2026 lows, VIX 31.05",
          "Fed cuts priced out to 2027-2028",
          "Australia offering free transit, considering rationing",
        ],
      },
      {
        thesis: 'Protracted Attrition base case',
        initialConfidence: 55,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          "War enters 5th week — longest since 2003",
          "Pattern: claims → denials → strikes continue",
          "Negotiations via Pakistan but no ceasefire",
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 4],
    keyDevelopments: [
      {
        category: 'Markets',
        items: [
          "S&P 6,369 (-1.67%)",
          "VIX 31.05 (+13.16%)",
          "Brent $99-107 range",
          "Oil up 50%+ since war began",
        ],
      },
      {
        category: 'Week 5 Summary',
        items: [
          "Day 27: Arak + steel factories struck (economic warfare)",
          "Day 28: WTI $100, 15 US wounded, Russia-Iran intel sharing",
          "Day 29: Houthis enter war — geographic expansion to Red Sea",
          "Day 30: Pakistan 4-nation meeting, Kharg seizure discussed",
          "Day 31: IEA confirms biggest oil shock in history",
        ],
      },
      {
        category: 'Casualties Through Day 31',
        items: [
          "US: 13 killed, 300+ wounded",
          "Israel: 18 civilians killed, 5,492 injured",
          "Iran military: 5,300+",
          "Lebanon: 1,072 killed",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 104,
      vlccRate: 510000,
      hySpread: 580,
      vix: 31.05,
      usGas: 3.98,
    },
    tradingImplications: [
      "Part II thesis now describing reality, not predicting it",
      "Restructuring cycle timeline: 12-15 months (accelerated from original 24)",
      "Global demand destruction visible: Australia, Sri Lanka, China subsidizing",
      "S&P at 2026 lows — credit stress transmission active",
      "Fed trapped: can't cut (inflation) or hike (recession risk)",
      "Scenario: Quick 15% / Protracted 55% / Full 30%",
    ],
  },
  32: {
    day: 32,
    date: 'March 31, 2026',
    title: "The Hormuz Admission: Trump Prepared to End War Without Reopening the Strait",
    summary: "The most significant strategic admission of the war. Reporting indicates Trump and senior aides have concluded that reopening Hormuz extends beyond their 4-6 week timeline — and they're prepared to end operations without resolving it. This is the fundamental shift: from 'victory over Iran' to 'damage limitation for the US.' Brent closes March up 63%, the largest monthly gain since 1988. Gas crosses $4/gallon. The IRGC escalates with direct threats against 18 US tech companies including Apple, Microsoft, and Nvidia.\n\nChina and Pakistan present a five-point ceasefire plan calling for immediate cessation of hostilities and restoration of Hormuz passage. Iran's parliament Security Committee passes the 'Strait of Hormuz Management Plan' — legislation codifying sovereignty claims and transit fees. The Kuwaiti VLCC Al Salmi is struck by an Iranian drone at Dubai port, the 23rd commercial vessel hit since the war began. The pattern is clear: Iran is winning the attrition game while the coalition struggles to define victory.",
    thesisScorecard: [
      {
        thesis: 'Hormuz remains closed post-war',
        initialConfidence: 30,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          'Trump administration concludes Hormuz reopening extends beyond 4-6 week timeline',
          'Prepared to end war without resolving blockade',
          'Iran demanding sovereignty recognition as condition',
          'Parliament codifying Hormuz sovereignty into law',
          '23+ vessels attacked — maritime insurance will not normalize',
        ],
      },
      {
        thesis: 'Tech infrastructure becomes target',
        initialConfidence: 40,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'IRGC threatens 18 US tech companies',
          'Apple, Microsoft, Google, Nvidia, Meta, Tesla, Boeing all named',
          'Amazon data centers already hit in early March',
          'Deadline: April 1, 20:00 Tehran time',
        ],
      },
      {
        thesis: 'Gas above $4/gallon',
        initialConfidence: 70,
        currentConfidence: 100,
        status: 'confirmed',
        evidence: [
          'Gas hits $4.02/gallon national average',
          'Largest monthly jump on record per AAA',
          'Up from $2.81 in January — 43% increase',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 3],
    keyDevelopments: [
      {
        category: 'Strategic Shift',
        items: [
          'Trump administration concludes Hormuz reopening extends beyond 4-6 week timeline',
          'Trump now prepared to end war without resolving Hormuz blockade',
          "Rubio: US objectives achieved in 'weeks, not months' — but Hormuz not among them",
          'Iran demands Hormuz sovereignty recognition as condition to end war',
        ],
      },
      {
        category: 'Shipping/Energy',
        items: [
          'Kuwaiti VLCC Al Salmi struck by Iranian drone at Port of Dubai',
          '23+ commercial vessels hit since war started',
          'Brent closes March up 63% — largest monthly gain since 1988',
          'Gas hits $4.02/gallon — largest monthly jump on record',
        ],
      },
      {
        category: 'Tech Escalation',
        items: [
          'IRGC threatens 18 US tech companies: Apple, Microsoft, Google, Nvidia, Meta, Tesla, Boeing, JP Morgan',
          'Deadline: April 1, 20:00 Tehran time',
          'Employees warned to evacuate 1km radius around facilities',
          'Amazon data centers in UAE/Bahrain already hit in early March',
        ],
      },
      {
        category: 'Diplomatic',
        items: [
          'China-Pakistan present 5-point ceasefire plan',
          'Iran parliament passes Strait of Hormuz Management Plan',
          'Plan codifies sovereignty, establishes rial-based toll system',
          'Already charging $2 million per vessel — could yield $600M+/month',
        ],
      },
      {
        category: 'Casualties',
        items: [
          '348 US troops wounded per Pentagon',
          '15 US service members killed',
          'Iran military: 6,000+ killed',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 112.78,
      vlccRate: 520000,
      hySpread: 590,
      vix: 28.5,
      usGas: 4.02,
    },
    tradingImplications: [
      'Hormuz may remain functionally closed even after war ends — structural shipping risk',
      'Tech companies with Middle East exposure now have physical asset risk',
      'Brent +63% in March = largest monthly gain since 1988 — unprecedented velocity',
      'Gas above $4 triggers consumer behavior shift — demand destruction accelerates',
      'GCC pushing Trump to continue strikes — want Iran decisively defeated',
      'Scenario: Quick 18% / Protracted 58% / Full 24%',
    ],
  },
  33: {
    day: 33,
    date: 'April 1, 2026',
    title: "Trump's Address: 'Nearing Completion' While Promising 2-3 More Weeks of War",
    summary: "Trump's first primetime address revealed the gap between rhetoric and reality. In 20 minutes, he declared the war 'nearing completion' while simultaneously promising to hit Iran 'extremely hard' for 2-3 more weeks. The speech offered no exit strategy, no Hormuz solution, no ceasefire framework. Markets briefly rallied on rumors Iran's president wanted peace — Tehran immediately called this 'false and baseless.' The S&P posted its best session in nearly a year (+2.9%), then gave it back as oil surged 4% on traders concluding the war won't end quickly.\n\nThe day's most consequential development may be the strike on Kamal Kharazi's Tehran home. The former foreign minister — who was overseeing back-channel talks with VP Vance via Pakistan — was seriously wounded and his wife killed. Iran described the attack as an attempt to derail diplomacy. With Larijani dead and Kharazi wounded, Iran has no credible negotiation partner remaining. UK PM Starmer declared 'this is not our war' as coalition fractures widen.",
    thesisScorecard: [
      {
        thesis: 'Trump claims vs reality diverging',
        initialConfidence: 60,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          "Speech: war 'nearing completion'",
          "Also: 2-3 more weeks of 'extremely hard' strikes",
          'No exit strategy, no Hormuz solution presented',
          'Iran denies all ceasefire claims',
        ],
      },
      {
        thesis: 'Diplomatic channel damaged',
        initialConfidence: 50,
        currentConfidence: 80,
        status: 'developing',
        evidence: [
          'Kamal Kharazi (key negotiator) seriously wounded, wife killed',
          'Was overseeing Pakistan channel to VP Vance',
          'Strike described as attempt to derail diplomacy',
          'Combined with Larijani death — no credible negotiator remaining',
        ],
      },
      {
        thesis: 'Coalition fracturing',
        initialConfidence: 45,
        currentConfidence: 70,
        status: 'developing',
        evidence: [
          "UK PM Starmer: 'This is not our war'",
          'Britain explicitly staying out',
          'Austria rejecting all US overflights',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 2],
    keyDevelopments: [
      {
        category: 'Trump Address',
        items: [
          'First primetime address on war — 20 minutes',
          "Claims war 'nearing completion'",
          "Promises 2-3 more weeks of 'extremely hard' strikes",
          'No exit strategy or Hormuz solution presented',
          "Oil jumped 4% as traders concluded war won't end quickly",
        ],
      },
      {
        category: 'Diplomatic',
        items: [
          'Kamal Kharazi (former FM, key negotiator) seriously wounded, wife killed',
          'Strike hit his Tehran home — Iran calls it attempt to derail diplomacy',
          "Iran denies Trump ceasefire claims — 'false and baseless'",
          "UK PM Starmer: 'This is not our war and we're not going to get dragged into it'",
        ],
      },
      {
        category: 'Military',
        items: [
          'Cluster munition used in Tel Aviv area attack — 16 wounded including children',
          '11-year-old girl critically wounded by Iranian cluster bomb in Bnei Brak',
          'Kuwait airport fuel depots hit by Iranian drone',
          '416 waves of attacks from Iran toward Israel since war began',
        ],
      },
      {
        category: 'Markets',
        items: [
          'S&P posts best session in nearly a year (+2.9%) on ceasefire rumors',
          'Rally reversed as Iran denied talks',
          'Gas hits $4.06/gallon national average',
          '520+ US personnel injured since war began',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 104.86,
      vlccRate: 515000,
      hySpread: 585,
      vix: 24.54,
      usGas: 4.06,
    },
    tradingImplications: [
      "Trump's speech = buy rumor, sell news — no substance behind 'nearing completion'",
      'Kharazi wounding removes key diplomatic channel — harder to negotiate now',
      'S&P +2.9% session was false signal — reversed on Iran denial',
      'UK explicitly out = coalition of willing shrinking',
      'Cluster munitions targeting civilian areas = escalation in targeting',
      'Scenario: Quick 20% / Protracted 55% / Full 25%',
    ],
  },
  34: {
    day: 34,
    date: 'April 2, 2026',
    title: "Post-Speech Reality: Oil Surges as Markets Digest No Exit Strategy",
    summary: "The day after Trump's address, markets delivered their verdict: oil surged as traders processed that the speech offered no path to resolution. WTI jumped 10.3% to $110.47, Brent rose 8.2% to $109.40. The IEA warned that April will be 'much worse than March' — they've lost 12 million barrels per day, more than two oil crises combined. China and Russia are now actively calling for ceasefire while Austria rejects all US overflights. The coalition supporting this war is narrowing while the economic damage compounds daily.\n\nGoldman Sachs warns the S&P could drop another 5-7% if Hormuz stays closed through summer. VIX futures in backwardation signal acute near-term stress. Gas hits $4.10/gallon — up 46% from January's $2.81. South Korea requests $17.3B emergency budget for energy security. The macro transmission chain is fully active: Energy Shock → Inflation → Fed Constraint → Spread Widening → Credit Stress. Your Part II thesis is now consensus reality.",
    thesisScorecard: [
      {
        thesis: 'April worse than March',
        initialConfidence: 70,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          "IEA: April will be 'much worse than March'",
          'Lost 12 million bpd — more than two oil crises combined',
          "IEA calls it 'worst energy crisis in history'",
        ],
      },
      {
        thesis: 'Great power involvement expanding',
        initialConfidence: 55,
        currentConfidence: 80,
        status: 'developing',
        evidence: [
          'China calls for immediate ceasefire',
          'Putin calls MBS urging diplomatic efforts',
          'Russia provided targeting intel for Prince Sultan strike',
          'Non-US actors increasingly shaping outcome',
        ],
      },
      {
        thesis: 'Coalition shrinking',
        initialConfidence: 70,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'Austria rejects all US military overflights since war began',
          'UK staying out',
          'Only Israel and GCC states actively supporting operations',
          'Spain, France, Italy have also denied US airspace/bases',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 1],
    keyDevelopments: [
      {
        category: 'Markets',
        items: [
          'Oil surges post-speech: WTI +10.3% to $110.47, Brent +8.2% to $109.40',
          'Markets digest: no exit strategy in Trump address',
          'VIX futures in backwardation signaling acute near-term stress',
          'Goldman: S&P could drop 5-7% more if Hormuz stays closed through summer',
        ],
      },
      {
        category: 'IEA Warning',
        items: [
          "IEA warns April will be 'much worse than March'",
          'Lost 12 million bpd — more than two oil crises combined',
          "Birol: 'worst energy crisis in history'",
          "Food security 'timebomb' warning from International Rescue Committee",
        ],
      },
      {
        category: 'International',
        items: [
          "China calls for immediate ceasefire — 'military means cannot solve the problem'",
          'Putin calls MBS urging diplomatic efforts to end war',
          'Austria rejects all US military overflights since war began',
          'South Korea requests $17.3B emergency budget for energy security',
        ],
      },
      {
        category: 'Military',
        items: [
          '14 wounded near Tel Aviv including 11-year-old girl',
          'Tanker hit off Qatar coast — damage but no casualties',
          'Senior Hezbollah commander killed in Beirut — 7 total killed',
          '7 Iraqi fighters killed in US strike on Anbar military base',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 109.40,
      vlccRate: 525000,
      hySpread: 595,
      vix: 24.54,
      usGas: 4.10,
    },
    tradingImplications: [
      "Oil surge = market calling Trump's bluff on 'nearing completion'",
      'IEA warning: April worse than March = do not expect relief',
      'China/Russia diplomatic push = alternative resolution framework emerging',
      'Coalition shrinking (Austria, UK out) = US increasingly isolated',
      'S&P vulnerable to another 5-7% if Hormuz stays closed through summer',
      'Scenario: Quick 18% / Protracted 57% / Full 25%',
    ],
  },
  35: {
    day: 35,
    date: 'April 3, 2026',
    title: "First Blood in the Sky: Two US Aircraft Down as Iran Hits Gulf Infrastructure",
    summary: "The air war turns costly for America. Iran shoots down two US aircraft in rapid succession: an F-15E Strike Eagle over southwestern Iran and an A-10 Warthog near the Strait of Hormuz. One crew member is rescued immediately by combat search and rescue; another remains missing in hostile terrain, triggering an ongoing SAR operation that will dominate the next 48 hours.\n\nMeanwhile, Iran scores its deadliest single strike of the war: a ballistic missile barrage on Prince Sultan Air Base in Saudi Arabia kills 5 US airmen and wounds 37. Total US casualties now stand at 23 killed and 580+ wounded — numbers that are beginning to resonate politically. The missing pilot's status becomes the dominant story, with the Pentagon refusing to confirm whether they are evading capture or have been taken prisoner.\n\nMarkets sell off hard on the news, with oil spiking above $120/barrel and the S&P dropping 2.3%. This is the moment the air campaign's cost becomes tangible to the American public: two aircraft down in a single day, casualties mounting at Prince Sultan, and a pilot's fate unknown in hostile Iranian territory.",
    thesisScorecard: [
      {
        thesis: 'US air superiority contested',
        initialConfidence: 25,
        currentConfidence: 70,
        status: 'developing',
        evidence: [
          'F-15E Strike Eagle shot down over southwestern Iran',
          'A-10 Warthog lost near Strait of Hormuz',
          "Iran's air defense network proving more capable than expected",
          'Losses will constrain aggressive strike packages',
        ],
      },
      {
        thesis: 'US casualties becoming politically significant',
        initialConfidence: 40,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          '5 killed at Prince Sultan — deadliest single strike',
          '23 total deaths, 580+ wounded',
          'Missing pilot dominates news cycle',
          'Domestic political pressure building',
        ],
      },
      {
        thesis: 'SAR operations creating tactical constraints',
        initialConfidence: 30,
        currentConfidence: 65,
        status: 'developing',
        evidence: [
          'Missing pilot in hostile terrain',
          'SAR assets diverted from strike missions',
          'Political pressure to prioritize rescue',
          'Operational tempo affected by search requirements',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 4],
    keyDevelopments: [
      {
        category: 'Aircraft Losses',
        items: [
          'F-15E Strike Eagle shot down over southwestern Iran',
          'A-10 Warthog lost near Strait of Hormuz',
          'One crew member rescued immediately by CSAR',
          'One missing in hostile terrain — SAR operation ongoing',
        ],
      },
      {
        category: 'Prince Sultan Strike',
        items: [
          '5 US airmen killed — deadliest single strike of the war',
          '37 wounded in ballistic missile barrage',
          'Base houses F-15s and refueling aircraft',
          'Saudi air defenses failed to intercept',
        ],
      },
      {
        category: 'SAR Operation',
        items: [
          'Pentagon confirms active search and rescue mission',
          'Missing pilot status unknown — evading or captured',
          'CSAR helicopters operating deep in Iranian territory',
          'Operational tempo affected as assets diverted to search',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil spikes above $120/barrel on aircraft loss news',
          'S&P drops 2.3% on escalation fears',
          'Defense stocks rally (LMT +4%, RTX +3%)',
          'Gas hits $4.15/gallon national average',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 121.88,
      vlccRate: 535000,
      hySpread: 610,
      vix: 27.80,
      usGas: 4.15,
    },
    tradingImplications: [
      'Two aircraft losses in one day = air campaign costs becoming visible',
      'Missing pilot creates rescue pressure on administration',
      'SAR diversion = strike tempo may slow as assets redirected',
      'Prince Sultan casualty count will fuel domestic opposition',
      '23 KIA / 580 wounded = approaching political sustainability threshold',
      'Scenario: Quick 15% / Protracted 55% / Full 30%',
    ],
  },
  36: {
    day: 36,
    date: 'April 4, 2026',
    title: "70% of Iran's Gasoline: The Mahshahr Strike and the Economic Decapitation Play",
    summary: "The US and Israel execute the economic decapitation play. In a coordinated 4-hour strike package, coalition forces destroy the Mahshahr refinery complex and supporting gasoline infrastructure. The result: 70% of Iran's domestic gasoline production capacity is eliminated in a single day. Iran, which was already rationing fuel, now faces complete energy collapse. Lines at gas stations stretch for miles. The regime implements emergency rationing — 10 liters per vehicle per week.\n\nThis is Iran's 'March 2020 moment' — economic annihilation designed to break the regime's will. But Tehran responds in kind. Iran launches a massive retaliatory strike on Dubai infrastructure: the Jebel Ali port takes multiple hits, the Dubai International Airport's Terminal 3 is struck, and fires burn across the commercial district. UAE reports 23 civilians killed.\n\nThe war has entered its most brutal phase. Both sides are now explicitly targeting economic survival rather than military assets. The IRGC threatens to expand targeting to global shipping lanes beyond Hormuz — Bab el-Mandeb, Malacca — if energy infrastructure strikes continue. Goldman Sachs warns that the 'economic warfare escalation' could push oil to $140 within two weeks.",
    thesisScorecard: [
      {
        thesis: 'Economic warfare escalation',
        initialConfidence: 60,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          "Mahshahr strike = 70% of Iran's gasoline capacity destroyed",
          'Iran retaliates on Dubai civilian infrastructure',
          'Both sides now targeting economic survival',
          'IRGC threatens expanded shipping lane targeting',
        ],
      },
      {
        thesis: 'Iran domestic crisis accelerating',
        initialConfidence: 55,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Fuel rationing implemented: 10 liters/week',
          'Gas lines stretching for miles',
          'Social unrest reports from Isfahan, Shiraz',
          "Regime facing internal pressure as 'resistance economy' fails",
        ],
      },
      {
        thesis: 'GCC infrastructure permanently impaired',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Dubai infrastructure struck — 23 civilians killed',
          'Jebel Ali port taking multiple hits',
          'Dubai International Airport Terminal 3 damaged',
          'Insurance markets will not normalize for years',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 3],
    keyDevelopments: [
      {
        category: 'Mahshahr Strike',
        items: [
          "70% of Iran's gasoline production capacity destroyed",
          'Coordinated 4-hour US-Israel strike package',
          'Refinery complex and distribution infrastructure hit',
          "Iran's domestic fuel crisis now acute — rationing at 10L/week",
        ],
      },
      {
        category: 'Iran Retaliation',
        items: [
          'Massive strike on Dubai — 23 civilians killed',
          'Jebel Ali port hit multiple times',
          'Dubai International Airport Terminal 3 struck',
          'IRGC threatens Bab el-Mandeb and Malacca strait targeting',
        ],
      },
      {
        category: 'International Response',
        items: [
          'UN Security Council emergency session convened',
          'Russia proposes immediate ceasefire resolution',
          'India halts all Gulf LNG imports pending insurance',
          "China: 'Spiral of escalation must stop immediately'",
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil surges to $122/barrel on infrastructure targeting',
          'Goldman warns $140 possible within two weeks',
          'S&P drops 1.8% on expanded war fears',
          'Gas hits $4.22/gallon national average',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 122.50,
      vlccRate: 550000,
      hySpread: 635,
      vix: 31.20,
      usGas: 4.22,
    },
    tradingImplications: [
      "Mahshahr strike = Iran's March 2020 — economic collapse accelerating",
      'Dubai retaliation shows Iran will match economic targeting',
      'IRGC threat to other straits = global shipping risk premium increasing',
      '$140 oil warning from Goldman = not priced in yet',
      'Economic warfare phase = longer timeline, deeper damage',
      'Scenario: Quick 14% / Protracted 51% / Full 35%',
    ],
  },
  37: {
    day: 37,
    date: 'April 5, 2026',
    title: "The Easter Miracle: Delta Force Rescues Colonel Morrison From Zagros Mountains",
    summary: "On Easter Sunday, America gets its miracle. A Delta Force team executes a daring nighttime raid into the Zagros Mountains and rescues Colonel Jake Morrison, the F-35 pilot captured two days earlier. The 4-hour operation kills 8 Iranian Revolutionary Guard soldiers and captures 3 others. No US casualties. The F-35 wreckage is confirmed destroyed by a secondary strike to prevent technology capture.\n\nColonel Morrison is extracted to a US Navy ship in the Gulf and speaks briefly to President Trump via satellite phone. Trump, addressing the nation from the White House lawn, declares: 'American heroes are never left behind. Our military is the greatest in the world.' His approval rating spikes 8 points overnight.\n\nMarkets rally hard on the rescue and growing diplomatic momentum. The S&P gains 3.2%, its best day in three weeks. Oil drops $7/barrel on hopes that the rescue success might accelerate negotiations. Behind the scenes, Swiss intermediaries are working overtime. Iran, reeling from the Mahshahr strike and now this humiliation, signals potential flexibility on a 45-day ceasefire framework that would include Hormuz reopening and a POW exchange. The momentum is shifting.",
    thesisScorecard: [
      {
        thesis: 'US special operations capability intact',
        initialConfidence: 75,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Delta Force executes flawless rescue',
          '8 IRGC killed, 3 captured, zero US casualties',
          'Deep penetration into Iranian territory successful',
          'F-35 wreckage destroyed preventing tech capture',
        ],
      },
      {
        thesis: 'Diplomatic momentum building',
        initialConfidence: 30,
        currentConfidence: 55,
        status: 'developing',
        evidence: [
          'Iran signals flexibility on 45-day framework',
          'Swiss channel extremely active',
          'Rescue removes POW leverage from Iran',
          'Both sides approaching exhaustion point',
        ],
      },
      {
        thesis: 'Trump political position strengthening',
        initialConfidence: 45,
        currentConfidence: 70,
        status: 'developing',
        evidence: [
          'Rescue = major propaganda victory',
          'Approval rating +8 points overnight',
          '"Never left behind" narrative resonating',
          'Political pressure for quick resolution reduced',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 2],
    keyDevelopments: [
      {
        category: 'Delta Force Rescue',
        items: [
          'Colonel Morrison rescued from Zagros Mountains',
          '4-hour nighttime operation — deep into Iranian territory',
          '8 IRGC guards killed, 3 captured, zero US losses',
          'F-35 wreckage destroyed by secondary strike',
        ],
      },
      {
        category: 'Political Impact',
        items: [
          'Trump approval rating spikes 8 points',
          '"American heroes never left behind" — instant iconic quote',
          'Morrison speaks to Trump via satellite phone',
          'Pentagon releases dramatic helmet cam footage',
        ],
      },
      {
        category: 'Diplomatic Movement',
        items: [
          'Iran signals flexibility on 45-day ceasefire framework',
          'Framework includes: Hormuz reopening, POW exchange, humanitarian corridors',
          'Swiss intermediaries working overtime',
          'Both sides approaching exhaustion — window opening',
        ],
      },
      {
        category: 'Markets',
        items: [
          'S&P rallies 3.2% — best day in three weeks',
          'Oil drops $7/barrel on de-escalation hopes',
          'VIX falls to 25 from 31',
          'Gas at $4.18/gallon as markets price in resolution hope',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 115.50,
      vlccRate: 540000,
      hySpread: 605,
      vix: 25.40,
      usGas: 4.18,
    },
    tradingImplications: [
      'Rescue = complete narrative shift for Trump administration',
      "POW leverage eliminated — Iran's negotiating position weakened",
      'F-35 tech capture prevented — long-term win',
      '45-day framework = first serious ceasefire path',
      'Market rally = pricing in resolution probability increase',
      'Scenario: Quick 20% / Protracted 50% / Full 30%',
    ],
  },
  38: {
    day: 38,
    date: 'April 6, 2026',
    title: "Power Plant Day: Trump's Final Ultimatum as 45-Day Ceasefire Framework Emerges",
    summary: "Trump issues his final ultimatum: accept the 45-day ceasefire framework by midnight, or US forces will begin systematic destruction of Iran's power grid. The threat is explicit — 'Every power plant, every substation, every transformer. Iran will go dark.' This is the leverage play: Iran's economy is already collapsing from the Mahshahr strike; losing electricity would trigger complete societal breakdown.\n\nThe 45-day framework is now on the table with specific terms: immediate ceasefire, Hormuz reopening within 72 hours, POW exchange (including the 3 IRGC captured in the rescue), humanitarian corridors, and a path to formal negotiations. China and Russia are publicly urging Tehran to accept. The Swiss channel reports that pragmatic elements in the Iranian government are pushing hard for acceptance.\n\nIran's parliament holds an emergency session. Hardliners argue that accepting under ultimatum shows weakness; pragmatists argue that rejecting means civilizational destruction. The regime is at its breaking point. Markets are cautiously optimistic — oil drops to $108/barrel and equities rally 2%+ globally. Everyone is watching the midnight deadline.\n\nDay 38 ends with the war at its most consequential inflection point. Either the 45-day framework provides an off-ramp, or the conflict escalates to infrastructure annihilation. The market is pricing in 50/50 odds either way.",
    thesisScorecard: [
      {
        thesis: 'Endgame approaching',
        initialConfidence: 35,
        currentConfidence: 70,
        status: 'developing',
        evidence: [
          'Trump ultimatum creates forcing function',
          '45-day framework with specific terms on table',
          'Both sides at exhaustion point',
          'China/Russia pushing Iran to accept',
        ],
      },
      {
        thesis: 'Iran facing existential choice',
        initialConfidence: 60,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Power grid threat = civilizational collapse',
          'Mahshahr already destroyed fuel capacity',
          'Pragmatists gaining influence over hardliners',
          'Parliament split reflects regime fracturing',
        ],
      },
      {
        thesis: 'Framework provides genuine off-ramp',
        initialConfidence: 25,
        currentConfidence: 50,
        status: 'developing',
        evidence: [
          'Specific terms: Hormuz 72hr, POW exchange, humanitarian corridors',
          'Swiss channel active and productive',
          'Great powers supporting framework',
          '45 days = face-saving duration for both sides',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[scenarioUpdates.length - 1],
    keyDevelopments: [
      {
        category: 'Trump Ultimatum',
        items: [
          'Accept 45-day framework by midnight or power grid targeted',
          '"Every power plant, every substation, every transformer"',
          'Most explicit threat of infrastructure annihilation yet',
          'Leverage play: economy already broken, electricity loss = total collapse',
        ],
      },
      {
        category: '45-Day Framework',
        items: [
          'Immediate ceasefire upon acceptance',
          'Hormuz reopening within 72 hours',
          'POW exchange including 3 IRGC from rescue raid',
          'Humanitarian corridors and path to formal negotiations',
        ],
      },
      {
        category: 'International Pressure',
        items: [
          'China publicly urges Iran to accept',
          'Russia: "Window for diplomatic solution closing"',
          'Swiss channel reports pragmatists gaining ground',
          'EU preparing humanitarian aid package contingent on ceasefire',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil drops to $108/barrel on framework hopes',
          'European markets rally 2.5%',
          'S&P futures +1.8% as deadline approaches',
          'Gas at $4.12/gallon — pricing in potential de-escalation',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 108.30,
      vlccRate: 520000,
      hySpread: 590,
      vix: 23.10,
      usGas: 4.12,
    },
    tradingImplications: [
      'Midnight deadline = binary event risk for all positions',
      'Framework acceptance = oil sub-$100 within days',
      'Framework rejection = power grid strikes and oil $130+',
      'Current pricing = ~50% probability of resolution',
      'VIX drop to 23 suggests market leaning optimistic',
      'Scenario: Quick 25% / Protracted 50% / Full 25%',
    ],
  },
  39: {
    day: 39,
    date: 'April 7, 2026',
    title: "90 Minutes to Midnight: The Ceasefire",
    summary: "Day 39 will be remembered as The Day. At 6:30pm ET, Trump posts on Truth Social: 'a whole civilization will die tonight, never to be brought back again.' The civilizational destruction play — the threat that has hung over every negotiation since Day 1 — is about to be executed.\n\nThen, at 6:31pm — 90 minutes before the 8pm deadline — Trump posts again: 'Double sided CEASEFIRE!' Iran's Supreme National Security Council accepts. Mojtaba Khamenei approved after a last-minute nudge from China. Pakistan PM Sharif announces the ceasefire includes all fronts including Lebanon. Iran confirms Hormuz will reopen for safe passage.\n\nOil crashes 16% in a single session — the largest single-day drop since March 2020. Dubai's market surges 8.5%. Seoul jumps 6.9%. Global markets rally as the threat of civilizational destruction recedes.\n\nIn restructuring terms: the creditor finally put the gun on the table, and the debtor came to negotiate. The two-week ceasefire window provides the first diplomatic off-ramp since Day 1. But positions remain far apart — 39 days of war have hardened both sides, and the fundamental questions (nuclear, Hormuz, sanctions, reparations) remain unresolved. This is a pause, not a peace.",
    thesisScorecard: [
      {
        thesis: 'Maximum leverage produces negotiation',
        initialConfidence: 40,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'Civilizational destruction threat produced ceasefire',
          'Iran accepted 90 minutes before deadline',
          'China intervention sealed the deal',
          'Creditor gun-on-table theory validated',
        ],
      },
      {
        thesis: 'Ceasefire ≠ resolution',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Two-week window is short',
          'Fundamental issues unresolved',
          'Positions hardened over 39 days',
          'Nuclear, Hormuz, sanctions, reparations all outstanding',
        ],
      },
      {
        thesis: 'Oil price volatility around diplomatic events',
        initialConfidence: 60,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          '16% crash in single session',
          'Largest drop since March 2020',
          'Markets pricing hope, not reality',
          'Volatility both directions — not resolution',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[28], // Day 39
    keyDevelopments: [
      {
        category: 'The Ceasefire',
        items: [
          "Trump: 'a whole civilization will die tonight' at 6:30pm ET",
          "'Double sided CEASEFIRE!' posted 6:31pm — 90 minutes before deadline",
          "Iran's Supreme National Security Council accepts",
          'Mojtaba Khamenei approved after China intervention',
          'Pakistan PM: ceasefire includes all fronts including Lebanon',
          'Iran confirms Hormuz will reopen for safe passage',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil crashes 16% — largest single-day drop since 2020',
          'Dubai market +8.5%',
          'Seoul +6.9%',
          'Global equities surge across all regions',
          'VIX drops from 27 to 19 in hours',
        ],
      },
      {
        category: 'Outstanding Issues',
        items: [
          'Nuclear: Iran enrichment rights unresolved',
          'Hormuz: sovereignty vs freedom of navigation',
          'Sanctions: US demands maximum pressure continue',
          'Reparations: Iran demands compensation for strikes',
          'Lebanon: dispute about inclusion already emerging',
        ],
      },
      {
        category: 'Context',
        items: [
          'Two-week ceasefire window — April 7-21',
          '39 days of war with no diplomatic progress until now',
          'Positions hardened — Quick Resolution still unlikely',
          'This is a pause, not a peace',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 92.00,
      vlccRate: 420000,
      hySpread: 510,
      vix: 19.00,
      usGas: 3.95,
    },
    tradingImplications: [
      'Oil -16% = largest single-session move of the war',
      'Markets pricing hope, not resolution — volatility will return',
      'Two-week window too short for comprehensive deal',
      'Nuclear issue will be the wall — it always is',
      'Lebanon dispute already emerging — ceasefire fragile',
      'Scenario: Quick 30% / Protracted 55% / Full 15%',
    ],
  },
  40: {
    day: 40,
    date: 'April 8, 2026',
    title: "Ceasefire Day One: Israel Bombs Lebanon, Iran Pauses Hormuz",
    summary: "The ceasefire takes effect — and immediately comes under strain. Within hours of the ceasefire announcement, Israel launches its strongest wave of attacks on Lebanon since the war began. More than 300 Lebanese are killed on ceasefire day one. Iran accuses Israel of violating the ceasefire and pauses Hormuz traffic that had just begun to resume.\n\nThe structural problem becomes clear: this is a bilateral US-Iran ceasefire in a multilateral war. Pakistan and Iran say the ceasefire includes Lebanon. The US and Israel say it does not. Without resolution of the Lebanon question, the ceasefire cannot hold.\n\nTwo ships begin moving through the Strait of Hormuz per MarineTraffic data — the first movement in weeks. But Iran halts further transits after the Lebanon strikes. Iraqi airspace reopens. Pro-Iran Iraqi factions announce a two-week halt to operations. But Iran is already accusing the US of violating multiple ceasefire clauses.\n\nOil continues to fall, hitting $88/barrel as markets cling to hope. But the ceasefire is fraying before it begins. The Lebanon dispute is exactly the kind of structural weakness that collapses fragile peace deals.",
    thesisScorecard: [
      {
        thesis: 'Bilateral ceasefire in multilateral war is unstable',
        initialConfidence: 65,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Lebanon dispute emerges within hours',
          'Pakistan/Iran say included, US/Israel say not',
          'Israel launches strongest Lebanon wave on ceasefire day',
          '300+ killed in Lebanon on Day 1 of ceasefire',
        ],
      },
      {
        thesis: 'Hormuz reopening contingent on Lebanon',
        initialConfidence: 50,
        currentConfidence: 85,
        status: 'developing',
        evidence: [
          'Iran pauses Hormuz traffic after Lebanon strikes',
          'Two ships began moving, then stopped',
          'Iran linking issues despite US attempts to separate them',
          'Conditionality will dominate negotiations',
        ],
      },
      {
        thesis: 'Israel operating outside US framework',
        initialConfidence: 55,
        currentConfidence: 80,
        status: 'developing',
        evidence: [
          'Israel strikes Lebanon on ceasefire day',
          'US/Israel positions diverge from Pakistan/Iran',
          'Israel prioritizing Hezbollah degradation over ceasefire',
          'Netanyahu calculating different timeline',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[29], // Day 40
    keyDevelopments: [
      {
        category: 'Ceasefire Implementation',
        items: [
          'Ceasefire officially takes effect',
          'Two ships begin moving through Hormuz per MarineTraffic',
          'Iraqi airspace reopens',
          'Pro-Iran Iraqi factions announce 2-week halt',
        ],
      },
      {
        category: 'Lebanon Crisis',
        items: [
          'Israel launches strongest wave on Lebanon since war began',
          '300+ killed in Lebanon on ceasefire day one',
          'Iran accuses Israel of violating ceasefire',
          'Iran pauses Hormuz traffic after Lebanon strikes',
        ],
      },
      {
        category: 'Dispute',
        items: [
          "Pakistan/Iran: Lebanon IS included in ceasefire",
          "US/Israel: Lebanon is NOT included in ceasefire",
          'Structural ambiguity threatens entire framework',
          'Iran accuses US of violating multiple clauses',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil falls to $88/barrel — markets clinging to hope',
          'Ceasefire strain not yet fully priced',
          'VIX at 20 — cautious optimism',
          'Gas at $3.90/gallon as prices ease',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 88.00,
      vlccRate: 430000,
      hySpread: 520,
      vix: 20.00,
      usGas: 3.90,
    },
    tradingImplications: [
      'Lebanon dispute = existential threat to ceasefire',
      'Hormuz conditionality emerging — not simple reopening',
      'Israel operating on different timeline than US',
      '300+ Lebanese dead on Day 1 = narrative disaster',
      'Oil may bounce as ceasefire fragility becomes clear',
      'Scenario: Quick 25% / Protracted 55% / Full 20%',
    ],
  },
  41: {
    day: 41,
    date: 'April 9, 2026',
    title: "Fingers on the Trigger: Ceasefire Hanging by a Thread",
    summary: "Day 41 begins with Hezbollah resuming rocket fire into northern Israel. The ceasefire is hanging by a thread. Pakistan's diplomatic efforts are the only thing preventing Iran from retaliating for the Lebanon strikes overnight. Israel strikes a bridge in Lebanon. Vance publicly states that Lebanon is 'outside ceasefire terms.' Iran's military says it has 'fingers on the trigger.'\n\nThe fundamental problem crystallizes: the US and Israel treat this as a bilateral Iran-focused ceasefire. Iran and Pakistan treat it as a regional agreement that includes Lebanon and Hezbollah. Without alignment on this basic question, the ceasefire cannot hold.\n\nGhalibaf, who will lead Iran's delegation to Islamabad, sets preconditions: Lebanon must be included in the ceasefire, and blocked Iranian assets must be released before substantive talks can begin. This is classic negotiating — establishing the framework before the negotiation itself.\n\nOil rises to $90 as the market begins pricing in ceasefire strain. There is still no sign that Hormuz will actually reopen. The ceasefire exists on paper, but the war continues in Lebanon, and the fundamental disputes remain unresolved. Everyone is watching whether the fragile pause can hold until the Islamabad talks.",
    thesisScorecard: [
      {
        thesis: 'Ceasefire will collapse before Islamabad',
        initialConfidence: 30,
        currentConfidence: 55,
        status: 'developing',
        evidence: [
          'Hezbollah rockets resume',
          "Iran military: 'fingers on the trigger'",
          'Lebanon dispute unresolved',
          'Pakistan holding center by thread',
        ],
      },
      {
        thesis: 'Preconditions will dominate Islamabad',
        initialConfidence: 50,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          'Ghalibaf sets Lebanon + assets preconditions',
          'Both sides positioning for advantage',
          'Substantive negotiation may never occur',
          'Process arguments consume bandwidth',
        ],
      },
      {
        thesis: 'Hormuz reopening indefinitely delayed',
        initialConfidence: 60,
        currentConfidence: 80,
        status: 'developing',
        evidence: [
          'No sign Hormuz blockade actually lifting',
          'Iran linking Hormuz to Lebanon',
          'Oil rising = market doubting reopening',
          'Conditionality pattern established',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[30], // Day 41
    keyDevelopments: [
      {
        category: 'Ceasefire Strain',
        items: [
          'Hezbollah resumes rockets into northern Israel',
          'Pakistan diplomatic efforts preventing Iran overnight retaliation',
          'Israel strikes bridge in Lebanon',
          "Vance: Lebanon 'outside ceasefire terms'",
          "Iran military: 'fingers on the trigger'",
        ],
      },
      {
        category: 'Islamabad Preparations',
        items: [
          'Ghalibaf sets preconditions: Lebanon ceasefire + blocked assets',
          'Delegations preparing for travel',
          'Pakistan intensifying mediation efforts',
          'Agenda disputes emerging before talks begin',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil rises to $90 as ceasefire strain priced in',
          'No sign Hormuz blockade actually lifting',
          'Markets beginning to doubt smooth reopening',
          'Gas at $3.92/gallon — easing pausing',
        ],
      },
      {
        category: 'Fundamental Divide',
        items: [
          "US/Israel view: bilateral Iran ceasefire, Lebanon separate",
          "Iran/Pakistan view: regional agreement including Lebanon",
          'Without alignment, ceasefire cannot hold',
          'Nuclear issue waiting in background',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 90.00,
      vlccRate: 440000,
      hySpread: 530,
      vix: 21.50,
      usGas: 3.92,
    },
    tradingImplications: [
      "Hezbollah rockets = ceasefire practically void in Lebanon theater",
      "'Fingers on the trigger' = Iran preparing retaliation",
      'Preconditions = Islamabad may be procedural, not substantive',
      'Oil rising = market doubting ceasefire durability',
      'Hormuz reopening increasingly unlikely during ceasefire window',
      'Scenario: Quick 22% / Protracted 56% / Full 22%',
    ],
  },
  42: {
    day: 42,
    date: 'April 10, 2026',
    title: "The Delegations Land: 300 Americans, 71 Iranians, in a Locked-Down Islamabad",
    summary: "Both delegations arrive in Islamabad for the most consequential diplomatic encounter since the 1979 Islamic Revolution. The US team is led by Vice President Vance, Special Envoy Witkoff, and senior adviser Jared Kushner. They bring approximately 300 support staff, security, and advisers — a massive delegation reflecting the stakes. Iran's team is led by Parliament Speaker Ghalibaf, Foreign Minister Araghchi, and Supreme National Security Council Secretary Ahmadian. Notably, Central Bank Governor Hemmati is on the Iranian delegation — they're ready to talk money.\n\nPakistan has locked down Islamabad for the talks. A two-day public holiday is declared. Streets are deserted. The Serena Hotel is requisitioned and surrounded by security. Pakistan's Army Chief Munir has been mediating behind the scenes for weeks. Prime Minister Sharif calls it a 'make-or-break moment.'\n\nYet even as delegations land, Trump contradicts the peace talks: 'We're loading up the ships with the best weapons ever made.' The pattern continues — promise peace, threaten escalation. Markets are cautiously optimistic, but oil is creeping up on Hormuz uncertainty. The fundamental question: can 47 years of hostility be bridged in a few days?",
    thesisScorecard: [
      {
        thesis: 'This is the highest-level meeting since 1979',
        initialConfidence: 100,
        currentConfidence: 100,
        status: 'confirmed',
        evidence: [
          'First direct US-Iran face-to-face in 47 years',
          'VP Vance, FM Araghchi-level principals',
          'Both sides sending full negotiating teams',
          'Historical significance recognized globally',
        ],
      },
      {
        thesis: 'Iran ready to discuss economic issues',
        initialConfidence: 60,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'Central Bank Governor Hemmati on delegation',
          'Sanctions relief will be central demand',
          'Economic collapse from Mahshahr strike creates urgency',
          'Iran needs revenue — ready to trade concessions',
        ],
      },
      {
        thesis: 'Trump contradictions continue',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          "'Loading up ships with best weapons' during peace talks",
          'Pattern: promise peace, threaten escalation',
          'Good cop/bad cop or genuine incoherence?',
          'Undermines negotiating position either way',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[31], // Day 42
    keyDevelopments: [
      {
        category: 'US Delegation',
        items: [
          'VP JD Vance leads delegation',
          'Special Envoy Steve Witkoff',
          'Senior Adviser Jared Kushner',
          '~300 total support staff, security, advisers',
        ],
      },
      {
        category: 'Iran Delegation',
        items: [
          'Parliament Speaker Mohammad Bagher Ghalibaf',
          'Foreign Minister Abbas Araghchi',
          'SNSC Secretary Ali Ahmadian',
          'Central Bank Governor Mohammad Reza Farzin Hemmati',
          '71 total delegation members',
        ],
      },
      {
        category: 'Islamabad',
        items: [
          'Pakistan Air Force escorts Iranian delegation',
          'Two-day public holiday declared',
          'Streets deserted, city locked down',
          'Serena Hotel requisitioned and secured',
          "PM Sharif: 'make-or-break moment'",
        ],
      },
      {
        category: 'Contradictions',
        items: [
          "Trump: 'Loading up ships with best weapons ever made'",
          'Peace talks + escalation threats simultaneously',
          'Pattern continues from entire war',
          'Markets uncertain how to price conflicting signals',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 92.00,
      vlccRate: 445000,
      hySpread: 540,
      vix: 22.00,
      usGas: 3.94,
    },
    tradingImplications: [
      'Highest-level meeting in 47 years = genuine negotiation possible',
      'Central Bank Governor = Iran ready to discuss economics',
      'Trump weapons tweet = confusion about US intentions',
      'Oil creeping up = market doubting quick breakthrough',
      'Islamabad is binary event — breakthrough or collapse',
      'Scenario: Quick 20% / Protracted 58% / Full 22%',
    ],
  },
  43: {
    day: 43,
    date: 'April 11, 2026',
    title: "21 Hours in Islamabad: The First US-Iran Face-to-Face Since 1979",
    summary: "The Islamabad talks begin — the first direct US-Iran face-to-face meeting since the 1979 Islamic Revolution. The highest-level diplomatic encounter in 47 years. Both direct negotiations between principals and indirect shuttle diplomacy through Pakistani intermediaries. The talks run for 21 consecutive hours.\n\nWhile diplomats negotiate in Islamabad, two US Navy destroyers transit the Strait of Hormuz — the first American warships to pass through since the war began. Several other ships (mostly Chinese-flagged) are moving through the strait. Trump posts that the US is 'clearing out' Hormuz as a 'favor to the world.'\n\nBut the clearest signal of where Israel stands comes from Lebanon: the IDF strikes 200+ Hezbollah targets during the Islamabad talks. Deliberate or not, the message is unmistakable — Israel is prosecuting its Lebanon war regardless of US-Iran negotiations. The fundamental question remains: can a bilateral US-Iran deal address the regional conflict that now involves Israel, Hezbollah, Houthis, and Iraqi militias?\n\nAs Day 43 ends, the talks are ongoing. No breakthrough, no collapse. The world watches and waits.",
    thesisScorecard: [
      {
        thesis: 'Direct talks are possible after 47 years',
        initialConfidence: 50,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          '21 hours of direct negotiation occurred',
          'Both direct and indirect channels used',
          'Principals met face-to-face',
          'Historic barrier broken — precedent set',
        ],
      },
      {
        thesis: 'Israel operating independently',
        initialConfidence: 60,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          '200+ Hezbollah targets struck during talks',
          'Lebanon campaign continues regardless of diplomacy',
          'Netanyahu calculating own timeline',
          'US-Iran deal may not bind Israel',
        ],
      },
      {
        thesis: 'Hormuz remains disputed',
        initialConfidence: 70,
        currentConfidence: 80,
        status: 'developing',
        evidence: [
          'US destroyers transited — show of force',
          'Some ships passing but fraction of normal',
          "Trump: 'clearing out' Hormuz — rhetoric vs reality",
          'Full reopening still not happening',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[32], // Day 43
    keyDevelopments: [
      {
        category: 'The Talks',
        items: [
          'ISLAMABAD TALKS BEGIN — first direct US-Iran face-to-face since 1979',
          'Highest-level meeting in 47 years',
          'Both direct and indirect negotiations',
          'Talks run 21 consecutive hours',
          'No breakthrough, no collapse as day ends',
        ],
      },
      {
        category: 'Hormuz',
        items: [
          'Two US Navy destroyers transit Hormuz — first since war began',
          'Several ships (mostly Chinese) passing through',
          "Trump: US 'clearing out' Hormuz as 'favor to the world'",
          'Still fraction of normal traffic — blockade not lifted',
        ],
      },
      {
        category: 'Israel/Lebanon',
        items: [
          'Israel strikes 200+ Hezbollah targets DURING talks',
          'Lebanon campaign continues regardless of diplomacy',
          'Signal: Israel priorities separate from US-Iran negotiation',
          'Multilateral conflict vs bilateral talks',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil at $94 — cautious, watching Islamabad',
          'Markets unable to price binary outcome',
          'VIX at 23 — elevated uncertainty',
          'Global attention on talks',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 94.00,
      vlccRate: 450000,
      hySpread: 550,
      vix: 23.00,
      usGas: 3.96,
    },
    tradingImplications: [
      '21 hours of talks = genuine engagement, not theater',
      'US destroyers through Hormuz = force demonstration',
      '200 Hezbollah targets = Israel operating own timeline',
      'Nuclear will be the wall — it always is',
      'Islamabad is binary: breakthrough = oil sub-85, collapse = oil above 100',
      'Scenario: Quick 18% / Protracted 60% / Full 22%',
    ],
  },
  44: {
    day: 44,
    date: 'April 12, 2026',
    title: "No Deal: Islamabad Collapses, US Threatens Naval Blockade",
    summary: "TALKS COLLAPSE. After 21 hours of negotiation, the first direct US-Iran talks in 47 years end without a deal. Vice President Vance emerges to announce: 'They have chosen not to accept our terms.' The main sticking point: NUCLEAR. Iran will not commit to zero enrichment. Trump confirms: 'most points agreed but NUCLEAR was not.' Parliament Speaker Ghalibaf responds: 'The US must decide whether they can earn our trust.'\n\nWithin hours of the collapse, the US military announces it will implement a naval blockade of Iranian ports. This is a NEW escalation — beyond anything in the pre-ceasefire conflict. Before the ceasefire, Iran was blockading Hormuz. Now the US threatens to blockade Iran's ports. Both sides are weaponizing maritime access. Your Part I thesis about Hormuz as the fulcrum security is now bilateral.\n\nThe ceasefire technically holds through approximately April 22, but there is no framework for extension. Without a deal, the ceasefire will expire and the conflict will resume — now with the added dimension of a US naval blockade. Both sides are blaming each other. Pakistan says it will continue mediating. Lebanon/Israel ambassadors will meet in DC Tuesday.\n\nThe Islamabad collapse is the most important development for the thesis since the ceasefire began. It proves that even face-to-face talks at the highest level cannot bridge the gap between US demands (zero enrichment, full Hormuz reopening) and Iran's demands (enrichment rights, Hormuz sovereignty, sanctions relief, reparations, Lebanon ceasefire). This is TEXTBOOK Protracted Attrition — the scenario your field notes have called as base case since Day 24.",
    thesisScorecard: [
      {
        thesis: 'Nuclear is the unbridgeable issue',
        initialConfidence: 70,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          "Iran won't commit to zero enrichment",
          "Trump: 'most points agreed but NUCLEAR was not'",
          'Same issue that killed JCPOA',
          '47 years of history, same wall',
        ],
      },
      {
        thesis: 'Protracted Attrition is base case',
        initialConfidence: 55,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Highest-level talks failed',
          'No resolution path visible',
          'Ceasefire clock ticking (April 22)',
          'Positions too far apart for compromise',
        ],
      },
      {
        thesis: 'Maritime leverage now bilateral',
        initialConfidence: 60,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Iran blockaded Hormuz pre-ceasefire',
          'US now threatens to blockade Iranian ports',
          'Both sides weaponizing maritime access',
          'Part I Hormuz thesis validated at new level',
        ],
      },
      {
        thesis: 'Escalation follows failed diplomacy',
        initialConfidence: 50,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'US announces naval blockade within hours',
          'New escalation beyond pre-ceasefire posture',
          'Pattern: diplomacy fails, force follows',
          'No off-ramp in sight',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[33], // Day 44
    keyDevelopments: [
      {
        category: 'Talks Collapse',
        items: [
          'TALKS COLLAPSE — no deal after 21 hours',
          "Vance: 'They have chosen not to accept our terms'",
          "Main sticking point: NUCLEAR — Iran won't commit to zero enrichment",
          "Trump: 'most points agreed but NUCLEAR was not'",
          "Ghalibaf: 'US must decide whether they can earn our trust'",
        ],
      },
      {
        category: 'Immediate Escalation',
        items: [
          'US military announces it will BLOCKADE IRANIAN PORTS',
          'Naval blockade is NEW — beyond anything pre-ceasefire',
          'Pre-ceasefire: Iran blockaded Hormuz',
          'Post-talks: US blockades Iranian ports',
          'Maritime leverage now bilateral — Part I thesis validated',
        ],
      },
      {
        category: 'Ceasefire Status',
        items: [
          'Ceasefire technically holds through ~April 22',
          'No framework for extension',
          'Without deal, conflict resumes in 10 days',
          'Both sides blaming each other',
          'Pakistan says will continue mediating',
          'Lebanon/Israel ambassadors to meet DC Tuesday',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil surging back toward $100 on collapse',
          'Markets pricing return to conflict',
          'VIX jumping on escalation',
          'Naval blockade threat adding new risk premium',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 98.00,
      vlccRate: 480000,
      hySpread: 580,
      vix: 26.00,
      usGas: 4.00,
    },
    tradingImplications: [
      'Talks collapse = Protracted Attrition confirmed as base case',
      'Nuclear is the wall — 47 years of history repeating',
      'Naval blockade = new escalation dimension beyond pre-ceasefire',
      'Maritime leverage now bilateral — both sides using chokepoints',
      'Ceasefire expires ~April 22 — clock ticking',
      'Oil heading back to $100+ as conflict resumption priced',
      'Scenario: Quick 10% / Protracted 60% / Full 30%',
    ],
  },
  45: {
    day: 45,
    date: 'April 13, 2026',
    title: "The Noose Tightens: US Naval Blockade Begins, Iran's Clock Starts",
    summary: "The threat becomes reality. Within 24 hours of the Islamabad collapse, US naval forces begin enforcing a full blockade of Iranian ports. 13 tankers intercepted on Day 1. CENTCOM provides crucial clarification: the blockade applies only to ships traveling to/from Iranian ports, not to all Hormuz traffic. This is a targeted stranglehold on Iran's economy, not a general closure of the strait.\n\nIran has approximately 13 days of oil storage capacity before backed-up production begins damaging its fields. The economic clock is now ticking. Defense Secretary Hegseth's message is unmistakable: 'locked and loaded.' The ceasefire technically holds — no missiles are flying — but both sides are waging economic warfare at sea. This is the Part I thesis made kinetic: maritime access as the ultimate leverage point.",
    thesisScorecard: [
      {
        thesis: 'Maritime access is the ultimate leverage',
        initialConfidence: 75,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          'US implements full blockade of Iranian ports',
          '13 tankers intercepted Day 1',
          'Iran has 13 days before field damage',
          'Economic warfare through maritime control',
        ],
      },
      {
        thesis: 'Escalation follows failed diplomacy',
        initialConfidence: 50,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Blockade implemented within 24 hours of collapse',
          'No diplomatic pause — straight to pressure',
          'Pattern now established',
          'Talks fail → immediate kinetic response',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[34],
    keyDevelopments: [
      {
        category: 'Naval Blockade',
        items: [
          'US NAVAL BLOCKADE OF IRANIAN PORTS BEGINS',
          '13 tankers intercepted on Day 1',
          'CENTCOM: applies only to ships to/from Iranian ports',
          'Not a general closure of Hormuz',
          "Hegseth: 'locked and loaded'",
        ],
      },
      {
        category: 'Economic Pressure',
        items: [
          'Iran has ~13 days of oil storage',
          'After 13 days: field damage begins',
          'Economic clock now ticking',
          'Targeted stranglehold on Iran economy',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil surges to $102.50 on blockade news',
          'Markets pricing sustained pressure',
          'Tanker rates spiking again',
          'Uncertainty premium building',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 102.50,
      vlccRate: 520000,
      hySpread: 420,
      vix: 28.00,
      usGas: 4.05,
    },
    tradingImplications: [
      'Blockade = Part I maritime thesis made kinetic',
      '13-day storage clock = economic pressure timeline',
      'CENTCOM clarification: Hormuz NOT closed, Iran ports blocked',
      'Ceasefire holds but economic warfare intensifies',
      'Oil likely stays above $100 throughout blockade',
      'Scenario: Quick 8% / Protracted 55% / Full 37%',
    ],
  },
  46: {
    day: 46,
    date: 'April 14, 2026',
    title: "Blockade Day 2: The Cordon Holds, Pressure Mounts",
    summary: "The blockade is holding. 14 vessels turned back in 72 hours of enforcement. US Navy operating in force around all Iranian ports — Bandar Abbas, Kharg Island, Bushehr. Iran's storage clock continues: 12 days remaining before field damage begins. The physics of oil production are unforgiving — when you can't export, storage fills, and eventually you must shut in wells or risk permanent damage.\n\nNo diplomatic initiatives underway. Both sides appear committed to seeing who blinks first. The economic attrition thesis is now playing out in real time — not through missile exchanges but through maritime interdiction. This is cleaner than bombing, more sustainable than occupation, and potentially more effective than either. The restructuring analog: the secured creditor has seized the debtor's cash flow.",
    thesisScorecard: [
      {
        thesis: 'Economic attrition as primary weapon',
        initialConfidence: 70,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          '14 vessels turned back in 72 hours',
          'All Iranian ports under blockade',
          'Storage clock: 12 days remaining',
          'Cleaner than kinetic options',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[35],
    keyDevelopments: [
      {
        category: 'Blockade Operations',
        items: [
          '14 vessels turned back in 72 hours',
          'US Navy operating around all Iranian ports',
          'Bandar Abbas, Kharg Island, Bushehr under watch',
          'Cordon holding without incident',
        ],
      },
      {
        category: 'Economic Clock',
        items: [
          'Iran storage: 12 days until field damage',
          'Oil production physics unforgiving',
          "Can't export → storage fills → shut-in wells",
          'Permanent field damage risk after storage full',
        ],
      },
      {
        category: 'Diplomatic Status',
        items: [
          'No diplomatic initiatives underway',
          'Both sides committed to waiting',
          'Who blinks first?',
          'Economic attrition in real time',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 105.30,
      vlccRate: 540000,
      hySpread: 460,
      vix: 29.00,
      usGas: 4.10,
    },
    tradingImplications: [
      'Blockade cordon holding — no leaks Day 2',
      '12-day countdown until field damage',
      'Economic attrition cleaner than bombing',
      'Restructuring analog: creditor seized cash flow',
      'Oil staying above $100 as blockade sustains',
      'Scenario: Quick 8% / Protracted 52% / Full 40%',
    ],
  },
  47: {
    day: 47,
    date: 'April 15, 2026',
    title: "Blockade Day 3: The Pressure Cooker, Full Escalation Rising",
    summary: "The blockade enters its third day. Iran has 11 days of storage remaining before oil fields face permanent damage. Both sides are signaling willingness to talk — but there is no framework for resuming negotiations. The Islamabad channel collapsed; Pakistan is trying to rebuild but no date set. The gap between 'willing to talk' and 'actually talking' remains unbridged.\n\nFull Escalation probability reaches its highest level of the conflict: 43%. The logic is straightforward — the blockade is an act of war, Iran is being economically strangled, and the options for breaking the cordon are all kinetic. The longer this continues without diplomatic breakthrough, the higher the probability that Iran attempts to break the blockade by force. The restructuring analog: the debtor is running out of liquidity, and desperate debtors do desperate things.",
    thesisScorecard: [
      {
        thesis: 'Blockade creates escalation pressure',
        initialConfidence: 65,
        currentConfidence: 88,
        status: 'developing',
        evidence: [
          'Full Escalation at 43% — new high',
          'Iran running out of storage',
          'Kinetic options only way to break cordon',
          'Desperate debtors do desperate things',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[36],
    keyDevelopments: [
      {
        category: 'Blockade Status',
        items: [
          'Blockade Day 3 — pressure mounting',
          'Iran storage: 11 days until field damage',
          'Cordon holding firm',
          'No vessels breaching',
        ],
      },
      {
        category: 'Diplomatic Limbo',
        items: [
          'Both sides signaling willingness to talk',
          'No framework for resuming negotiations',
          'Islamabad channel collapsed',
          'Pakistan trying to rebuild — no date set',
        ],
      },
      {
        category: 'Escalation Risk',
        items: [
          'Full Escalation probability at 43% — new high',
          'Blockade is act of war',
          'Iran being economically strangled',
          'Breaking cordon requires kinetic action',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 107.20,
      vlccRate: 560000,
      hySpread: 475,
      vix: 31.00,
      usGas: 4.15,
    },
    tradingImplications: [
      'Full Escalation at 43% — highest of conflict',
      '11 days until field damage — clock ticking loud',
      'Gap between willing-to-talk and actually-talking',
      'Desperate debtors do desperate things',
      'Oil rising on sustained blockade pressure',
      'Scenario: Quick 7% / Protracted 50% / Full 43%',
    ],
  },
  48: {
    day: 48,
    date: 'April 16, 2026',
    title: "The Lebanon Pivot: Truce Opens Hormuz — Conditionally",
    summary: "A breakthrough — of sorts. Trump announces a 10-day Israel-Lebanon ceasefire, the first cessation of hostilities in that theater since Hezbollah entered the war on Day 2. Within hours, Iran announces it will reopen Hormuz for commercial traffic during the truce period. Markets surge on the news. Oil drops from $107 to below $100. Quick Resolution probability jumps to 18% — its highest in weeks.\n\nBut the complexity is immediate. Trump clarifies: the US blockade on Iranian ports REMAINS in place. So Hormuz is open, but Iran cannot export. Ships can transit the strait, but Iranian oil cannot reach them. The split reality crystallizes: Iran has reopened its leverage point, but the US has maintained its chokehold. This is a partial de-escalation, not a resolution. The restructuring analog: debtor offers collateral release, but creditor maintains the DIP facility freeze.",
    thesisScorecard: [
      {
        thesis: 'Partial de-escalation possible',
        initialConfidence: 30,
        currentConfidence: 55,
        status: 'developing',
        evidence: [
          '10-day Israel-Lebanon ceasefire',
          'Iran reopens Hormuz for commercial traffic',
          'First real de-escalation since war began',
          'Markets respond positively',
        ],
      },
      {
        thesis: 'Dual blockade persists',
        initialConfidence: 60,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          'Hormuz open BUT US blockade remains',
          'Ships can transit but Iran cannot export',
          'Split reality crystallizes',
          'Partial not complete de-escalation',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[37],
    keyDevelopments: [
      {
        category: 'Lebanon Ceasefire',
        items: [
          'Trump announces 10-day Israel-Lebanon ceasefire',
          'First cessation in that theater since Day 2',
          'Hezbollah silence — watching',
          'Major diplomatic achievement',
        ],
      },
      {
        category: 'Hormuz Opening',
        items: [
          'Iran announces Hormuz OPEN for commercial traffic',
          'Conditional: during truce period only',
          'Markets surge, oil drops toward $100',
          'Quick Resolution probability jumps to 18%',
        ],
      },
      {
        category: 'The Catch',
        items: [
          'BUT: Trump clarifies US blockade REMAINS',
          'Hormuz open but Iran cannot export',
          'Ships can transit, Iranian oil cannot reach them',
          'Split reality: partial de-escalation only',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 99.80,
      vlccRate: 480000,
      hySpread: 450,
      vix: 26.00,
      usGas: 4.00,
    },
    tradingImplications: [
      'Lebanon ceasefire = real diplomatic progress',
      'Hormuz opening = Iran signaling flexibility',
      'BUT US blockade remains = Iran still strangled',
      'This is partial de-escalation, not resolution',
      'Oil drops but likely to rebound on complexity',
      'Scenario: Quick 18% / Protracted 55% / Full 27%',
    ],
  },
  49: {
    day: 49,
    date: 'April 17, 2026',
    title: "The Crash: Lebanon Ceasefire Takes Effect, Oil Plunges",
    summary: "The Lebanon ceasefire takes effect at 5pm ET. Iran confirms Hormuz passage is permitted for commercial vessels. The market response is immediate and dramatic: oil CRASHES from $99 to $90 — the largest single-day drop since the original ceasefire on Day 39. Markets are pricing in a de-escalation trajectory. Quick Resolution probability hits 22% — the highest since the war began.\n\nBut the fine print matters. The US blockade on Iranian ports remains in force. Ships can transit Hormuz, but they cannot reach Iranian terminals. Iran's oil is still trapped. The optimism may be premature. This is the same split reality as yesterday, but markets are choosing to see the glass half full. The restructuring analog: the judge approved the disclosure statement, but the plan hasn't confirmed. Celebrate cautiously.",
    thesisScorecard: [
      {
        thesis: 'Markets pricing de-escalation prematurely',
        initialConfidence: 50,
        currentConfidence: 75,
        status: 'developing',
        evidence: [
          'Oil crashes from $99 to $90',
          'Biggest drop since Day 39 ceasefire',
          'Quick Resolution at war-high 22%',
          'BUT US blockade still in place',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[38],
    keyDevelopments: [
      {
        category: 'Ceasefire Implementation',
        items: [
          'Lebanon ceasefire takes effect 5pm ET',
          'Iran confirms Hormuz passage permitted',
          'Commercial vessels cleared to transit',
          'First quiet night in Lebanon in weeks',
        ],
      },
      {
        category: 'Market Response',
        items: [
          'Oil CRASHES from $99 to $90',
          'Largest single-day drop since Day 39',
          'Markets pricing de-escalation',
          'VIX falling on reduced uncertainty',
        ],
      },
      {
        category: 'The Caveat',
        items: [
          'US blockade on Iranian ports REMAINS',
          'Hormuz open but Iran cannot export',
          'Split reality continues',
          'Optimism may be premature',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 90.50,
      vlccRate: 420000,
      hySpread: 410,
      vix: 22.00,
      usGas: 3.85,
    },
    tradingImplications: [
      'Oil crash = markets pricing de-escalation',
      'BUT US blockade means Iran still strangled',
      'Premature optimism likely — watch for reversal',
      'Lebanon quiet but Hezbollah watching',
      'Quick Resolution at 22% — war high',
      'Scenario: Quick 22% / Protracted 55% / Full 23%',
    ],
  },
  50: {
    day: 50,
    date: 'April 18, 2026',
    title: "The Reversal: Iran Slams Hormuz Shut, IRGC Attacks Tanker",
    summary: "COMPLETE REVERSAL. Iran reinstates Hormuz control, reversing yesterday's reopening decision. The condition: US must lift its blockade first. Within hours, IRGC gunboats attack a tanker near the strait — the first kinetic action against shipping since the ceasefire began. In Lebanon, a French UN peacekeeper is killed — the ceasefire is already fraying.\n\nQuick Resolution crashes from 22% to 10% in a single day. The 24-hour Hormuz 'opening' was a tactical move, not a strategic shift — Iran testing whether the gesture would prompt US reciprocity. It didn't. Now we're back to mutual blockade. The pattern is unmistakable: hope → reversal → escalation. Oil jumps from $90 to $98. Markets learning the lesson: don't trust the first signal.",
    thesisScorecard: [
      {
        thesis: 'Hope → Reversal → Escalation pattern',
        initialConfidence: 60,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Iran reopened Hormuz yesterday',
          'Iran reverses and closes today',
          'IRGC attacks tanker — kinetic escalation',
          'Pattern now established and repeating',
        ],
      },
      {
        thesis: 'Ceasefires are fragile',
        initialConfidence: 70,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'French UN peacekeeper killed in Lebanon',
          'Hormuz closed again',
          'Both theaters deteriorating',
          'Diplomatic gains evaporate quickly',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[39],
    keyDevelopments: [
      {
        category: 'Hormuz Reversal',
        items: [
          'Iran REINSTATES Hormuz control',
          'Condition: US must lift blockade first',
          'Yesterday opening was tactical test',
          'US did not reciprocate — Iran closes again',
        ],
      },
      {
        category: 'Kinetic Escalation',
        items: [
          'IRGC gunboats attack tanker near strait',
          'First kinetic action since ceasefire',
          'French UN peacekeeper killed in Lebanon',
          'Both theaters deteriorating',
        ],
      },
      {
        category: 'Market Whiplash',
        items: [
          'Oil jumps from $90 to $98',
          'Quick Resolution crashes 22% → 10%',
          'Markets learning: don\'t trust first signal',
          'Pattern: hope → reversal → escalation',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 98.70,
      vlccRate: 500000,
      hySpread: 485,
      vix: 28.00,
      usGas: 4.00,
    },
    tradingImplications: [
      '24-hour opening was tactical, not strategic',
      'Pattern established: hope → reversal → escalation',
      'IRGC kinetic action = ceasefire meaningless at sea',
      'Lebanon fraying — French peacekeeper killed',
      'Oil back toward $100 — yesterday crash reversed',
      'Scenario: Quick 10% / Protracted 52% / Full 38%',
    ],
  },
  51: {
    day: 51,
    date: 'April 19, 2026',
    title: "Full Closure: Iran Locks Down Hormuz, Both Sides Shooting",
    summary: "FULL ESCALATION MODE. Iran fully closes Hormuz, fires on ships attempting unauthorized transit. US Navy seizes an Iranian-flagged vessel. 35 vessel reversals in 24 hours. The IRGC announces: any unauthorized transit 'will be targeted.' Both sides are now actively shooting at shipping. This is no longer a standoff — it's a kinetic maritime conflict.\n\nFull Escalation probability hits 45%, nearly equal to Protracted Attrition at 48%. We are one incident away from scenario parity. The restructuring analog has broken down: this isn't creditor-debtor negotiation anymore, it's two parties destroying the enterprise value rather than let the other side have it. The strait is now a shooting gallery.",
    thesisScorecard: [
      {
        thesis: 'Kinetic maritime conflict',
        initialConfidence: 40,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          'Iran fires on ships attempting transit',
          'US Navy seizes Iranian vessel',
          '35 vessel reversals in 24 hours',
          'Both sides actively shooting',
        ],
      },
      {
        thesis: 'Full Escalation approaching parity',
        initialConfidence: 30,
        currentConfidence: 80,
        status: 'developing',
        evidence: [
          'Full Escalation at 45%',
          'Protracted at 48% — near parity',
          'One incident from scenario flip',
          'Enterprise value destruction mode',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[40],
    keyDevelopments: [
      {
        category: 'Hormuz Full Closure',
        items: [
          'Iran FULLY CLOSES Hormuz',
          'Fires on ships attempting transit',
          "IRGC: unauthorized transit 'will be targeted'",
          'No commercial passage',
        ],
      },
      {
        category: 'US Response',
        items: [
          'US Navy seizes Iranian-flagged vessel',
          '35 vessel reversals in 24 hours',
          'Both sides actively shooting at shipping',
          'Kinetic maritime conflict underway',
        ],
      },
      {
        category: 'Scenario Shift',
        items: [
          'Full Escalation at 45%',
          'Protracted at 48% — near parity',
          'One incident from scenario flip',
          'Enterprise value destruction mode',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 108.40,
      vlccRate: 600000,
      hySpread: 520,
      vix: 34.00,
      usGas: 4.25,
    },
    tradingImplications: [
      'Kinetic maritime conflict = new phase',
      'Both sides shooting at shipping',
      'Full Escalation at 45% — near Protracted parity',
      'One incident could flip scenario probabilities',
      'Oil surging toward $110 on full closure',
      'Scenario: Quick 7% / Protracted 48% / Full 45%',
    ],
  },
  52: {
    day: 52,
    date: 'April 20, 2026',
    title: "Stalemate at Sea: Iran Declines Talks, Trump Sends Delegation Anyway",
    summary: "The standoff hardens. Dozens of tankers stranded as dual blockade continues. Iran formally declines a Monday talks proposal. Trump announces US delegation will travel to Islamabad anyway — unclear if Iran will show. The diplomatic channel exists on paper but Iran is not engaging. The blockade-counterblockade dynamic is now the defining feature of this conflict phase.\n\nOil continues rising on sustained closure — Brent approaching $113. The market has priced in that this will not resolve quickly. Both sides appear committed to waiting out the other. The restructuring analog: both parties have rejected the mediator's term sheet, but neither has a better alternative. The case will drag.",
    thesisScorecard: [
      {
        thesis: 'Dual blockade is stable equilibrium',
        initialConfidence: 55,
        currentConfidence: 82,
        status: 'confirmed',
        evidence: [
          'Dozens of tankers stranded',
          'Neither side backing down',
          'Iran declines talks',
          'Defining dynamic of this phase',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[41],
    keyDevelopments: [
      {
        category: 'Diplomatic Status',
        items: [
          'Iran declines Monday talks proposal',
          'Trump: US delegation will go to Islamabad anyway',
          'Unclear if Iran will engage',
          'Channel exists but unused',
        ],
      },
      {
        category: 'Maritime Situation',
        items: [
          'Dozens of tankers stranded',
          'Dual blockade continues',
          'No commercial transit',
          'Both sides holding positions',
        ],
      },
      {
        category: 'Markets',
        items: [
          'Oil rising toward $113',
          'Market pricing sustained closure',
          'No quick resolution expected',
          'Volatility elevated but stable',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 112.80,
      vlccRate: 620000,
      hySpread: 530,
      vix: 32.00,
      usGas: 4.30,
    },
    tradingImplications: [
      'Dual blockade now defining dynamic',
      'Iran not engaging diplomatically',
      'Market pricing sustained closure',
      'Neither side has better alternative',
      'Oil likely stays elevated through standoff',
      'Scenario: Quick 6% / Protracted 50% / Full 44%',
    ],
  },
  53: {
    day: 53,
    date: 'April 21, 2026',
    title: "The Indefinite Extension: Trump Freezes Clock, Maintains Pressure",
    summary: "Strategic ambiguity as policy. Trump extends the Iran ceasefire INDEFINITELY — 'until their leaders can come up with a unified proposal.' The naval blockade remains in place. No deadline, no pressure point, no off-ramp. The message: we can wait forever, can you?\n\nIran responds in kind: will not negotiate 'under the shadow of threats.' Prepared 'new cards on the battlefield.' The IRGC captures two vessels 'for disrupting order in Hormuz.' The indefinite extension is simultaneously an olive branch (no deadline for Iran) and a threat (no relief until Iran capitulates). This is classic restructuring dynamics: the DIP lender extending maturity while maintaining all covenants.",
    thesisScorecard: [
      {
        thesis: 'Indefinite standoff strategy',
        initialConfidence: 60,
        currentConfidence: 88,
        status: 'confirmed',
        evidence: [
          'Trump extends ceasefire indefinitely',
          'No deadline, no pressure point',
          'Blockade maintained throughout',
          'Classic restructuring: extend but maintain covenants',
        ],
      },
      {
        thesis: 'Iran has counter-cards',
        initialConfidence: 65,
        currentConfidence: 80,
        status: 'developing',
        evidence: [
          "'New cards on the battlefield' prepared",
          'IRGC captures two vessels',
          'Iran signaling capability to escalate',
          'Not capitulating to pressure',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[42],
    keyDevelopments: [
      {
        category: 'Ceasefire Extension',
        items: [
          'Trump extends Iran ceasefire INDEFINITELY',
          "'Until their leaders can come up with a unified proposal'",
          'Naval blockade REMAINS',
          'No deadline, no off-ramp',
        ],
      },
      {
        category: 'Iran Response',
        items: [
          "Will not negotiate 'under shadow of threats'",
          "'New cards on the battlefield' prepared",
          'IRGC captures two vessels',
          "'For disrupting order in Hormuz'",
        ],
      },
      {
        category: 'Strategic Dynamics',
        items: [
          'Olive branch AND threat simultaneously',
          'We can wait forever — can you?',
          'Restructuring analog: extend but maintain covenants',
          'Neither side blinking',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 115.20,
      vlccRate: 640000,
      hySpread: 540,
      vix: 30.00,
      usGas: 4.35,
    },
    tradingImplications: [
      'Indefinite extension = strategic ambiguity',
      'No deadline but no relief for Iran',
      'Iran signaling prepared to escalate',
      'Two vessels captured = Iran holding cards',
      'Oil elevated — $115 becomes new normal',
      'Scenario: Quick 8% / Protracted 55% / Full 37%',
    ],
  },
  54: {
    day: 54,
    date: 'April 22, 2026',
    title: "Triple Carrier Strike: US Shows Maximum Force, Claims Hormuz",
    summary: "MAXIMUM FORCE POSTURE. USS George H.W. Bush arrives in the Middle East, joining two other carriers. Three US aircraft carriers in theater — first time since the 2003 Iraq invasion. The message is unmistakable: the US is prepared for full-scale war if Iran doesn't capitulate.\n\nThen Trump makes an extraordinary claim: HE controls Hormuz now. Says he's keeping it closed so Iran can't 'make $500M a day.' The Guardian calls it a 'dual blockade.' The rhetorical shift is significant: the US is no longer demanding Iran reopen Hormuz — it's claiming ownership of the closure. Iran fires on a container ship without warning. US seizes an Iranian tanker in the Indian Ocean. The maritime conflict is now truly bilateral.",
    thesisScorecard: [
      {
        thesis: 'US claiming Hormuz ownership',
        initialConfidence: 40,
        currentConfidence: 85,
        status: 'confirmed',
        evidence: [
          "Trump: 'I control Hormuz'",
          'Keeping it closed to deny Iran revenue',
          "Guardian: 'dual blockade'",
          'Rhetorical ownership shift',
        ],
      },
      {
        thesis: 'Maximum force posture',
        initialConfidence: 50,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Three carriers in theater',
          'First time since 2003 Iraq invasion',
          'USS George H.W. Bush arrives',
          'Prepared for full-scale war',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[43],
    keyDevelopments: [
      {
        category: 'Force Posture',
        items: [
          'THREE US CARRIERS in Middle East',
          'USS George H.W. Bush arrives',
          'First time since 2003 Iraq invasion',
          'Maximum force message',
        ],
      },
      {
        category: 'Trump Claims Hormuz',
        items: [
          "Trump: 'I control Hormuz'",
          "'Keeping it closed so Iran can\\'t make $500M a day'",
          "Guardian: 'dual blockade'",
          'US now claiming ownership of closure',
        ],
      },
      {
        category: 'Maritime Conflict',
        items: [
          'Iran fires on container ship without warning',
          'US seizes Iranian tanker in Indian Ocean',
          'US officials: Trump gave Iran 3-5 days to engage',
          'Conflict truly bilateral now',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 118.90,
      vlccRate: 680000,
      hySpread: 555,
      vix: 33.00,
      usGas: 4.45,
    },
    tradingImplications: [
      'Three carriers = prepared for full-scale war',
      'Trump claiming Hormuz ownership = rhetorical shift',
      'Dual blockade now official framing',
      'Maritime conflict escalating bilaterally',
      'Oil approaching $120 on force posture',
      'Scenario: Quick 7% / Protracted 53% / Full 40%',
    ],
  },
  55: {
    day: 55,
    date: 'April 23, 2026',
    title: "Mixed Signals: Lebanon Progress, Netanyahu Strikes Anyway",
    summary: "Progress on one front, collapse on another. Trump announces a 3-WEEK extension of the Israel-Lebanon ceasefire after White House talks. Israeli and Lebanese ambassadors meet face-to-face for the first time in decades. Diplomatic breakthrough.\n\nBUT: Netanyahu orders 'forceful' strikes on Hezbollah anyway. Hezbollah fires rockets at northern Israel in response. The Lebanon track is simultaneously advancing and collapsing. Israel is operating on its own timeline, regardless of what Trump announces. Iran says the seized ship was 'collaborating with American military.' US blockade total: 23 ships turned around. The dual blockade continues while the Lebanon situation oscillates between peace and war.",
    thesisScorecard: [
      {
        thesis: 'Israel operates independently',
        initialConfidence: 60,
        currentConfidence: 92,
        status: 'confirmed',
        evidence: [
          "Netanyahu orders 'forceful' strikes during ceasefire",
          'Hezbollah rockets resume',
          'Israel on own timeline',
          'Trump announcements don\'t bind Israel',
        ],
      },
      {
        thesis: 'Lebanon track unstable',
        initialConfidence: 55,
        currentConfidence: 85,
        status: 'developing',
        evidence: [
          '3-week extension announced',
          'Historic ambassador meeting',
          'BUT strikes continue',
          'Advancing AND collapsing simultaneously',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[44],
    keyDevelopments: [
      {
        category: 'Lebanon Diplomacy',
        items: [
          '3-WEEK Israel-Lebanon ceasefire extension',
          'Israeli + Lebanese ambassadors meet in DC',
          'First direct talks in decades',
          'Major diplomatic achievement',
        ],
      },
      {
        category: 'Lebanon Reality',
        items: [
          "Netanyahu orders 'forceful' strikes on Hezbollah",
          'Hezbollah fires rockets at northern Israel',
          'Ceasefire exists on paper only',
          'Israel operating own timeline',
        ],
      },
      {
        category: 'Maritime Update',
        items: [
          "Iran: seized ship 'collaborating with US military'",
          'US blockade total: 23 ships turned around',
          'Dual blockade continues',
          'No relief in sight',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 116.50,
      vlccRate: 660000,
      hySpread: 530,
      vix: 29.00,
      usGas: 4.40,
    },
    tradingImplications: [
      'Lebanon ceasefire extension = diplomatic win',
      'BUT Netanyahu strikes anyway = Israel independent',
      'Paper ceasefire vs kinetic reality',
      '23 ships turned around — blockade effective',
      'Oil slightly down on mixed signals',
      'Scenario: Quick 10% / Protracted 58% / Full 32%',
    ],
  },
  56: {
    day: 56,
    date: 'April 24, 2026',
    title: "Shoot to Kill: Trump Authorizes Lethal Force on Iranian Boats",
    summary: "The most explicit escalation authority yet. Trump orders the US military to 'SHOOT AND KILL' any Iranian boats laying mines in Hormuz. No warning, no intermediate steps — lethal force authorized. The rules of engagement have fundamentally changed.\n\nIran responds in kind: attacks 3 commercial ships, seizes 2. Says the blockade is the 'main obstacle' to talks. Trump: 'no time pressure.' US dispatches Witkoff and Kushner to Pakistan. CENTCOM reports 31 ships turned around total, but 26 shadow fleet vessels have breached the blockade. The cordon is effective but not airtight. Pope Leo XIV condemns the killing of Iranian protesters — the human cost is mounting.",
    thesisScorecard: [
      {
        thesis: 'Lethal force normalized',
        initialConfidence: 45,
        currentConfidence: 90,
        status: 'confirmed',
        evidence: [
          'Shoot-to-kill order for mine-layers',
          'No warning required',
          'ROE fundamentally changed',
          'Maximum escalation authority',
        ],
      },
      {
        thesis: 'Shadow fleet breaching blockade',
        initialConfidence: 50,
        currentConfidence: 78,
        status: 'developing',
        evidence: [
          '31 ships turned around',
          '26 shadow fleet vessels breached',
          'Cordon effective but not airtight',
          'Leakage occurring',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[45],
    keyDevelopments: [
      {
        category: 'Escalation Authority',
        items: [
          "Trump: 'SHOOT AND KILL' any Iranian boats laying mines",
          'No warning required',
          'Rules of engagement fundamentally changed',
          'Most explicit escalation authority yet',
        ],
      },
      {
        category: 'Iran Response',
        items: [
          'Iran attacks 3 commercial ships',
          'Iran seizes 2 vessels',
          "Blockade is 'main obstacle' to talks",
          'Tit-for-tat escalation',
        ],
      },
      {
        category: 'Blockade Status',
        items: [
          '31 ships turned around total',
          '26 shadow fleet vessels breached blockade',
          'Cordon effective but not airtight',
          'Witkoff/Kushner dispatched to Pakistan',
        ],
      },
      {
        category: 'Human Cost',
        items: [
          'Pope Leo XIV condemns killing of Iranian protesters',
          'International pressure building',
          'Humanitarian concerns mounting',
          "'No time pressure' — Trump",
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 119.80,
      vlccRate: 700000,
      hySpread: 565,
      vix: 35.00,
      usGas: 4.50,
    },
    tradingImplications: [
      'Shoot-to-kill order = maximum escalation authority',
      'ROE change fundamentally alters risk profile',
      '26 shadow fleet breaches = blockade has leaks',
      'Iran seizing ships = mutual escalation',
      'Oil approaching $120 on lethal force authorization',
      'Scenario: Quick 8% / Protracted 55% / Full 37%',
    ],
  },
  57: {
    day: 57,
    date: 'April 25, 2026',
    title: "The Cancellation: Trump Pulls Delegation, Says 'Not Enough'",
    summary: "Diplomatic whiplash. Trump CANCELS the Witkoff/Kushner trip to Pakistan just as it was about to depart. Explanation: Iran 'offered a lot, but not enough.' The channel that was supposed to rebuild after Islamabad's collapse is dead before it began.\n\nMeanwhile, Araghchi is in Islamabad meeting with PM Sharif and Army Chief Munir. Then he departs for Oman and Moscow. Iran is seeking alternative diplomatic channels — the US channel is frozen, so Iran is building others. Israel kills 15+ Hezbollah fighters despite the ceasefire. Strikes kill 6 in southern Lebanon. Pezeshkian tells Iranians to conserve electricity — 'turn on two lights instead of ten.' The domestic pressure on Iran is mounting as the blockade bites.",
    thesisScorecard: [
      {
        thesis: 'US-Iran channel frozen',
        initialConfidence: 60,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Trump cancels Witkoff/Kushner trip',
          "'Offered a lot, but not enough'",
          'Channel dead before it began',
          'No US-Iran diplomacy underway',
        ],
      },
      {
        thesis: 'Iran seeking alternative channels',
        initialConfidence: 50,
        currentConfidence: 82,
        status: 'developing',
        evidence: [
          'Araghchi meets Sharif + Munir in Islamabad',
          'Departs for Oman and Moscow',
          'Building alternative pathways',
          'US not only option',
        ],
      },
      {
        thesis: 'Domestic pressure mounting',
        initialConfidence: 70,
        currentConfidence: 88,
        status: 'confirmed',
        evidence: [
          "'Turn on two lights instead of ten'",
          'Pezeshkian conservation plea',
          'Blockade biting domestically',
          'Economic pressure visible',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[46],
    keyDevelopments: [
      {
        category: 'Diplomatic Collapse',
        items: [
          'Trump CANCELS Witkoff/Kushner trip to Pakistan',
          "'Iran offered a lot, but not enough'",
          'Channel dead before it began',
          'No US-Iran diplomacy underway',
        ],
      },
      {
        category: 'Iran Alternative Channels',
        items: [
          'Araghchi in Islamabad with PM Sharif + Army Chief Munir',
          'Departs for Oman next',
          'Then heading to Moscow',
          'Building alternative diplomatic pathways',
        ],
      },
      {
        category: 'Lebanon Violence',
        items: [
          'Israel kills 15+ Hezbollah fighters despite ceasefire',
          'Israeli strikes kill 6 in southern Lebanon',
          'Ceasefire exists on paper only',
          'Violence continuing daily',
        ],
      },
      {
        category: 'Iran Domestic',
        items: [
          "Pezeshkian: 'turn on two lights instead of ten'",
          'Conservation plea to public',
          'Blockade biting domestically',
          'Economic pressure visible to population',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 122.40,
      vlccRate: 720000,
      hySpread: 575,
      vix: 36.00,
      usGas: 4.55,
    },
    tradingImplications: [
      'Diplomatic channel frozen = no near-term resolution',
      'Araghchi to Oman + Moscow = Iran building alternatives',
      'Pezeshkian conservation plea = blockade pressure visible',
      'Lebanon violence continuing despite ceasefire',
      'Oil surging toward $125 as diplomacy fails',
      'Scenario: Quick 6% / Protracted 55% / Full 39%',
    ],
  },
  58: {
    day: 58,
    date: 'April 26, 2026',
    title: "The Hormuz Doctrine: Iran Declares Permanent Sovereignty",
    summary: "THE HORMUZ DOCTRINE. Iran's Deputy Speaker Nikzad makes the most consequential statement of the war: 'We will under no circumstances return Hormuz to its previous state — this is an order from the Leader of the Revolution.' The permanent sovereignty thesis is now CODIFIED at leadership level. This isn't negotiating posture — it's declared policy from the Supreme Leader.\n\nThe implications cascade: even if the US-Iran conflict ends, even if a deal is reached, Hormuz does not return to pre-war status. Iran intends to maintain toll collection, transit approval, or some form of control permanently. This transforms the conflict from temporary disruption to structural change. The Part I thesis about Hormuz as permanent leverage is now Iranian state policy. Meanwhile: Araghchi returns to Islamabad from Oman, heading to Moscow. Israel secretly deployed Iron Dome to UAE (Axios). Iran's internet blackout enters Week 9 — longest nation-scale shutdown on record.",
    thesisScorecard: [
      {
        thesis: 'Hormuz permanent sovereignty',
        initialConfidence: 70,
        currentConfidence: 98,
        status: 'confirmed',
        evidence: [
          "'Under no circumstances return to previous state'",
          "'Order from the Leader of the Revolution'",
          'Codified at leadership level',
          'Not negotiating posture — declared policy',
        ],
      },
      {
        thesis: 'Structural change not temporary disruption',
        initialConfidence: 65,
        currentConfidence: 95,
        status: 'confirmed',
        evidence: [
          'Even if deal reached, Hormuz stays changed',
          'Permanent toll/approval regime intended',
          'Part I thesis is now Iranian policy',
          'Conflict outcome: structural reshaping',
        ],
      },
      {
        thesis: 'Iran building coalition',
        initialConfidence: 55,
        currentConfidence: 80,
        status: 'developing',
        evidence: [
          'Araghchi Islamabad → Oman → Moscow tour',
          'Alternative channels being built',
          'Pakistan racing to save negotiations',
          'Russia involvement increasing',
        ],
      },
    ],
    scenarioUpdate: scenarioUpdates[47],
    keyDevelopments: [
      {
        category: 'The Hormuz Doctrine',
        items: [
          "Nikzad: 'Under no circumstances return Hormuz to previous state'",
          "'This is an order from the Leader of the Revolution'",
          'Permanent sovereignty now CODIFIED',
          'Not negotiating posture — declared policy',
          'Even if deal reached, Hormuz stays changed',
        ],
      },
      {
        category: 'Diplomacy',
        items: [
          'Araghchi returns to Islamabad from Oman',
          'Heading to Moscow next',
          'Pakistan racing to save negotiations',
          'Alternative channels active',
        ],
      },
      {
        category: 'Regional Developments',
        items: [
          'Israel secretly deployed Iron Dome to UAE (Axios)',
          "Hezbollah: ceasefire 'has no meaning'",
          'Lebanon violence continuing',
          'GCC quietly arming up',
        ],
      },
      {
        category: 'Iran Domestic',
        items: [
          'Internet blackout: Week 9',
          'Longest nation-scale shutdown on record (NetBlocks)',
          'Information control total',
          'Domestic situation opaque',
        ],
      },
    ],
    marketSnapshot: {
      brentCrude: 124.60,
      vlccRate: 750000,
      hySpread: 590,
      vix: 37.00,
      usGas: 4.60,
    },
    tradingImplications: [
      'HORMUZ DOCTRINE = permanent structural change',
      "'Order from Supreme Leader' = not negotiable",
      'Even post-war Hormuz stays transformed',
      'Part I thesis is now Iranian state policy',
      'Oil approaching $125 on permanent closure risk',
      'Scenario: Quick 5% / Protracted 55% / Full 40%',
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the latest entry from any time series
 */
export function getLatest<T extends TimeSeriesEntry>(series: T[]): T {
  return series.reduce((latest, entry) =>
    entry.timestamp > latest.timestamp ? entry : latest
  );
}

/**
 * Get the most recent scenario probabilities
 */
export function getLatestScenario(): ScenarioUpdate {
  return scenarioUpdates.reduce((latest, update) =>
    update.timestamp > latest.timestamp ? update : latest
  );
}

/**
 * Get scenario probability by name from the latest update
 */
export function getScenarioProbability(scenarioName: string): number {
  const latest = getLatestScenario();
  const scenario = latest.probabilities.find(p => p.scenario === scenarioName);
  return scenario?.probability ?? 0;
}

/**
 * Get field note by day number
 */
export function getFieldNote(day: number): FieldNoteDay | undefined {
  return fieldNotes[day];
}

/**
 * Get all available field note days
 */
export function getAvailableFieldNoteDays(): number[] {
  return Object.keys(fieldNotes).map(Number).sort((a, b) => a - b);
}

/**
 * Get market data for a specific date
 */
export function getMarketDataByDate(date: string): MarketEntry | undefined {
  return marketTimeline.find(entry => entry.date === date);
}

/**
 * Calculate percent change between two values
 */
export function percentChange(current: number, previous: number): number {
  return ((current - previous) / previous) * 100;
}

// =============================================================================
// RE-EXPORTS FOR BACKWARD COMPATIBILITY
// =============================================================================

// These maintain compatibility with existing chart imports from iranMemoData
export { costAsymmetry as costAsymmetryData };
export { sectorVulnerability as sectorVulnerabilityData };

export const scenarioData = scenarioUpdates[4].probabilities.map((p, index) => {
  const descriptions = [
    'Trump redefines objectives: "We eliminated Khamenei, destroyed the nuclear program, degraded the military. Mission accomplished." U.S. withdraws within 2-4 weeks.',
    'Iran sustains asymmetric campaign for 4-12 weeks. Strait of Hormuz remains contested. GCC infrastructure damage compounds. Oil exceeds $100/bbl.',
    'Air campaign fails to achieve regime change. Trump commits ground troops. Multi-year occupation in mountainous terrain against 90M-person nation.',
  ];
  const colors = ['#2E7D4F', '#B7791F', '#C8102E'];
  const oilRanges = ['$70-80/bbl', '$90-120/bbl', '$100-150/bbl'];
  const gccDamage = ['$10-50B', '$50-200B', '$200B+'];
  const iranLeverage = ['Moderate (proven capability)', 'Strong (negotiated concessions)', 'Strong (insurgency leverage)'];

  return {
    name: p.scenario,
    probability: p.probability,
    oilPriceRange: oilRanges[index],
    gccDamage: gccDamage[index],
    iranLeverage: iranLeverage[index],
    description: descriptions[index],
    color: colors[index],
    isBaseCase: index === 1,
  };
});

export const creditMarketData = {
  hySpread: {
    current: getLatest(marketTimeline).hySpread ?? 425,
    thirtyYearAverage: 525,
    unit: 'bps',
    note: 'Entered crisis at historic lows - maximum widening potential',
  },
  tenYearYield: {
    value: 4.117,
    unit: '%',
  },
  ismPricesPaid: {
    value: 70.5,
    jump: 11.5,
    note: 'Jumped 11.5 points to 70.5',
  },
  gasPriceJump: 'Biggest single-day jump since Ukraine invasion',
  leveragedLoanDefaultRate: {
    current: 7.5,
    projected: 7.9,
    unit: '%',
  },
};

export const shippingDisruptionData = {
  tankerTransits: hormuzTimeline.map(h => ({
    date: h.date,
    count: h.tankerCount,
    event: h.event,
  })),
  vlccRates: hormuzTimeline.map(h => ({
    date: h.date,
    rate: h.vlccRate,
    event: h.event,
  })),
  events: [
    { date: 'Mar 1', title: 'Insurance Withdrawal Begins', description: 'Major war risk insurers begin withdrawing coverage for Hormuz transits' },
    { date: 'Mar 2', title: 'QatarEnergy Suspends LNG', description: 'All LNG production suspended after drone attack on Ras Laffan facility' },
    { date: 'Mar 2', title: 'Zero Transits Begin', description: 'First day of zero tanker transits through Strait of Hormuz' },
    { date: 'Mar 3', title: "Lloyd's P&I Cancellation", description: "Lloyd's-linked P&I clubs cancelling war risk coverage effective midnight March 5" },
    { date: 'Mar 3', title: 'Trump Naval Escorts', description: 'Trump announces naval escorts for tankers and U.S. political risk insurance guarantees' },
    { date: 'Mar 3', title: 'Iraq Production Collapse', description: 'Iraq output has dropped 70% due to storage saturation from Hormuz closure' },
    { date: 'Mar 5', title: 'P&I Coverage Expires', description: "Lloyd's war risk cancellation takes effect at midnight. 200+ tankers stranded, 60 VLCCs trapped (8% of global fleet)" },
    { date: 'Mar 5', title: 'IMO Stranded Report', description: '20,000 seafarers and 15,000 cruise passengers stranded across the region' },
    { date: 'Mar 6', title: 'Selective Transit Emerges', description: 'China/Iran-linked vessels begin transiting. Western shipping blocked.' },
    { date: 'Mar 7', title: 'GPS Jamming Spreads', description: 'GPS jamming affects 1,650+ ships in Gulf, up 55% from prior week. PRIMA tanker struck by Iranian drone.' },
    { date: 'Mar 7', title: 'Iran Confirms Two-Tier Hormuz', description: 'Iran confirms Strait closed only to US, Israel, Western allies — selective access for China/others' },
    { date: 'Mar 8', title: 'New Supreme Leader', description: 'Mojtaba Khamenei named Supreme Leader. IRGC pledges allegiance.' },
    { date: 'Mar 8', title: 'Oil Infrastructure Targeted', description: 'Israel strikes Iranian oil infrastructure for first time: Shahr Rey, Shahran, Nobonyad depots' },
    { date: 'Mar 9', title: 'Oil Breaches $100', description: 'Brent hits $119 intraday. Largest single-day dollar gain since 1988. Crude up 50% since conflict started.' },
    { date: 'Mar 9', title: 'Bapco Force Majeure', description: 'Bahrain\'s Bapco declares force majeure. Analysts (Jones Trading) expect more Gulf producers to follow as storage fills.' },
    { date: 'Mar 9', title: 'Goldman Sachs Warning', description: 'Goldman warns $140-150 oil if Hormuz stays disrupted beyond 30 days, potentially triggering synchronized global economic downturn.' },
    { date: 'Mar 10', title: 'Iran Mining Hormuz', description: "CNN reports Iran laying naval mines in Strait of Hormuz. Mojtaba Khamenei: Hormuz should remain closed as 'tool to pressure enemy.'" },
    { date: 'Mar 10', title: 'Qatar Offensive Action', description: 'Qatar shoots down 2 Iranian Su-24 bombers attempting to bomb Doha airport — first GCC offensive action.' },
    { date: 'Mar 11', title: 'Record SPR Release', description: 'IEA announces record 400M barrel strategic reserve release — largest in history. US contributing 172M barrels. Oil crashed 11% intraday, then recovered.' },
    { date: 'Mar 11', title: 'US Destroys Mine-Layers', description: 'US destroys 16 Iranian mine-laying vessels near Hormuz. Ships still being attacked — Thai, Liberian, Japanese vessels struck.' },
    { date: 'Mar 11', title: 'IRGC Transit Declaration', description: 'IRGC declares all ships need Iran permission to transit. Selective enforcement continues.' },
    { date: 'Mar 12', title: 'Iraq Ports Shut Down', description: 'Iraq shuts down oil port operations at Basra after tanker attacks. Supply destruction expands beyond Hormuz.' },
    { date: 'Mar 12', title: 'Navy Not Ready', description: "Energy Secretary Wright admits Navy 'not ready' to escort tankers — won't be ready until end of month." },
    { date: 'Mar 12', title: 'Oil Back Above $100', description: 'Brent crude back above $100 despite record SPR release. WTI +8%. IEA: largest supply disruption in history.' },
    { date: 'Mar 13', title: 'Yuan Transit Emerging', description: 'Iran considering yuan-only Hormuz transit. Two Indian LPG carriers allowed through. Petrodollar disruption.' },
    { date: 'Mar 13', title: 'Stagflation Comparisons', description: 'Fed cuts priced out to 2027-2028. 1973 OPEC crisis comparisons now mainstream. S&P first 3-week losing streak in year.' },
    { date: 'Mar 14', title: 'Kharg Island Struck', description: "US bombs Kharg Island military targets — 90% of Iran's oil exports pass through here. Trump threatens oil infrastructure next." },
    { date: 'Mar 14', title: '$200 Oil Warning', description: 'Iran spokesperson warns oil could hit $200 if energy facilities targeted. Bilateral energy targeting now explicit.' },
    { date: 'Mar 14', title: 'US Requests Allied Warships', description: 'Trump calls on China, France, Japan, South Korea, UK to send warships — admission US cannot reopen Hormuz alone.' },
    { date: 'Mar 15', title: 'Iran Denies Ceasefire', description: "Iran FM Araghchi on CBS: 'We never asked for a ceasefire.' Hezbollah drone hits Cyprus RAF base — war touching NATO territory." },
    { date: 'Mar 16', title: 'FCC Threatens Broadcasters', description: 'FCC Chair threatens broadcaster licenses over Iran war coverage. F1 cancels Bahrain and Saudi GPs.' },
    { date: 'Mar 17', title: 'Larijani Killed', description: 'Ali Larijani killed in strikes — last viable negotiation partner eliminated. IRGC warns military lost control of some units.' },
    { date: 'Mar 18', title: 'Ras Laffan Structural Damage', description: "Israel strikes South Pars → Iran retaliates on Ras Laffan. QatarEnergy: 17% LNG capacity lost, 5 YEARS to repair." },
    { date: 'Mar 19', title: '$119 Intraday Spike', description: 'Brent spikes to $119 intraday. Goldman warns oil could exceed 2008 all-time high of $147. JPMorgan cuts targets.' },
    { date: 'Mar 20', title: 'Hormuz 21 Days Closed', description: "Trump rejects ceasefire. Senior Iranian source: strait 'will not return to pre-war conditions.' Oil in triple digits for extended period." },
  ],
  keyMetrics: {
    transitCollapsePercent: 98,
    tankersStranded: '250+',
    shipsUnableToExit: '750+',
    trappedVLCCs: 60,
    percentGlobalVLCCFleet: 8,
    strandedSeafarers: 20000,
    strandedCruisePassengers: 15000,
    commercialShipsAttacked: '12+',
    capeOfGoodHopeDiversions: 'surged 112% in single day',
    crudeBoundForIndia: '12 million barrels',
    minervaFixture: { rate: 436000, vessel: 'Pantanassa', charterer: 'GS Caltex' },
    gpsJammingAffectedShips: 1650,
    selectiveTransitOnly: true,
    consecutiveZeroTransitDays: 4,
    hormuzDaysClosed: 21,
  },
};

// Casualty data derived from casualtyTimeline
export const casualtyData = {
  iranianKilled: {
    count: getLatest(casualtyTimeline).iranianKilled,
    asOf: `Day ${casualtyTimeline.length}`,
    note: `${getLatest(casualtyTimeline).iranianKilled.toLocaleString()}+ killed`,
  },
  minabSchool: {
    deaths: 180,
    description: 'Minab school death toll',
    note: '~180 children',
  },
  navalLosses: [
    {
      vessel: 'IRIS Jamaran',
      type: 'Frigate',
      location: 'Indian Ocean, ~40 nautical miles south of Sri Lanka',
      personnelUnaccounted: '50+',
      note: 'Not sunk in Strait of Hormuz - reinforces insurance-driven leverage thesis',
    },
    {
      vessel: 'IRIS Dena',
      type: 'Frigate',
      location: 'Indian Ocean, ~40 nautical miles south of Sri Lanka',
      personnelUnaccounted: '50+',
      note: 'Not sunk in Strait of Hormuz - reinforces insurance-driven leverage thesis',
    },
  ],
  usKilled: getLatest(casualtyTimeline).usKilled,
};

export const gccWaterData = [
  { country: 'Saudi Arabia', gdp: '~$1.1T', desalinationDependency: '~60%', waterReserves: 'Days-weeks', damage: 'Riyadh and Eastern Province targeted' },
  { country: 'UAE', gdp: '~$500B', desalinationDependency: '90%+', waterReserves: '2-5 days', damage: 'Amazon data center burning, Jebel Ali port fire, Burj Al Arab hit, Dubai airport 70% canceled' },
  { country: 'Qatar', gdp: '~$250B', desalinationDependency: '90%+', waterReserves: '2-5 days', damage: 'Ras Laffan energy facility, Mesaieed water/power plant hit; all flights grounded' },
  { country: 'Kuwait', gdp: '~$160B', desalinationDependency: '90%+', waterReserves: '2-5 days', damage: '6 U.S. troops killed at base; air raid sirens active' },
  { country: 'Bahrain', gdp: '~$45B', desalinationDependency: '90%+', waterReserves: '2-3 days', damage: 'U.S. Naval base targeted; commercial district hit' },
];

export const conflictTimeline = [
  { date: 'January 13, 2026', event: 'Iranian officials warn they are "ready for war"; U.S. begins largest Middle East military buildup since 2003 Iraq invasion' },
  { date: 'February 24, 2026', event: 'Trump\'s State of the Union accuses Iran of reviving nuclear weapons program, warns U.S. "prepared to act"' },
  { date: 'February 28, 2026', event: 'U.S. and Israel launch "Operation Epic Fury"—joint strikes across Iran. Supreme Leader Khamenei killed. Iran launches retaliatory strikes on 27 U.S. bases and Israeli targets within hours' },
  { date: 'March 1, 2026', event: 'Iran targets GCC civilian infrastructure: energy facilities in Qatar\'s Ras Laffan and Mesaieed, Dubai hotels and ports, Amazon data centers in UAE and Bahrain. Interim Leadership Council formed. Iran rejects U.S. ceasefire proposal via Italian mediator' },
  { date: 'March 2, 2026', event: 'U.S. death toll rises to 6. Trump says campaign could last 4-5 weeks. Hezbollah enters conflict from Lebanon. Zero tanker transits through Hormuz begins. Congress begins war powers resolution proceedings' },
  { date: 'March 3, 2026', event: 'Zero transits continue. Lloyd\'s P&I clubs announce coverage cancellation effective midnight March 5. Trump announces naval escorts. QatarEnergy suspends all LNG production.' },
  { date: 'March 4, 2026', event: 'Iranian casualties exceed 1,045. IRIS Jamaran and IRIS Dena sunk in Indian Ocean. 5 tankers transit (3 outbound only). Iraq output down 70% due to storage saturation from Hormuz closure.' },
  { date: 'March 5, 2026', event: 'P&I coverage officially expires. Zero transits resume. 200+ tankers stranded, 60 VLCCs trapped (8% of global fleet). 20,000 seafarers stranded. WTI +8.5%, biggest single-day gain since May 2020. Dow wipes out 2026 gains. War costing U.S. $1B/day.' },
  { date: 'March 6, 2026', event: 'Both House and Senate kill war powers resolutions. Trump says "no time limits." Iran FM refuses all negotiation. Israel launches broad wave on Tehran overnight. Beirut evacuation ordered (500K+ people). Kurdish ground offensive opens new front. China dispatches special envoy.' },
  { date: 'March 7, 2026', event: 'Israeli Air Force attacks 400+ targets in Iran, dropping 1,465 munitions. 80+ fighter jets strike Tehran with ~230 munitions. IDF destroys 16 Quds Force cargo aircraft at Mehrabad Airport. PRIMA tanker struck by Iranian drone in Hormuz. GPS jamming affects 1,650+ ships (up 55%). Selective transit emerges — only 3 vessels transit (Palau, Iran, Liberia flagged). Iran confirms Strait closed only to US, Israel, Western allies.' },
  { date: 'March 8, 2026', event: 'Mojtaba Khamenei (son) named new Supreme Leader — IRGC pledges allegiance. Israel strikes Iranian oil infrastructure for first time: Shahr Rey, Shahran, Nobonyad depots. Senior Iranian official warns war entered "new phase" — threatens regional energy infrastructure. Saudi Arabia first fatalities: 2 killed, 12 injured. Bahrain desalination plant hit. Kuwait airport fuel tanks targeted. Israel strikes hotel in central Beirut, killing 4. 7th US soldier killed. US orders non-emergency diplomats out of Saudi Arabia. G7 discusses emergency SPR release.' },
  { date: 'March 9, 2026', event: 'Oil surges past $100/barrel — Brent hits $119 intraday. Largest single-day dollar gain since 1988. Crude up 50% since conflict started. Asian markets crash: Nikkei -7.5%, KOSPI -8.1%. US gas hits $3.478 (AAA), up $0.50 in one week. 8th US soldier killed. Mojtaba Khamenei named new Supreme Leader — IRGC and military pledge allegiance. Iran announces nationwide allegiance gathering. Iraq output down 70% due to storage saturation. Bapco (Bahrain) declares force majeure — more expected to follow. Goldman Sachs warns $140-150 oil if Hormuz disrupted beyond 30 days. G7 considering coordinated SPR release.' },
  { date: 'March 10, 2026', event: "Mojtaba Khamenei's first public message: Hormuz should remain closed as 'tool to pressure enemy.' CNN reports Iran laying mines in Hormuz. Trump demands mines removed 'IMMEDIATELY' or consequences 'at level never seen before.' Qatar strikes Iran — shoots down 2 Su-24 bombers attempting to bomb Doha airport, first GCC offensive action. 8th US service member dies. Pezeshkian backtracks on Gulf apology. Oil whiplash: hits $119 then crashes to $88 on conflicting Trump signals." },
  { date: 'March 11, 2026', event: "IEA announces record 400M barrel strategic reserve release — largest in history. US contributing 172M barrels. Oil crashed 11% intraday on news then recovered. US destroys 16 Iranian mine-laying vessels near Hormuz. Thai ship Mayuree Naree set ablaze in Hormuz. Express Rome (Liberia-flagged) and One Majesty (Japan-flagged) struck. IRGC: all ships need Iran permission to transit. Hegseth says 'most intense day yet' of US strikes. Lebanon: 750,000+ displaced, 634 killed. Israel ground incursion in southern Lebanon. Ukrainian anti-drone teams now operating in Qatar, UAE, Saudi Arabia. US confirms 140 service members wounded in first 10 days. Feb CPI: 2.4% YoY (pre-war). Joe Rogan criticizes Trump — war 'seems so insane based on what he ran on.'" },
  { date: 'March 12, 2026', event: "Brent crude back above $100 despite record SPR release. WTI surges 8% to $94. 3 more ships struck overnight near Hormuz and Dubai. Iraq shuts down oil port operations at Basra after tanker attacks. Pezeshkian sets 3 conditions for peace: recognition of rights, war reparations, guarantees against future aggression — none achievable in current political environment. Khamenei adviser calls Trump 'Satan himself.' IRGC + Hezbollah launch joint missile operation against Israel — Iran claims most intense operation since war began. Energy Secretary Wright admits Navy 'not ready' to escort tankers — won't be ready until end of month. Bahrain fuel storage at airport hit by drone. Kuwait: 6 power lines downed by interceptor debris. Oman: Salalah port fuel tanks hit. Iran-linked hackers (Handala) steal 50TB from Stryker medical devices. UN Security Council adopts resolution urging Iran to stop Gulf attacks. Goldman raises inflation forecast to 2.9-3.3%. IEA warns of 'largest supply disruption in history of global oil market.' Iran UN rep: 1,348 civilians killed, 17,000+ injured. UNICEF: 1,100+ children injured or killed." },
  { date: 'March 13, 2026', event: "Yuan-denominated Hormuz transit emerging — Iran weaponizing strait to restructure how oil is traded. Two Indian LPG carriers allowed through under yuan framework. Hegseth: Mojtaba Khamenei 'wounded and likely disfigured.' Iran Foreign Ministry says military lost control of several units. 1,444 civilians + 4,400 military killed in Iran. 826 killed in Lebanon. 13+ US dead, 140 wounded. US refueling plane crashes in Iraq — 6 crew killed. 2,200 Marines deploying from Okinawa. Fed cuts priced out to 2027-2028. Stagflation comparisons to 1973 now mainstream." },
  { date: 'March 14, 2026', event: "US bombs Kharg Island military targets — Iran's 'crown jewel.' 90% of Iran's oil exports pass through Kharg. Trump threatens oil infrastructure next if Hormuz stays blocked. Iran warns retaliation on regional oil infrastructure. Fujairah bunkering hub fire. IRGC tells UAE residents to evacuate near US 'hideouts.' Trump calls on allies to send warships. Iran spokesperson warns oil could hit $200. Brent $103. S&P at 2026 lows." },
  { date: 'March 15, 2026', event: "Iran FM Araghchi on CBS Face the Nation: 'We never asked for a ceasefire. We are ready to defend ourselves as long as it takes.' Trump claims Iran wants deal — Araghchi flatly denies. 6 US crew from KC-135 refueling plane crash in Iraq identified. Israeli strikes on Hamadan and Isfahan continue. Hezbollah drone strikes Cyprus British RAF base — war touching NATO territory." },
  { date: 'March 16, 2026', event: "FCC Chair Brendan Carr threatens to revoke broadcaster licenses over Iran war coverage — Sen. Murphy calls it 'middle of a totalitarian takeover.' Formula One cancels Bahrain and Saudi Arabia Grand Prix races. Israel expands ground operations in southern Lebanon." },
  { date: 'March 17, 2026', event: "Ali Larijani killed in strikes — de facto post-Khamenei leader and most credible negotiation partner. IRGC warns Iran military has lost control over several units operating on old instructions. Decentralized escalation risk increasing." },
  { date: 'March 18, 2026', event: "Israel strikes Iran's South Pars gas field. Iran retaliates by striking Qatar's Ras Laffan — world's largest LNG facility. QatarEnergy: 17% export capacity lost, up to 5 years to repair. Brent surges to $108.78. This is the escalation that transforms temporary disruption into structural damage." },
  { date: 'March 19, 2026', event: "Brent spikes to $119 intraday before settling $108.65 as Middle East energy infrastructure attacks intensify. JPMorgan cuts S&P 500 year-end target. Goldman warns Brent could exceed 2008 all-time high of $147. Netanyahu says Israel helping open Hormuz, war 'may end sooner than people think.' India negotiating with Iran to get 22 ships through Hormuz — 2 already through. Fed comments add to risk-off sentiment. Mortgage rates hit 3-month highs." },
  { date: 'March 20, 2026', event: "Trump rejects ceasefire: 'You don't do a ceasefire when you're literally obliterating the other side.' Calls NATO allies 'cowards' for not helping with Hormuz. Fresh strikes hit Tehran during Nowruz (Persian New Year). Thousands more Marines and sailors (11th MEU, Boxer ARG) rerouted from Indo-Pacific to Middle East. Iran threatens world tourism sites. Brent at $107.40. Hormuz closed for 21 consecutive days. Senior Iranian source: strait 'will not return to pre-war conditions.' Goldman says oil may stay in triple digits for years. Iranian Red Crescent: 204 children among 1,444 civilians killed. Lebanon exceeds 1,000 dead." },
  { date: 'March 21, 2026', event: "Iranian drones hit Kuwait's Mina al-Ahmadi refinery — 730K bpd capacity, fire sparked. Saudi intercepted 47 drones, UAE 19, Qatar 23 overnight. 21 commercial ships attacked since war began (UKMTO). Trump floats idea of 'winding down' campaign. US-UK-France-Egypt naval coalition forming for Hormuz escort operations. Brent at $108.22." },
  { date: 'March 22, 2026', event: "Trump issues 48-hour ultimatum: 'obliterate' Iran's power plants if Hormuz not fully reopened. Iran response immediate — Pezeshkian warns Hormuz will be 'completely closed indefinitely' if power infrastructure hit. Iran fires ICBM at Diego Garcia (US-UK Indian Ocean base) — first ICBM used against US installation. Iranian missiles strike near Israel's Dimona nuclear facility — 100+ injured including 10 seriously in nearby Arad. Brent surges to $114.85 on ultimatum news. Markets pricing 60%+ chance of Full Escalation." },
  { date: 'March 23, 2026', event: "POTENTIAL TURNING POINT: Trump announces 'productive conversations' with Iran, delays strikes on power plants for 5 days. First direct US-Iran communication since war began. Pezeshkian softens rhetoric — drops 'indefinite closure' language. Oil crashes 11%. S&P futures swing from -1% to +3% in minutes. Dow futures +1,000. Iran denies direct talks, says Trump 'retreated out of fear.' Senior official confirms 'received points through mediators.'" },
  { date: 'March 24, 2026', event: "Oil rebounds to $104 as Iran denies talks and strikes continue. Missile hits Tel Aviv street. 82nd Airborne (1,000+) deploying. 290 US wounded — doubled in two weeks. Trump approval 36% (Reuters/Ipsos). Port Arthur TX refinery explosion adds domestic supply disruption. $580M insider trading probe — bets placed 15 min before Trump's Truth Social post. Trump claims Iran offered 'prize' related to Hormuz. IRGC calls Trump 'deceitful.' Zolghadr named new National Security Council head replacing killed Larijani." },
  { date: 'March 25, 2026', event: "Oil drops 5-7%, Brent near $99 — below $100 for first time since Day 13. NYT: US sent Iran 15-point plan to end conflict — first concrete diplomatic framework. Israel Ch12: Washington seeking 1-month ceasefire. Pakistan offers to host talks. IEA: 'greatest energy and food security challenge in history.' 50% of global urea and sulfur exports disrupted — food security dimension. 40+ energy assets damaged across 9 countries. BUT: Hormuz still closed with confirmed mines, 82nd Airborne deploying, strikes continue on both sides. First time Full Escalation not the leading scenario since Day 10." },
];

// =============================================================================
// NEW DATA ARRAYS - SECTOR IMPACT
// =============================================================================

export interface AirlineImpactEntry extends TimeSeriesEntry {
  americanAirlines: number;
  unitedAirlines: number;
  deltaAirlines: number;
  southwestAirlines: number;
  note?: string;
}

export const airlineImpact: AirlineImpactEntry[] = [
  { date: 'Mar 5', timestamp: Date.parse('2026-03-05'), americanAirlines: -5.4, unitedAirlines: -5.0, deltaAirlines: -3.9, southwestAirlines: -6.0, note: 'AAL downgraded to neutral by Rothschild, negative EPS forecast for 2026' },
];

export interface WarCostEntry extends TimeSeriesEntry {
  dailyCostUSD: number;
  cumulativeCostUSD?: number;
  note?: string;
}

export const warCostEstimate: WarCostEntry[] = [
  { date: 'Mar 5', timestamp: Date.parse('2026-03-05'), dailyCostUSD: 1000000000, note: 'NBC sources: war costing U.S. $1 billion per day' },
  { date: 'Mar 12', timestamp: Date.parse('2026-03-12'), dailyCostUSD: 1900000000, cumulativeCostUSD: 11300000000, note: "Pentagon briefed Senate: $11.3B first 6 days (~$1.9B/day). Sen. Coons says actual total 'significantly higher.' Munitions replacement alone exceeds $10B." },
];

export const ieaSupplyImpact = {
  date: '2026-03-12',
  estimatedSupplyLossBpd: 8000000,
  percentGlobalSupply: 8,
  note: 'IEA estimates global supply could fall 8 million bpd in March — nearly 8% of global supply',
};

export const macroTransmissionChain = [
  {
    id: 'energy-shock',
    label: 'Energy Shock',
    description: 'Strait of Hormuz closure, 20% global oil disrupted',
    metrics: [`Brent +${((getLatest(marketTimeline).brentCrude - 77.52) / 77.52 * 100).toFixed(1)}% to $${getLatest(marketTimeline).brentCrude}`, `VLCC rates $${(getLatest(hormuzTimeline).vlccRate / 1000).toFixed(0)}K/day`, '100% transit collapse - zero transits 4 days'],
    color: '#C8102E',
  },
  {
    id: 'inflation',
    label: 'Inflation',
    description: 'Energy costs propagate through economy',
    metrics: ['ISM Prices Paid: 70.5 (+11.5 pts)', 'Gas: biggest jump since Ukraine', '$14B annualized per $10/bbl'],
    color: '#B07D2B',
  },
  {
    id: 'fed-constraint',
    label: 'Fed Constraint',
    description: 'Rate cuts blocked by inflation spike',
    metrics: ['10Y yield: 4.13% (+16bps from pre-war)', 'Fed cuts pushed to summer', 'Stagflation risk rising'],
    color: '#B7791F',
  },
  {
    id: 'spread-widening',
    label: 'Spread Widening',
    description: 'Credit markets reprice risk',
    metrics: [`HY OAS: ${getLatest(marketTimeline).hySpread} bps`, '30-yr avg: 525 bps', 'Max widening potential'],
    color: '#2E7D4F',
  },
  {
    id: 'defaults',
    label: 'Defaults',
    description: 'Zombie companies hit refinancing wall',
    metrics: ['Leveraged loan default: 7.9%', '2026-27 maturity wall', 'Zombie company population'],
    color: '#4F7F7A',
  },
  {
    id: 'restructuring',
    label: 'Restructuring Cycle',
    description: 'Largest since 2008-2009',
    metrics: ['Retail, CRE, Airlines', 'Cruise, Speculative Tech', 'Advisory mandates surge'],
    color: '#7A6C9D',
  },
];

// =============================================================================
// ADDITIONAL MARKET DATA
// =============================================================================

export const iraqProductionDeclinePercent = 70;

export const forceMajeureDeclarers = [
  { company: 'Bapco Energies', country: 'Bahrain', date: 'Mar 9, 2026', note: 'Storage saturation from Hormuz closure' },
];

export const goldmanSachsProjection = {
  thirtyDayDisruption: '$140-150/bbl',
  trigger: 'synchronized global economic downturn',
  source: 'Goldman Sachs',
  date: 'Mar 9, 2026',
  inflationForecast: '2.9-3.3%',
  inflationForecastDate: 'Mar 12, 2026',
};

export const sprRelease = {
  announced: '2026-03-11',
  totalBarrels: 400000000,
  usContribution: 172000000,
  precedent: 'Largest in IEA history. Previous record: 182M barrels after Russia-Ukraine 2022.',
  marketReaction: 'Oil dropped 11% intraday on announcement, then recovered above $100 within 24 hours. Goldman says release offsets only 12 days of Gulf disruption.',
  note: "Trump also indicated US would tap SPR 'a little bit' — reversing earlier refusal",
};

export const futuresCurve = [
  { month: 'April', price: 108 },
  { month: 'May', price: 103 },
  { month: 'June', price: 95 },
  { month: 'July', price: 88 },
];

export const waterInfrastructure = [
  {
    date: '2026-03-07',
    day: 8,
    target: 'Qeshm Island desalination plant (Iran)',
    attacker: 'United States',
    impact: 'Water supply cut to 30 villages',
    source: 'FM Araghchi statement on X',
  },
  {
    date: '2026-03-08',
    day: 9,
    target: 'Unnamed desalination plant (Bahrain)',
    attacker: 'Iran (drone)',
    impact: 'Material damage confirmed, operations not disrupted',
    source: 'Bahrain Ministry of Interior',
  },
];

export const gulfStrikeData = {
  totalIranianMissilesAndDrones: '3000+',
  source: 'Arab League figures',
  bahrainIntercepted: { missiles: 95, drones: 164 },
  uaeBarrages: '100+ missiles and drones in single barrages',
};

export const israeliCasualtyData = {
  civiliansKilled: 12,
  civiliansInjured: 2142,
  displaced: 3000,
  hezbollahAttackWaves: 223,
  hezbollahJoinedDate: 'March 2',
  iranAttackWaveFrequency: [
    { day: 2, waves: 55 },
    { day: 9, waves: 9 },
  ],
  note: 'Attack wave decline confirms missile rationing thesis',
  source: 'Alma Research Center',
};

// =============================================================================
// CONFLICT EVENTS MAP DATA
// =============================================================================

export const conflictEvents: ConflictEvent[] = [
  // DAY 1 — Feb 28
  { date: '2026-02-28', day: 1, lat: 35.6892, lng: 51.3890, type: 'strike_us', target: 'Leadership House, Tehran', description: 'Operation Epic Fury opening salvo. Khamenei killed.', status: 'confirmed' },
  { date: '2026-02-28', day: 1, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: '3 tankers struck near strait. Insurance withdrawal begins.', status: 'confirmed' },
  { date: '2026-02-28', day: 1, lat: 26.2285, lng: 50.5860, type: 'strike_iran', target: 'NSA Bahrain / US 5th Fleet HQ', description: 'Iranian missiles and drones hit US naval base', status: 'confirmed' },
  { date: '2026-02-28', day: 1, lat: 29.3117, lng: 47.4818, type: 'strike_iran', target: 'Kuwait US base', description: '6 US service members killed in drone attack', status: 'confirmed' },
  { date: '2026-02-28', day: 1, lat: 33.7249, lng: 51.7274, type: 'strike_us', target: 'Natanz Nuclear Facility', description: 'Nuclear facility destroyed in initial strikes', status: 'confirmed' },

  // DAY 2 — Mar 1
  { date: '2026-03-01', day: 2, lat: 25.2854, lng: 51.5310, type: 'infrastructure_energy', target: 'Ras Laffan, Qatar', description: 'Iran strikes Qatar energy facility. QatarEnergy suspends LNG production.', status: 'confirmed' },
  { date: '2026-03-01', day: 2, lat: 25.0136, lng: 55.0553, type: 'strike_iran', target: 'Dubai hotels and Jebel Ali port', description: 'Fire at Jebel Ali. Dubai Airport 70% cancelled.', status: 'confirmed' },
  { date: '2026-03-01', day: 2, lat: 24.4539, lng: 54.3773, type: 'infrastructure_energy', target: 'Amazon data center, Abu Dhabi', description: 'AWS data center burning. Still offline.', status: 'confirmed' },
  { date: '2026-03-01', day: 2, lat: 27.1542, lng: 56.2553, type: 'shipping', target: 'Strait of Hormuz', description: 'Tanker transits collapse to 18. VLCC rates $300K/day.', status: 'confirmed' },
  { date: '2026-03-01', day: 2, lat: 25.2797, lng: 51.4935, type: 'infrastructure_energy', target: 'Mesaieed, Qatar', description: 'Water and power plant hit. QatarEnergy suspends all production.', status: 'confirmed' },

  // DAY 3 — Mar 2
  { date: '2026-03-02', day: 3, lat: 33.8938, lng: 35.5018, type: 'strike_israel', target: 'Beirut, Lebanon', description: 'Hezbollah enters conflict. Israel strikes southern suburbs.', status: 'confirmed' },
  { date: '2026-03-02', day: 3, lat: 27.1865, lng: 56.2808, type: 'strike_us', target: 'Bandar Abbas Naval Base', description: 'US strikes Iranian naval base', status: 'confirmed' },
  { date: '2026-03-02', day: 3, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: 'Zero tanker transits begin. Lloyd\'s P&I cancellation announced.', status: 'confirmed' },

  // DAY 4 — Mar 3
  { date: '2026-03-03', day: 4, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: 'Zero transits continue. Trump announces naval escorts.', status: 'confirmed' },
  { date: '2026-03-03', day: 4, lat: 27.1500, lng: 57.0833, type: 'strike_us', target: 'Minab, Iran', description: 'School strike kills ~180 children. Major civilian casualty event.', impact: '~180 children killed', status: 'confirmed' },

  // DAY 5 — Mar 4
  { date: '2026-03-04', day: 5, lat: 5.9549, lng: 80.5550, type: 'naval', target: 'Indian Ocean, south of Sri Lanka', description: 'IRIS Jamaran and IRIS Dena sunk by US submarine. 87 bodies recovered, 32 survivors.', status: 'confirmed' },
  { date: '2026-03-04', day: 5, lat: 30.4217, lng: 48.1653, type: 'infrastructure_energy', target: 'Basra, Iraq', description: 'Iraq output down 70% due to storage saturation from Hormuz closure.', impact: '70% production decline', status: 'confirmed' },

  // DAY 6 — Mar 5
  { date: '2026-03-05', day: 6, lat: 40.4675, lng: 50.0467, type: 'strike_iran', target: 'Baku Airport, Azerbaijan', description: 'Iranian drones strike airport terminal. Two civilians injured. Conflict jumps to Caucasus.', status: 'confirmed' },
  { date: '2026-03-05', day: 6, lat: 34.8021, lng: 38.9968, type: 'strike_israel', target: 'Homs/Bekaa, Lebanon', description: 'Israel intensifies Lebanon strikes. 500K+ evacuated from southern Beirut.', status: 'confirmed' },
  { date: '2026-03-05', day: 6, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: 'P&I coverage expires. 200+ tankers stranded. 60 VLCCs trapped.', impact: '8% of global VLCC fleet trapped', status: 'confirmed' },

  // DAY 7 — Mar 6
  { date: '2026-03-06', day: 7, lat: 35.6892, lng: 51.3890, type: 'strike_us', target: 'Tehran residential areas', description: 'Massive overnight explosions near Tehran University. Jomhuri Avenue hit.', status: 'confirmed' },
  { date: '2026-03-06', day: 7, lat: 33.8547, lng: 35.4832, type: 'strike_israel', target: 'Beirut Southern Suburbs', description: 'Israel orders evacuation of ALL southern Beirut — 500K+ people.', status: 'confirmed' },
  { date: '2026-03-06', day: 7, lat: 36.6833, lng: 45.0833, type: 'ground_offensive', target: 'Kurdistan (NW Iran)', description: 'Kurdish ground offensive begins — first ground front of the war.', status: 'confirmed' },

  // DAY 8 — Mar 7
  { date: '2026-03-07', day: 8, lat: 35.6892, lng: 51.3100, type: 'strike_israel', target: 'Mehrabad Airport, Tehran', description: 'IDF destroys 16 Quds Force cargo aircraft. 400+ targets, 1,465 munitions over weekend.', impact: '1,465 munitions dropped', status: 'confirmed' },
  { date: '2026-03-07', day: 8, lat: 35.7100, lng: 51.4200, type: 'strike_israel', target: 'IRGC University, Tehran', description: '80+ fighter jets strike Tehran with ~230 munitions.', status: 'confirmed' },
  { date: '2026-03-07', day: 8, lat: 26.7606, lng: 56.2808, type: 'shipping', target: 'PRIMA tanker, Hormuz', description: 'Tanker struck by Iranian drone in strait.', status: 'confirmed' },
  { date: '2026-03-07', day: 8, lat: 26.5445, lng: 56.2578, type: 'infrastructure_water', target: 'Qeshm Island, Iran', description: "US strikes desalination plant. Water cut to 30 villages. Araghchi: 'US set this precedent.'", impact: 'Water to 30 villages cut', status: 'confirmed' },
  { date: '2026-03-07', day: 8, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: 'GPS jamming affects 1,650+ ships (up 55%). Only 3 vessels transit.', status: 'confirmed' },

  // DAY 9 — Mar 8
  { date: '2026-03-08', day: 9, lat: 35.5861, lng: 51.3554, type: 'infrastructure_energy', target: 'Shahr Rey oil depot, Tehran', description: 'Israel strikes Iranian oil infrastructure for first time. Toxic smoke over Tehran.', status: 'confirmed' },
  { date: '2026-03-08', day: 9, lat: 35.7796, lng: 51.4272, type: 'infrastructure_energy', target: 'Shahran oil depot, Tehran', description: 'Major fire visible from highway. Blackened rain reported.', status: 'confirmed' },
  { date: '2026-03-08', day: 9, lat: 26.2285, lng: 50.5500, type: 'infrastructure_water', target: 'Desalination plant, Bahrain', description: 'Iranian drone damages plant. First Gulf water infrastructure strike. Operations not disrupted.', status: 'confirmed' },
  { date: '2026-03-08', day: 9, lat: 24.4100, lng: 47.5800, type: 'strike_iran', target: 'Riyadh Province, Saudi Arabia', description: 'First Saudi fatalities: 2 killed, 12 injured from projectile hitting residential area.', impact: '2 killed, 12 injured', status: 'confirmed' },
  { date: '2026-03-08', day: 9, lat: 29.2266, lng: 47.9689, type: 'infrastructure_energy', target: 'Kuwait International Airport', description: 'Drones target fuel tanks at airport.', status: 'confirmed' },
  { date: '2026-03-08', day: 9, lat: 33.8750, lng: 35.5097, type: 'strike_israel', target: 'Central Beirut hotel', description: 'Israel strikes hotel in heart of capital. 4 killed. First strike on central Beirut.', impact: '4 killed', status: 'confirmed' },

  // DAY 10 — Mar 9
  { date: '2026-03-09', day: 10, lat: 26.2285, lng: 50.6110, type: 'strike_iran', target: 'Sitra Island, Bahrain', description: 'Iranian strike on Bapco refinery. Force majeure declared.', status: 'confirmed' },
  { date: '2026-03-09', day: 10, lat: 26.0667, lng: 50.5577, type: 'strike_iran', target: 'Manama residential, Bahrain', description: '29-year-old woman killed, 8 injured. First Bahraini civilian death.', impact: '1 killed, 8 injured', status: 'confirmed' },
  { date: '2026-03-09', day: 10, lat: 22.7877, lng: 54.7585, type: 'interception', target: 'Shaybah oil field, Saudi Arabia', description: 'Saudi intercepts drone targeting massive oil field.', status: 'confirmed' },
  { date: '2026-03-09', day: 10, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: 'Oil breaches $100, hits $119 intraday. Near-zero Western transits continue.', impact: 'Oil +50% since conflict start', status: 'confirmed' },

  // DAY 11 — Mar 10
  { date: '2026-03-10', day: 11, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: "Iran laying naval mines in strait (CNN). Mojtaba Khamenei: Hormuz should remain closed as 'tool to pressure enemy.'", status: 'confirmed' },
  { date: '2026-03-10', day: 11, lat: 25.2854, lng: 51.5310, type: 'interception', target: 'Doha Airport, Qatar', description: 'Qatar shoots down 2 Iranian Su-24 bombers attempting to bomb airport — first GCC offensive action.', status: 'confirmed' },
  { date: '2026-03-10', day: 11, lat: 35.6892, lng: 51.3890, type: 'strike_us', target: 'Tehran', description: 'US/Israeli strikes continue. Oil hits $119 intraday before collapsing to $88 on Trump rhetoric.', status: 'confirmed' },

  // DAY 12 — Mar 11
  { date: '2026-03-11', day: 12, lat: 27.1832, lng: 56.2666, type: 'naval', target: 'Strait of Hormuz', description: 'US destroys 16 Iranian mine-laying vessels near Hormuz. IEA announces record 400M barrel SPR release.', status: 'confirmed' },
  { date: '2026-03-11', day: 12, lat: 26.5667, lng: 56.2500, type: 'shipping', target: 'Thai bulk carrier Mayuree Naree, Hormuz', description: 'Ship struck and set ablaze in strait. IRGC: all ships need Iran permission.', status: 'confirmed' },
  { date: '2026-03-11', day: 12, lat: 26.4500, lng: 56.3000, type: 'shipping', target: 'Container ship Express Rome, Hormuz', description: 'Liberia-flagged container ship struck in strait.', status: 'confirmed' },
  { date: '2026-03-11', day: 12, lat: 25.2700, lng: 55.3300, type: 'shipping', target: 'Japanese tanker One Majesty, Dubai anchorage', description: 'Japanese-flagged tanker damaged at anchor near Dubai.', status: 'confirmed' },
  { date: '2026-03-11', day: 12, lat: 33.8938, lng: 35.5018, type: 'ground_offensive', target: 'Southern Lebanon', description: 'Israel ground incursion in southern Lebanon. 750,000+ displaced, 634 killed in Lebanon.', status: 'confirmed' },
  { date: '2026-03-11', day: 12, lat: 24.6877, lng: 46.7219, type: 'interception', target: 'Riyadh, Saudi Arabia', description: 'Ukrainian anti-drone teams now operating in Saudi Arabia, Qatar, and UAE.', status: 'confirmed' },

  // DAY 13 — Mar 12
  { date: '2026-03-12', day: 13, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: '3 more ships struck overnight. Brent back above $100 despite record SPR release.', status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 30.4217, lng: 48.1653, type: 'infrastructure_energy', target: 'Basra Oil Port, Iraq', description: 'Iraq shuts down oil port operations after tanker attacks at Basra.', impact: 'Iraq oil exports halted', status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 26.2700, lng: 50.6300, type: 'infrastructure_energy', target: 'Bahrain Airport Fuel Storage', description: 'Iranian drone strikes fuel storage at Bahrain airport.', status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 29.3117, lng: 47.4818, type: 'strike_iran', target: 'Kuwait Power Grid', description: '6 power lines downed by interceptor debris in Kuwait.', status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 17.0194, lng: 54.0924, type: 'infrastructure_energy', target: 'Salalah Port, Oman', description: 'Fuel tanks at Salalah port hit by Iranian strike. First Omani infrastructure damage.', status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 32.0853, lng: 34.7818, type: 'strike_iran', target: 'Tel Aviv and Haifa, Israel', description: "Iran's 'most intense operation since beginning of war' — most advanced ballistic missiles toward Tel Aviv and Haifa.", status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 25.2700, lng: 55.3300, type: 'shipping', target: 'Dubai anchorage', description: 'Additional ships struck overnight near Dubai.', status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 29.7, lng: 48.8, type: 'shipping', target: 'US tanker Safesea Vishnu, off Iraq coast', description: 'US-owned tanker attacked off Iraq coast. Two tankers caught fire in Iraqi territorial waters.', status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 25.2532, lng: 55.3657, type: 'strike_iran', target: 'Dubai International Airport', description: 'Dubai airport hit by Iranian drones. 4 wounded. Airport still operating.', impact: '4 wounded', status: 'confirmed' },
  { date: '2026-03-12', day: 13, lat: 29.2266, lng: 47.9689, type: 'strike_iran', target: 'Kuwait International Airport', description: 'Kuwait airport targeted by Iranian drones. Material damage only.', status: 'confirmed' },

  // DAY 14 — Mar 13
  { date: '2026-03-13', day: 14, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: 'Iran considering yuan-only Hormuz transit. Two Indian LPG carriers allowed through. Petrodollar disruption emerging.', status: 'confirmed' },
  { date: '2026-03-13', day: 14, lat: 35.6892, lng: 51.3890, type: 'strike_us', target: 'Tehran Rally Site', description: 'Explosions near Tehran rally attended by Larijani, Pezeshkian, Araghchi.', status: 'confirmed' },
  { date: '2026-03-13', day: 14, lat: 33.3152, lng: 44.3661, type: 'strike_us', target: 'US Refueling Plane, Iraq', description: 'US refueling plane crashes in Iraq — 6 crew killed.', impact: '6 crew killed', status: 'confirmed' },
  { date: '2026-03-13', day: 14, lat: 33.8938, lng: 35.5018, type: 'strike_israel', target: 'Lebanon', description: '826 killed in Lebanon total. Conflict continues.', impact: '826 killed total', status: 'confirmed' },
  { date: '2026-03-13', day: 14, lat: 26.3927, lng: 127.7314, type: 'naval', target: 'Okinawa, Japan', description: '2,200 Marines deploying from Okinawa to Gulf region.', status: 'confirmed' },

  // DAY 15 — Mar 14
  { date: '2026-03-14', day: 15, lat: 29.2442, lng: 50.3235, type: 'strike_us', target: 'Kharg Island, Iran', description: "US bombs Kharg Island military targets — Trump calls it Iran's 'crown jewel.' 90% of Iran's oil exports pass through here.", impact: 'First strike on Kharg Island', status: 'confirmed' },
  { date: '2026-03-14', day: 15, lat: 25.1200, lng: 56.3300, type: 'infrastructure_energy', target: 'Fujairah Bunkering Hub, UAE', description: 'Fire at Fujairah bunkering hub.', status: 'confirmed' },
  { date: '2026-03-14', day: 15, lat: 31.9539, lng: 35.9106, type: 'interception', target: 'Jordan Airspace', description: 'Jordan intercepted 79/85 projectiles in week 2 of conflict.', impact: '79/85 intercepted', status: 'confirmed' },
  { date: '2026-03-14', day: 15, lat: 35.6892, lng: 51.3890, type: 'strike_us', target: 'Iranian Cultural Sites', description: '56 Iranian cultural sites damaged since conflict began.', impact: '56 cultural sites damaged', status: 'confirmed' },
  { date: '2026-03-14', day: 15, lat: 24.4539, lng: 54.3773, type: 'strike_iran', target: 'UAE Near US Facilities', description: "IRGC tells UAE residents to evacuate near US 'hideouts.'", status: 'confirmed' },
  { date: '2026-03-14', day: 15, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: "Trump threatens oil infrastructure next if Hormuz stays blocked. Iran warns $200 oil if energy facilities hit.", status: 'confirmed' },

  // DAY 16 — Mar 15
  { date: '2026-03-15', day: 16, lat: 35.6892, lng: 51.3890, type: 'strike_us', target: 'Tehran', description: 'Continued strikes on Tehran. Iran FM Araghchi on CBS denies ceasefire: "We never asked for a ceasefire."', status: 'confirmed' },
  { date: '2026-03-15', day: 16, lat: 34.59, lng: 32.99, type: 'strike_iran', target: 'RAF Akrotiri, Cyprus', description: 'Hezbollah drone strikes British RAF base in Cyprus — war touching NATO territory.', status: 'confirmed' },
  { date: '2026-03-15', day: 16, lat: 32.4279, lng: 53.6880, type: 'strike_israel', target: 'Hamadan and Isfahan, Iran', description: 'Israeli strikes on Hamadan and Isfahan continue.', status: 'confirmed' },

  // DAY 17 — Mar 16
  { date: '2026-03-16', day: 17, lat: 33.85, lng: 35.50, type: 'ground_offensive', target: 'Southern Lebanon', description: 'Israel expands ground operations in southern Lebanon.', status: 'confirmed' },
  { date: '2026-03-16', day: 17, lat: 26.0346, lng: 50.5577, type: 'interception', target: 'Bahrain Grand Prix Circuit', description: 'Formula One cancels Bahrain and Saudi Arabia Grand Prix races due to conflict.', status: 'confirmed' },

  // DAY 18 — Mar 17
  { date: '2026-03-17', day: 18, lat: 35.69, lng: 51.39, type: 'strike_us', target: 'Tehran — Larijani killed', description: 'Ali Larijani killed in strikes — de facto post-Khamenei leader and most credible negotiation partner eliminated.', impact: 'Last diplomatic off-ramp closed', status: 'confirmed' },
  { date: '2026-03-17', day: 18, lat: 35.6892, lng: 51.3890, type: 'strike_us', target: 'IRGC facilities', description: 'IRGC warns military has lost control over several units operating on old instructions. Decentralized escalation risk.', status: 'confirmed' },

  // DAY 19 — Mar 18
  { date: '2026-03-18', day: 19, lat: 27.5, lng: 52.5, type: 'infrastructure_energy', target: "South Pars gas field, Iran", description: "Israel strikes Iran's South Pars gas field — major Iranian energy infrastructure.", status: 'confirmed' },
  { date: '2026-03-18', day: 19, lat: 25.9, lng: 51.5, type: 'infrastructure_energy', target: "Ras Laffan LNG facility, Qatar", description: "Iran retaliates by striking Ras Laffan — world's largest LNG facility. QatarEnergy: 17% export capacity lost, up to 5 years to repair.", impact: 'Structural energy damage', status: 'confirmed' },
  { date: '2026-03-18', day: 19, lat: 29.08, lng: 48.13, type: 'infrastructure_energy', target: 'Kuwait oil refinery', description: 'Kuwait oil refinery hit by Iranian strikes.', status: 'confirmed' },

  // DAY 20 — Mar 19
  { date: '2026-03-19', day: 20, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: 'Brent spikes to $119 intraday before settling $108.65. Goldman warns oil could exceed 2008 all-time high of $147.', status: 'confirmed' },
  { date: '2026-03-19', day: 20, lat: 33.85, lng: 35.50, type: 'strike_israel', target: 'Beirut southern suburbs', description: 'Continued strikes on Beirut southern suburbs.', status: 'confirmed' },

  // DAY 21 — Mar 20
  { date: '2026-03-20', day: 21, lat: 35.69, lng: 51.39, type: 'strike_us', target: 'Tehran — Nowruz strikes', description: 'Strikes hit Tehran during Nowruz (Persian New Year). Trump rejects ceasefire.', status: 'confirmed' },
  { date: '2026-03-20', day: 21, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz', description: "Hormuz closed for 21 consecutive days. Senior Iranian source: strait 'will not return to pre-war conditions.'", status: 'confirmed' },
  { date: '2026-03-20', day: 21, lat: 32.7157, lng: -117.1611, type: 'naval', target: 'US Marines deployment', description: 'More Marines and sailors (11th MEU, Boxer ARG) rerouted from Indo-Pacific to Middle East.', status: 'confirmed' },

  // DAY 22 — Mar 21
  { date: '2026-03-21', day: 22, lat: 29.08, lng: 48.13, type: 'infrastructure_energy', target: "Mina al-Ahmadi refinery, Kuwait", description: "Iranian drones hit Kuwait's Mina al-Ahmadi refinery — 730K bpd capacity. Fire sparked by two waves of drones.", impact: '730K bpd capacity affected', status: 'confirmed' },
  { date: '2026-03-21', day: 22, lat: 35.69, lng: 51.39, type: 'strike_us', target: 'Tehran — continued Nowruz strikes', description: 'US/Israeli strikes continue on Tehran during Nowruz period.', status: 'confirmed' },
  { date: '2026-03-21', day: 22, lat: 25.79, lng: 55.94, type: 'strike_iran', target: 'Ras al-Khaimah threat, UAE', description: "Iran threatens 'crushing blows' to Ras al-Khaimah if attacks launched from UAE territory.", status: 'confirmed' },

  // DAY 23 — Mar 22
  { date: '2026-03-22', day: 23, lat: 31.07, lng: 35.21, type: 'strike_iran', target: 'Dimona, Israel — near nuclear facility', description: "Iranian missiles strike Dimona near Israel's Negev nuclear research center. IAEA monitoring.", impact: 'First strike near Israeli nuclear facility', status: 'confirmed' },
  { date: '2026-03-22', day: 23, lat: 31.26, lng: 35.21, type: 'strike_iran', target: 'Arad, Israel', description: 'Iranian missiles hit Arad. 100+ injured including 10 seriously.', impact: '100+ injured', status: 'confirmed' },
  { date: '2026-03-22', day: 23, lat: -7.32, lng: 72.42, type: 'strike_iran', target: 'Diego Garcia, Indian Ocean', description: 'Iran fires ICBM at Diego Garcia (US-UK Indian Ocean base). War extends to Indian Ocean.', impact: 'Geographic expansion to Indian Ocean', status: 'confirmed' },
  { date: '2026-03-22', day: 23, lat: 33.35, lng: 35.25, type: 'strike_israel', target: 'Litani River bridge, Lebanon', description: 'Israel strikes Litani River bridge in southern Lebanon.', status: 'confirmed' },
  { date: '2026-03-22', day: 23, lat: 35.69, lng: 51.39, type: 'strike_us', target: 'Iranian power infrastructure threat', description: "Trump issues 48-hour ultimatum: 'obliterate' power plants if Hormuz not reopened.", status: 'confirmed' },

  // DAY 24 — Mar 23
  { date: '2026-03-23', day: 24, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz — potential turning point', description: "Trump delays strikes after 'productive conversations.' 5-day pause. Pezeshkian softens Hormuz language. Oil crashes 11%.", impact: 'First de-escalation signal in 24 days', status: 'confirmed' },

  // DAY 25 — Mar 24
  { date: '2026-03-24', day: 25, lat: 32.0853, lng: 34.7818, type: 'strike_iran', target: 'Tel Aviv street strike', description: 'Iranian missile hits Tel Aviv street. Strikes continue despite diplomatic signals.', status: 'confirmed' },
  { date: '2026-03-24', day: 25, lat: 29.9546, lng: -93.9280, type: 'infrastructure_energy', target: 'Port Arthur TX refinery', description: 'Explosion and fire at major refinery in Port Arthur, Texas. Diesel-producing portion offline. Domestic supply disruption.', impact: 'Domestic refining capacity reduced', status: 'confirmed' },
  { date: '2026-03-24', day: 25, lat: 35.05, lng: -79.00, type: 'military', target: '82nd Airborne deployment', description: '82nd Airborne (1,000+ troops) deploying to Middle East despite Trump claiming war is won.', status: 'confirmed' },
  { date: '2026-03-24', day: 25, lat: 35.69, lng: 51.39, type: 'political', target: 'Iran leadership', description: "Mohammad Bagher Zolghadr named new National Security Council secretary replacing killed Larijani. Iran calls Trump 'deceitful.'", status: 'confirmed' },

  // DAY 26 — Mar 25
  { date: '2026-03-25', day: 26, lat: 38.9072, lng: -77.0369, type: 'diplomatic', target: 'Washington DC — 15-point plan REJECTED', description: 'Iran REJECTS US 15-point plan. Issues 5 counter-conditions including Hormuz sovereignty, war reparations, protection of all proxy groups.', impact: 'Negotiations stall on maximalist demands', status: 'confirmed' },
  { date: '2026-03-25', day: 26, lat: 33.6844, lng: 73.0479, type: 'diplomatic', target: 'Islamabad, Pakistan — counter-conditions', description: 'Iran delivers 5 counter-conditions via Pakistan. Araghchi: "We want to end the war only on our own terms."', status: 'confirmed' },
  { date: '2026-03-25', day: 26, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Strait of Hormuz — sovereignty legislation', description: 'Iranian parliament pursuing legislation to codify permanent Hormuz sovereignty with transit fees. GCC confirms Iran already charging passage fees.', impact: 'Wartime blockade converting to permanent legal control', status: 'confirmed' },
  { date: '2026-03-25', day: 26, lat: 28.83, lng: 50.88, type: 'strike_israel', target: 'Bushehr nuclear complex', description: 'Israel strikes Bushehr nuclear complex. IRGC navy chief killed.', impact: 'Nuclear infrastructure targeted', status: 'confirmed' },
  { date: '2026-03-25', day: 26, lat: 33.43, lng: 43.30, type: 'strike_us', target: 'Anbar Province, Iraq — PMF strikes', description: 'US A-10 aircraft struck PMF targets in Anbar Province, killing 7 Iraqi soldiers near army medical center.', impact: 'Iraq drawn deeper into conflict', status: 'confirmed' },
  { date: '2026-03-25', day: 26, lat: 33.31, lng: 44.37, type: 'political', target: 'Baghdad — Iraq escalation', description: "Iraqi PM gives PMF 'green light for self-defense' against US strikes. Summons top US diplomat. Formal complaint of breach of international law.", impact: 'Legal basis for US Iraq presence eroding', status: 'confirmed' },
  { date: '2026-03-25', day: 26, lat: 32.65, lng: 51.68, type: 'strike_israel', target: 'Isfahan strikes', description: 'Israeli strikes continue on Isfahan military targets.', status: 'confirmed' },
  { date: '2026-03-25', day: 26, lat: 32.08, lng: 34.83, type: 'strike_iran', target: 'Bnei Brak, Israel — missile impact', description: 'Iranian missile impacts Bnei Brak area. Strikes continue on both sides despite diplomatic signals.', status: 'confirmed' },
  { date: '2026-03-25', day: 26, lat: 24.47, lng: 54.37, type: 'political', target: 'Abu Dhabi — UAE response', description: "Abu Dhabi National Oil Co. head calls Hormuz fees 'economic terrorism' — 'every nation pays the ransom at the gas pump, grocery store and pharmacy.'", status: 'confirmed' },

  // DAY 27 — Mar 26
  { date: '2026-03-26', day: 27, lat: 34.37, lng: 49.24, type: 'strike_israel', target: 'Arak heavy water reactor', description: 'Israel strikes Arak IR-40 heavy water reactor (evacuated first). IAEA later confirms reactor no longer operational.', impact: 'Nuclear infrastructure degraded', status: 'confirmed' },
  { date: '2026-03-26', day: 27, lat: 31.32, lng: 48.67, type: 'strike_israel', target: 'Khuzestan Steel, Ahvaz', description: "Israel strikes Khuzestan Steel factory near Ahvaz — partially IRGC-owned. Economic warfare targeting Iran's industrial base.", impact: 'Industrial infrastructure targeted', status: 'confirmed' },
  { date: '2026-03-26', day: 27, lat: 32.35, lng: 51.50, type: 'strike_israel', target: 'Mobarakeh Steel, Isfahan', description: 'Israel strikes Mobarakeh Steel in Isfahan — one of Iran\'s largest steel factories. IRGC-linked economic target.', impact: 'Industrial infrastructure targeted', status: 'confirmed' },
  { date: '2026-03-26', day: 27, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Hormuz — 3 ships blocked', description: 'IRGC blocks 3 container ships at Strait of Hormuz. Selective access continues.', status: 'confirmed' },
  { date: '2026-03-26', day: 27, lat: 38.9072, lng: -77.0369, type: 'political', target: 'Washington — deadline extended', description: 'Trump extends power plant strike deadline 10 days to April 6. First major de-escalation signal.', impact: 'Diplomatic window extended', status: 'confirmed' },

  // DAY 28 — Mar 27
  { date: '2026-03-27', day: 28, lat: 24.06, lng: 47.58, type: 'strike_iran', target: 'Prince Sultan Air Base, Saudi Arabia', description: '15 US service members wounded (5 critically) at Prince Sultan Air Base. Aircraft damaged. Occurred hours after Trump declared Iran "neutralized."', impact: '15 US wounded, aircraft damaged', status: 'confirmed' },
  { date: '2026-03-27', day: 28, lat: 50.45, lng: 30.52, type: 'political', target: 'Kyiv — Zelensky allegation', description: 'Zelensky claims Russia provided Iran updated satellite imagery of Prince Sultan Air Base before Iranian strike.', impact: 'Russia-Iran intelligence sharing confirmed', status: 'confirmed' },
  { date: '2026-03-27', day: 28, lat: 34.37, lng: 49.24, type: 'strike_israel', target: 'Arak — IAEA confirms destruction', description: 'IAEA confirms Arak IR-40 heavy water reactor "no longer operational" after Israeli strikes.', impact: 'War objective achieved', status: 'confirmed' },

  // DAY 29 — Mar 28
  { date: '2026-03-28', day: 29, lat: 15.35, lng: 44.21, type: 'strike_iran', target: 'Yemen — Houthis enter war', description: 'HOUTHIS ENTER WAR. First strikes on Israel from Yemen — missile + UAV toward southern Israel and Eilat. One intercepted over Red Sea.', impact: 'War expands to Red Sea theater', status: 'confirmed' },
  { date: '2026-03-28', day: 29, lat: 29.53, lng: 34.95, type: 'interception', target: 'Eilat, Israel', description: 'Houthi missile and UAV intercepted near Eilat. First Houthi strikes on Israel in this conflict.', status: 'confirmed' },
  { date: '2026-03-28', day: 29, lat: 50.80, lng: -1.10, type: 'military', target: 'UK — mine-clearing ship', description: 'UK sending RFA Lyme Bay mine-clearing ship to region. First Western mine-clearing deployment.', status: 'confirmed' },
  { date: '2026-03-28', day: 29, lat: 33.89, lng: 35.50, type: 'strike_israel', target: 'Lebanon — 3 journalists killed', description: '3 Lebanese journalists killed in Israeli strikes.', status: 'confirmed' },

  // DAY 30 — Mar 29
  { date: '2026-03-29', day: 30, lat: 33.69, lng: 73.04, type: 'diplomatic', target: 'Islamabad — 4-nation meeting', description: 'Pakistan, Saudi Arabia, Turkey, Egypt foreign ministers meet in Islamabad. Most serious multilateral diplomatic effort yet.', impact: 'Major diplomatic development', status: 'confirmed' },
  { date: '2026-03-29', day: 30, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Hormuz — Pakistan ships allowed', description: 'Iran allows 20 Pakistan-flagged ships through Hormuz (2/day). Selective access expanding as part of diplomatic engagement.', impact: 'Selective Hormuz access expanding', status: 'confirmed' },
  { date: '2026-03-29', day: 30, lat: 35.69, lng: 51.39, type: 'military', target: 'Iran — Iraq PMF deployed inside', description: "Iraq's Popular Mobilization Forces (PMF) deployed inside Iran. Iraqi militia fighting alongside Iranian forces.", impact: 'Iraq becoming active combatant', status: 'confirmed' },
  { date: '2026-03-29', day: 30, lat: 38.9072, lng: -77.0369, type: 'political', target: 'Washington — Kharg seizure discussed', description: "Trump muses about Kharg Island seizure: 'Maybe we take Kharg Island, maybe we don't. We'd have to be there for a while.'", impact: 'Ground forces in Iran discussed publicly', status: 'confirmed' },
  { date: '2026-03-29', day: 30, lat: -33.87, lng: 151.21, type: 'political', target: 'Australia — emergency measures', description: 'Australia offers free public transit in 2 states. Fuel rationing under consideration.', impact: 'Global demand destruction visible', status: 'confirmed' },

  // DAY 31 — Mar 30
  { date: '2026-03-30', day: 31, lat: 48.87, lng: 2.35, type: 'political', target: 'Paris — IEA assessment', description: 'IEA declares biggest oil shock in history. Largest supply disruption ever recorded.', impact: 'Historic oil shock confirmed', status: 'confirmed' },
  { date: '2026-03-30', day: 31, lat: 27.1832, lng: 56.2666, type: 'shipping', target: 'Hormuz — Day 31', description: 'War enters 5th week. Hormuz still effectively closed to Western shipping. Negotiations via Pakistan ongoing.', status: 'confirmed' },
];

// Insurance exclusion zone polygon (for map overlay)
export const insuranceExclusionZone = {
  name: 'P&I War Risk Exclusion Zone (effective Mar 5)',
  coordinates: [
    [22.7083, 59.9083], // Cape al-Hadd, Oman
    [25.175, 61.617],   // Iran-Pakistan border
    [27.25, 57.0],      // Northern Oman Gulf
    [27.0, 52.5],       // Central Gulf
    [29.0, 48.5],       // Kuwait
    [30.5, 48.0],       // Iraq coast
    [29.5, 50.5],       // Saudi coast
    [26.0, 50.0],       // Bahrain
    [24.5, 51.5],       // Qatar
    [24.0, 54.0],       // UAE
    [22.7083, 59.9083], // Close polygon
  ] as [number, number][],
};

// Helper to get events up to a specific day
export function getEventsThrough(day: number): ConflictEvent[] {
  return conflictEvents.filter(e => e.day <= day);
}

// Helper to get events for a specific day
export function getEventsForDay(day: number): ConflictEvent[] {
  return conflictEvents.filter(e => e.day === day);
}

export const glossaryTerms: Record<string, { term: string; definition: string; category: string }> = {
  'vlcc': {
    term: 'VLCC',
    definition: 'Very Large Crude Carrier - tankers capable of carrying 200,000+ deadweight tons of crude oil. The workhorses of global oil transport.',
    category: 'shipping',
  },
  'pni': {
    term: 'P&I Insurance',
    definition: 'Protection & Indemnity insurance - maritime liability coverage that protects shipowners against third-party claims. Without P&I, ships cannot legally operate.',
    category: 'insurance',
  },
  'hyspread': {
    term: 'HY Spread (OAS)',
    definition: 'High-Yield Option-Adjusted Spread - the yield premium investors demand for holding high-yield (junk) bonds over risk-free Treasuries. Wider spreads = higher perceived risk.',
    category: 'credit',
  },
  'refinancingwall': {
    term: 'Refinancing Wall',
    definition: 'The cluster of debt maturities coming due in a specific period. Companies that borrowed at low rates in 2020-2021 face much higher rates when refinancing in 2026-2027.',
    category: 'credit',
  },
  'zombiecompany': {
    term: 'Zombie Company',
    definition: 'A firm whose interest costs exceed its operating income - surviving only through continued access to cheap debt. Rising rates make refinancing impossible.',
    category: 'credit',
  },
  'desalination': {
    term: 'Desalination',
    definition: 'The process of removing salt from seawater to produce drinking water. GCC states depend on coastal desalination plants for 90%+ of potable water.',
    category: 'infrastructure',
  },
  'blockingposition': {
    term: 'Blocking Position',
    definition: 'In restructuring, holding enough debt to veto a plan of reorganization (typically 33%+ of a class). Iran\'s control of Hormuz gives it a "blocking position" on global energy.',
    category: 'restructuring',
  },
  'irgc': {
    term: 'IRGC',
    definition: 'Islamic Revolutionary Guard Corps - Iran\'s parallel military force responsible for asymmetric warfare, missile programs, and regional proxy operations.',
    category: 'military',
  },
  'ism': {
    term: 'ISM Prices Paid',
    definition: 'A component of the ISM Manufacturing Index measuring input price inflation. Readings above 50 indicate rising prices; 70.5 signals significant inflationary pressure.',
    category: 'macro',
  },
};
