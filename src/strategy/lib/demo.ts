// Offline demo driver: implements the same shape the real Supabase hooks return,
// but runs entirely in-memory. Triggered by ?demo=1 on /strategy.

import { Phase, PHASE_ORDER, DEFAULT_TIMER } from "./phases";
import { seededRng, pick } from "./rng";
import caseContent from "../content/case.json";
import type { CaseContent } from "../content/types";

const content = caseContent as CaseContent;

export type DemoSession = {
  id: string;
  code: string;
  phase: Phase;
  round: number;
  phase_started_at: string;
  timer_seconds: number;
  prediction_hash: string | null;
  prediction_text: string | null;
};

export type DemoFirm = { id: string; name: string; code: string; member_count: number };
export type DemoPlayer = {
  id: string;
  firm_id: string;
  display_name: string;
  anchor_group: "high" | "low";
  framing_group: "gain" | "loss";
  role: "cfo" | "cso" | "people" | "gc";
};
export type DemoSubmission = {
  firm_id: string;
  round: number;
  option_id: string;
  pitch: string;
  framework_tag: string;
  tradeoff: string | null;
  confidence: number | null;
  dissent: string | null;
  submitted_by: string;
  locked: boolean;
};
export type DemoInject = { id: string; title: string; body: string; round: number; created_at: string };
export type DemoAnswer = { player_id: string; test_key: string; value: string };

export type DemoState = {
  session: DemoSession;
  firms: DemoFirm[];
  players: DemoPlayer[];
  submissions: DemoSubmission[];
  injects: DemoInject[];
  answers: DemoAnswer[];
};

type Listener = (s: DemoState) => void;

const FIRM_NAMES = [
  "Keystone Capital",
  "Harbor Advisory",
  "Ironside Partners",
  "North Peak",
  "Lantern Group",
];

export function createDemoDriver(seed = 42) {
  const rand = seededRng(seed);
  const state: DemoState = {
    session: {
      id: "demo",
      code: "DEMO",
      phase: "lobby",
      round: 0,
      phase_started_at: new Date().toISOString(),
      timer_seconds: 0,
      prediction_hash: null,
      prediction_text: null,
    },
    firms: FIRM_NAMES.map((name, i) => ({
      id: `f${i}`,
      name,
      code: ["ALP", "BRV", "CDR", "DLT", "ECH"][i],
      member_count: 4,
    })),
    players: [],
    submissions: [],
    injects: [],
    answers: [],
  };

  // Populate 4 synthetic members per firm (round-robin roles)
  const roleOrder: DemoPlayer["role"][] = ["cfo", "cso", "people", "gc"];
  state.firms.forEach((f, fi) => {
    for (let j = 0; j < 4; j++) {
      state.players.push({
        id: `p${fi}-${j}`,
        firm_id: f.id,
        display_name: `Student ${fi * 4 + j + 1}`,
        anchor_group: (fi * 4 + j) % 2 === 0 ? "high" : "low",
        framing_group: (fi * 4 + j) % 2 === 0 ? "gain" : "loss",
        role: roleOrder[j],
      });
    }
  });

  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((l) => l({ ...state }));

  function advance(target: Phase) {
    state.session.phase = target;
    state.session.phase_started_at = new Date().toISOString();
    state.session.timer_seconds = DEFAULT_TIMER[target];
    const m = target.match(/_(\d)$/);
    if (m) state.session.round = Number(m[1]);
    // On entering any decide_* phase, auto-populate submissions for firms
    if (target.startsWith("decide_")) {
      const round = Number(m![1]);
      const options = content.rounds[round - 1].options;
      state.submissions = state.submissions.filter((s) => s.round !== round);
      state.firms.forEach((f) => {
        const o = pick(rand, options);
        state.submissions.push({
          firm_id: f.id,
          round,
          option_id: o.id,
          pitch: `We favor ${o.label.toLowerCase()} because the unit economics support it.`,
          framework_tag: pick(rand, content.frameworks).id,
          tradeoff: "We accept the regulatory risk because the premium is real.",
          confidence: 40 + Math.floor(rand() * 50),
          dissent: null,
          submitted_by: state.players.find((p) => p.firm_id === f.id)?.id ?? "",
          locked: false,
        });
      });
    }
    emit();
  }

  return {
    getState: () => ({ ...state }),
    subscribe(fn: Listener) {
      listeners.add(fn);
      fn({ ...state });
      return () => listeners.delete(fn);
    },
    advance,
    next() {
      const i = PHASE_ORDER.indexOf(state.session.phase);
      if (i < PHASE_ORDER.length - 1) advance(PHASE_ORDER[i + 1]);
    },
    back() {
      const i = PHASE_ORDER.indexOf(state.session.phase);
      if (i > 0) advance(PHASE_ORDER[i - 1]);
    },
    setPredictionHash(hash: string) {
      state.session.prediction_hash = hash;
      emit();
    },
    revealPrediction(text: string) {
      state.session.prediction_text = text;
      emit();
    },
    fireInject(title: string, body: string) {
      state.injects.push({
        id: `i${state.injects.length}`,
        title,
        body,
        round: state.session.round,
        created_at: new Date().toISOString(),
      });
      emit();
    },
  };
}

export type DemoDriver = ReturnType<typeof createDemoDriver>;
