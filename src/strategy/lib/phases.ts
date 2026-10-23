export type Phase =
  | "lobby"
  | "kickoff"
  | "anchor_test"
  | "teach_1"
  | "decide_1"
  | "reveal_1"
  | "teach_2"
  | "decide_2"
  | "reveal_2"
  | "teach_3"
  | "decide_3"
  | "reveal_3"
  | "final_reveal"
  | "done";

export const PHASE_ORDER: Phase[] = [
  "lobby",
  "kickoff",
  "anchor_test",
  "teach_1",
  "decide_1",
  "reveal_1",
  "teach_2",
  "decide_2",
  "reveal_2",
  "teach_3",
  "decide_3",
  "reveal_3",
  "final_reveal",
  "done",
];

export const PHASE_LABEL: Record<Phase, string> = {
  lobby: "Lobby — forming firms",
  kickoff: "Kickoff — the engagement",
  anchor_test: "Diagnostic — valuation anchor",
  teach_1: "Round 1 — teaching",
  decide_1: "Round 1 — decide",
  reveal_1: "Round 1 — reveal",
  teach_2: "Round 2 — teaching",
  decide_2: "Round 2 — decide",
  reveal_2: "Round 2 — reveal",
  teach_3: "Round 3 — teaching",
  decide_3: "Round 3 — decide",
  reveal_3: "Round 3 — reveal",
  final_reveal: "Final reveal",
  done: "Debrief",
};

export const DEFAULT_TIMER: Record<Phase, number> = {
  lobby: 0,
  kickoff: 90,
  anchor_test: 60,
  teach_1: 120,
  decide_1: 180,
  reveal_1: 120,
  teach_2: 120,
  decide_2: 180,
  reveal_2: 120,
  teach_3: 120,
  decide_3: 180,
  reveal_3: 120,
  final_reveal: 300,
  done: 0,
};

export function phaseRound(p: Phase): number | null {
  const m = p.match(/_(\d)$/);
  return m ? Number(m[1]) : null;
}

export function phaseKind(p: Phase): "teach" | "decide" | "reveal" | "other" {
  if (p.startsWith("teach_")) return "teach";
  if (p.startsWith("decide_")) return "decide";
  if (p.startsWith("reveal_")) return "reveal";
  return "other";
}

export function nextPhase(p: Phase): Phase | null {
  const i = PHASE_ORDER.indexOf(p);
  return i >= 0 && i < PHASE_ORDER.length - 1 ? PHASE_ORDER[i + 1] : null;
}

export function prevPhase(p: Phase): Phase | null {
  const i = PHASE_ORDER.indexOf(p);
  return i > 0 ? PHASE_ORDER[i - 1] : null;
}

export function isAdjacent(from: Phase, to: Phase): boolean {
  return nextPhase(from) === to || prevPhase(from) === to;
}
