// Machine-checkable prediction evaluator.
// Supported checks:
//   anchor_gap          — true if "high" anchor group's mean estimate > "low" group's mean
//   framing_gap         — true if gain-framed "Approve" rate > loss-framed "Approve" rate
//   r1_majority:<optId> — true if the plurality R1 pick equals optId
//   r3_max:<optId>:<n>  — true if at most n firms picked optId in R3

import type { AnswerRow, PlayerRow, SubmissionRow } from "../hooks/useSession";

export type PredictionResult = {
  ok: boolean;
  detail: string;
};

export function evaluatePrediction(
  check: string,
  ctx: {
    answers: AnswerRow[];
    players: PlayerRow[];
    submissions: SubmissionRow[];
  }
): PredictionResult {
  const { answers, players, submissions } = ctx;

  if (check === "anchor_gap") {
    const groupMean = (g: "high" | "low") => {
      const ids = new Set(players.filter((p) => p.anchor_group === g).map((p) => p.id));
      const vals = answers
        .filter((a) => a.test_key === "anchor" && ids.has(a.player_id))
        .map((a) => Number(a.value))
        .filter((n) => Number.isFinite(n));
      if (!vals.length) return NaN;
      return vals.reduce((s, v) => s + v, 0) / vals.length;
    };
    const hi = groupMean("high");
    const lo = groupMean("low");
    if (Number.isNaN(hi) || Number.isNaN(lo)) {
      return { ok: false, detail: `Not enough answers (high=${isNaN(hi) ? "—" : hi.toFixed(2)}, low=${isNaN(lo) ? "—" : lo.toFixed(2)})` };
    }
    return {
      ok: hi > lo,
      detail: `High-anchor mean ${hi.toFixed(2)} vs. low-anchor mean ${lo.toFixed(2)}`,
    };
  }

  if (check === "framing_gap") {
    const groupApproveRate = (g: "gain" | "loss") => {
      const ids = new Set(players.filter((p) => p.framing_group === g).map((p) => p.id));
      const vals = answers.filter((a) => a.test_key === "framing" && ids.has(a.player_id));
      if (!vals.length) return NaN;
      const approve = vals.filter((a) => /approve/i.test(a.value)).length;
      return approve / vals.length;
    };
    const gain = groupApproveRate("gain");
    const loss = groupApproveRate("loss");
    if (Number.isNaN(gain) || Number.isNaN(loss)) {
      return { ok: false, detail: "Not enough framing answers" };
    }
    return {
      ok: gain > loss,
      detail: `Gain-framed approve ${(gain * 100).toFixed(0)}% vs. loss-framed approve ${(loss * 100).toFixed(0)}%`,
    };
  }

  const m1 = check.match(/^r(\d+)_majority:(.+)$/);
  if (m1) {
    const round = Number(m1[1]);
    const optId = m1[2];
    const subs = submissions.filter((s) => s.round === round);
    const counts: Record<string, number> = {};
    for (const s of subs) counts[s.option_id] = (counts[s.option_id] ?? 0) + 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0]?.[0];
    return {
      ok: winner === optId,
      detail: subs.length
        ? `R${round} picks: ${sorted.map(([k, v]) => `${k}:${v}`).join(", ")}; predicted ${optId}`
        : `No R${round} submissions`,
    };
  }

  const m2 = check.match(/^r(\d+)_max:(.+):(\d+)$/);
  if (m2) {
    const round = Number(m2[1]);
    const optId = m2[2];
    const cap = Number(m2[3]);
    const n = submissions.filter((s) => s.round === round && s.option_id === optId).length;
    return {
      ok: n <= cap,
      detail: `${n} firms picked ${optId} in R${round} (predicted ≤ ${cap})`,
    };
  }

  return { ok: false, detail: `Unknown check: ${check}` };
}
