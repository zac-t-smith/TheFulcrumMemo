// Firm-level scorecard derivations for the Final-reveal stage.
// Pure: no I/O. Inputs are the useSession bundle + case content.

import type { AnswerRow, FirmRow, PlayerRow, SubmissionRow } from "../hooks/useSession";
import type { CaseContent, QuizQuestion } from "../content/types";
import { firmQuizPct } from "./quiz";

export type Verdict =
  | "Calibrated"
  | "Right, but unsure"
  | "Overconfident"
  | "Saw the risk"
  | "Mixed";

export const VERDICT_SUBTITLE: Record<Verdict, string> = {
  Calibrated: "Right call, right confidence.",
  "Right, but unsure": "The call held up; the hedge didn't need to.",
  Overconfident: "Spirit's board was sure too.",
  "Saw the risk": "The dissent you noted was the one that mattered.",
  Mixed: "Some calls landed; some didn't.",
};

export type FirmScore = {
  firm: FirmRow;
  picks: Array<{ round: number; optionLabel: string | null }>;
  totalMeter: number;         // sum of meter deltas across R1-R3 (cash+trust+fit)
  perRoundDelta: number[];    // signed total delta per round
  avgConfidence: number | null;
  quizPct: number | null;
  verdict: Verdict;
  verdictSubtitle: string;
};

function verdictFor(total: number, avgConf: number | null, perRound: number[]): Verdict {
  const positives = perRound.filter((d) => d > 0).length;
  const negatives = perRound.filter((d) => d < 0).length;
  const mixed = positives > 0 && negatives > 0 && Math.abs(total) <= 15;
  if (mixed) return "Mixed";
  const good = total > 0;
  const high = (avgConf ?? 0) >= 65;
  if (good && high) return "Calibrated";
  if (good && !high) return "Right, but unsure";
  if (!good && high) return "Overconfident";
  return "Saw the risk";
}

export function computeFirmScores(args: {
  firms: FirmRow[];
  players: PlayerRow[];
  submissions: SubmissionRow[];
  answers: AnswerRow[];
  content: CaseContent;
  quiz: QuizQuestion[];
}): FirmScore[] {
  const { firms, players, submissions, answers, content, quiz } = args;

  const rows: FirmScore[] = firms.map((f) => {
    const subs = submissions
      .filter((s) => s.firm_id === f.id)
      .sort((a, b) => a.round - b.round);

    const flags = new Set<string>();
    let total = 0;
    const perRound: number[] = [];
    const picks: Array<{ round: number; optionLabel: string | null }> = [];

    for (let round = 1; round <= content.rounds.length; round++) {
      const rc = content.rounds[round - 1];
      const sub = subs.find((s) => s.round === round);
      if (!sub) {
        picks.push({ round, optionLabel: null });
        perRound.push(0);
        continue;
      }
      const opt = rc.options.find((o) => o.id === sub.option_id);
      picks.push({ round, optionLabel: opt?.label ?? null });
      if (!opt) {
        perRound.push(0);
        continue;
      }
      const override = opt.conditional?.find((c) => flags.has(c.ifFlag));
      const cons = override ? override.consequenceOverride : opt.consequence;
      const delta = cons.meters.cash + cons.meters.trust + cons.meters.fit;
      total += delta;
      perRound.push(delta);
      opt.setsFlags?.forEach((fl) => flags.add(fl));
    }

    const confs = subs
      .map((s) => s.confidence)
      .filter((c): c is number => typeof c === "number");
    const avgConf = confs.length ? confs.reduce((s, x) => s + x, 0) / confs.length : null;

    const quizPct = firmQuizPct(f.id, players, answers, quiz);

    const verdict = verdictFor(total, avgConf, perRound);

    return {
      firm: f,
      picks,
      totalMeter: total,
      perRoundDelta: perRound,
      avgConfidence: avgConf,
      quizPct,
      verdict,
      verdictSubtitle: VERDICT_SUBTITLE[verdict],
    };
  });

  rows.sort((a, b) => {
    if (b.totalMeter !== a.totalMeter) return b.totalMeter - a.totalMeter;
    const aq = a.quizPct ?? -1;
    const bq = b.quizPct ?? -1;
    return bq - aq;
  });

  return rows;
}
