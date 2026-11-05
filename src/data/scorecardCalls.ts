// Scorecard: the 13 calls made across the Iran series, pulled from the
// audit of Nov 4, 2026 (AUDIT_IRAN_SERIES.md). Each entry carries only
// the original claim and where/when it was made. Outcome + grade are
// placeholders — Zac writes the honest post-mortem.

export type ScorecardGrade =
  | 'validated'
  | 'validated-directional'  // direction right, magnitude or timing off
  | 'partial'
  | 'overcalled'
  | 'wrong'
  | 'unverified'
  | 'open';

export type ScorecardCall = {
  id: string;
  call: string;
  sourcePage: string;       // e.g. "Day 58", "Part II", "Shadow Partner"
  sourceDate: string;       // ISO-ish date of the call (or the memo date)
  sourceHref?: string;      // internal link where the call lives
  initialConfidence?: number; // 0-100 if recorded at the time
  outcomePlaceholder?: string; // ZAC TO WRITE
  gradePlaceholder?: ScorecardGrade; // ZAC TO SET
};

export const scorecardCalls: ScorecardCall[] = [
  {
    id: 'protracted-attrition',
    call: 'Protracted Attrition is the base case: the war does not resolve in weeks; the pattern of claims → denials → continued strikes holds.',
    sourcePage: 'Day 58 (field note)',
    sourceDate: '2026-04-26',
    sourceHref: '/field-notes/58',
    initialConfidence: 95,
  },
  {
    id: 'hormuz-permanent',
    call: 'Iran goes PERMANENT on Hormuz: Nikzad’s "under no circumstances return to previous state" codifies permanent sovereignty at leadership level.',
    sourcePage: 'Day 58 (field note)',
    sourceDate: '2026-04-26',
    sourceHref: '/field-notes/58',
    initialConfidence: 90,
  },
  {
    id: 'part-ii-restructuring-cycle',
    call: 'The Part II restructuring cycle is firing — HY spread widening + supply-chain disruption + margin compression + refi wall = more distressed advisory work than any point since 2008–09.',
    sourcePage: 'Part II',
    sourceDate: '2026-04-25',
    sourceHref: '/memos/iran-part-ii',
    initialConfidence: 98,
  },
  {
    id: 'diplomatic-channel-damaged',
    call: 'The diplomatic channel is damaged: Larijani killed (D18), Kharazi wounded (D33), no credible Iranian interlocutor remaining.',
    sourcePage: 'Day 58 (field note)',
    sourceDate: '2026-04-26',
    sourceHref: '/field-notes/58',
    initialConfidence: 80,
  },
  {
    id: 'russia-intel-pipeline',
    call: 'Russia–Iran intelligence sharing is operational — satellite imagery pipeline for the Prince Sultan strike (Zelensky confirmation, 2026-03-27).',
    sourcePage: 'Shadow Partner',
    sourceDate: '2026-04-25',
    sourceHref: '/memos/shadow-partner',
    initialConfidence: 90,
  },
  {
    id: 'coalition-fracturing',
    call: 'The coalition is fracturing: UK stays out, Austria rejects overflights, only Israel + GCC actively supporting operations.',
    sourcePage: 'Day 58 (field note)',
    sourceDate: '2026-04-26',
    sourceHref: '/field-notes/58',
    initialConfidence: 85,
  },
  {
    id: 'iraq-drawn-in',
    call: 'Iraq is drawn into the conflict — PMF deployed inside Iran, fighting alongside IRGC.',
    sourcePage: 'Day 58 (field note)',
    sourceDate: '2026-04-26',
    sourceHref: '/field-notes/58',
    initialConfidence: 90,
  },
  {
    id: 'april-worse-than-march',
    call: 'April will be worse than March — IEA has lost 12M bpd, more than two prior oil crises combined, worst energy crisis in history.',
    sourcePage: 'Day 58 (field note)',
    sourceDate: '2026-04-26',
    sourceHref: '/field-notes/58',
    initialConfidence: 95,
  },
  {
    id: 'great-powers-shaping',
    call: 'Great-power involvement expands — China and Russia actively calling for ceasefire; they shape the outcome rather than watch from the sidelines.',
    sourcePage: 'Day 58 (field note)',
    sourceDate: '2026-04-26',
    sourceHref: '/field-notes/58',
    initialConfidence: 80,
  },
  {
    id: 'midterms-political-clock',
    call: 'US midterms are the asymmetric political clock — Iran’s interim council has no election cycle; Trump faces midterms with rising gas prices, US casualties, and an unauthorized war.',
    sourcePage: 'Part II',
    sourceDate: '2026-04-25',
    sourceHref: '/memos/iran-part-ii',
  },
  {
    id: 'credit-stressed-to-distressed',
    call: 'Credit cycle catalyst: HY spreads entered the conflict at historic lows (310 bps vs. 525 bps 30-year average). Oil shock + inflation + consumer compression = the trigger that moves overleveraged sectors from stressed to distressed.',
    sourcePage: 'Part II',
    sourceDate: '2026-04-25',
    sourceHref: '/memos/iran-part-ii',
  },
  {
    id: 'insurance-leverage',
    call: 'Strait of Hormuz is sealed by insurance withdrawal (Lloyd’s P&I), not a naval blockade — the structural weapon runs through the reinsurance market.',
    sourcePage: 'Part I',
    sourceDate: '2026-04-25',
    sourceHref: '/memos/iran',
  },
  {
    id: 'sovereign-distressed-play',
    call: 'The conflict is a sovereign-level distressed asset play: Venezuela acquired at $60 Brent with US operational control, tariffs pre-positioned with every major energy-importing ally before Hormuz closed, US holds the only major relief valve.',
    sourcePage: 'Part III',
    sourceDate: '2026-04-25',
    sourceHref: '/memos/iran-part-iii',
  },
];
