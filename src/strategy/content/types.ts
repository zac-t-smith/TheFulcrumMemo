// Content type definitions for the strategy simulation (schema v2).
// All case text lives in case.json; this file enforces the shape.

export type Meters = { cash: number; trust: number; fit: number };

export type MeterKey = keyof Meters;

export const METER_KEYS: MeterKey[] = ["cash", "trust", "fit"];

export type Consequence = {
  title: string;
  body: string;
  meters: Meters;              // signed deltas, applied to startMeters and clamped to 0-100
  outcomeType: "real" | "modeled";
};

export type ConditionalConsequence = {
  ifFlag: string;
  consequenceOverride: Consequence;
};

export type ExpertLens = {
  rx: string;
  consulting: string;
  strategy: string;
};

export type FacilitatorNote = {
  insight: string;
  followUp: string;
  realTie?: string;
  pushback?: string;           // v2: shown in large type on ops view
  expertLens?: ExpertLens;     // v2: three-tab expert view on ops side
};

export type Option = {
  id: string;                  // v2: now strings like "r1a", "r2b"
  label: string;
  description: string;
  consequence: Consequence;
  conditional?: ConditionalConsequence[];  // v2: first matching flag wins
  setsFlags?: string[];
  facilitator: FacilitatorNote;
};

export type ConceptCard = {
  label: string;
  title: string;
  bullets: string[];
};

export type KPI = { label: string; value: string; note?: string };

export type Headline = { text: string; outlet: string; date: string };

export type ExhibitChart = {
  type: "line" | "bar" | "area";
  title?: string;
  labels: string[];
  series: { name: string; values: number[] }[];  // v2: values (was data in v1)
};

export type DeepDive = {
  title: string;
  bullets: string[];
};

export type Exhibit = {
  kpis: KPI[];
  chart: ExhibitChart;
  headlines: Headline[];
  deepDive?: DeepDive;         // v2: now {title, bullets[]}
};

export type Framework = { id: string; name: string; oneLiner: string };

export type Inject = { title: string; body: string };

export type RoleId = "cfo" | "cso" | "people" | "gc";

export type RoleIntel = Record<RoleId, string>;

export type Round = {
  id: string;                  // v2: "r1", "r2", "r3"
  title: string;
  dateLabel: string;
  concepts: ConceptCard[];
  briefing: string;
  exhibit: Exhibit;
  question: string;
  options: Option[];
  whatHappened: { title: string; body: string; date: string };
  injects: Inject[];
  roleIntel: RoleIntel;        // v2: per-role intel cards
  tradeoffPrompt: string;      // v2: label for the tradeoff submission field
};

export type AnchorTest = {
  question: string;
  highRef: string;             // v2: now a prompt string (was number)
  lowRef: string;              // v2: now a prompt string (was number)
  unit: string;
  inputMin: number;
  inputMax: number;
  answerReveal: string;
};

export type FramingTest = {
  round: number;
  question: string;
  gainText: string;
  lossText: string;
  choices: string[];           // v2: array of strings (was [{id,label}])
  answerReveal: string;
  facilitatorNote?: string;
};

export type SplitTests = { anchor: AnchorTest; framing: FramingTest };

export type Prediction = {
  id: string;
  text: string;
  check: string;               // v2: machine-checkable: anchor_gap | framing_gap | r1_majority:<id> | r3_max:<id>:<n>
};

export type QAEntry = { q: string; a: string; tags: string[] };

export type Source = { label: string; url: string };

export type RoleColor = "red" | "navy" | "amber" | "slate";

export type Role = {
  id: RoleId;
  title: string;
  focus: string;
  color: RoleColor;
};

export type CaseMeta = {
  clientAlias: string;
  realName: string;
  aliases: Record<string, string>;
  engagementTitle: string;
  objectives: string[];
  startMeters: Meters;
  meterLabels: Record<MeterKey, string>;
  disclaimer: string;
  roles: Role[];
  roleRules: string;
};

export type FinalReveal = {
  identity: string;
  closer: string;
};

export type SubmissionFieldSpec = Record<string, string>;

export type Calibration = { note: string };

export type CaseContent = {
  meta: CaseMeta;
  splitTests: SplitTests;
  frameworks: Framework[];
  rounds: Round[];
  finalReveal: FinalReveal;
  predictions: Prediction[];
  qaBank: QAEntry[];
  sources: Source[];
  submissionFields: SubmissionFieldSpec;
  calibration: Calibration;
};

// Clamp a meter value to [0,100].
export function clampMeter(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function applyMeterDelta(current: Meters, delta: Meters): Meters {
  return {
    cash: clampMeter(current.cash + delta.cash),
    trust: clampMeter(current.trust + delta.trust),
    fit: clampMeter(current.fit + delta.fit),
  };
}

// Resolve a round's consequence given active flags.
// v2 rule: first matching conditional override wins.
export function resolveConsequence(opt: Option, flags: Set<string>): Consequence {
  if (opt.conditional) {
    for (const c of opt.conditional) {
      if (flags.has(c.ifFlag)) return c.consequenceOverride;
    }
  }
  return opt.consequence;
}
