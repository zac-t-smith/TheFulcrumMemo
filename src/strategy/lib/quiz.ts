// Knowledge-check quiz helpers. All functions are pure and derive from the
// existing `answers` rows (test_key = "quiz_<question_id>", value = option_id).
// No new tables, no new RPCs — plays on the same path as AnchorCard.

import type { AnswerRow, PlayerRow } from "../hooks/useSession";
import type { QuizQuestion } from "../content/types";

export function quizTestKey(questionId: string): string {
  return `quiz_${questionId}`;
}

// Deterministic Fisher-Yates using a tiny string-seeded LCG. Keeps option
// order stable per player across refreshes while still varying by player
// (prevents copying answers across phones).
function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function shuffleForPlayer<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let s = hashSeed(seed) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Answers a player has already locked in. Keyed by question id.
export function playerQuizAnswers(
  playerId: string,
  answers: AnswerRow[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of answers) {
    if (a.player_id !== playerId || !a.test_key.startsWith("quiz_")) continue;
    out[a.test_key.slice("quiz_".length)] = a.value;
  }
  return out;
}

export function quizScore(
  playerId: string,
  answers: AnswerRow[],
  quiz: QuizQuestion[]
): { correct: number; answered: number; pctOfAnswered: number } {
  const a = playerQuizAnswers(playerId, answers);
  let correct = 0;
  let answered = 0;
  for (const q of quiz) {
    const v = a[q.id];
    if (!v) continue;
    answered++;
    if (v === q.correct) correct++;
  }
  return {
    correct,
    answered,
    pctOfAnswered: answered ? Math.round((correct / answered) * 100) : 0,
  };
}

// Firm % correct — average of member %s, counting only members who answered
// at least one question. Returns null if no member has answered anything.
export function firmQuizPct(
  firmId: string,
  players: PlayerRow[],
  answers: AnswerRow[],
  quiz: QuizQuestion[]
): number | null {
  const members = players.filter((p) => p.firm_id === firmId);
  const scored = members
    .map((m) => quizScore(m.id, answers, quiz))
    .filter((s) => s.answered > 0);
  if (!scored.length) return null;
  const total = scored.reduce((s, x) => s + x.pctOfAnswered, 0);
  return Math.round(total / scored.length);
}

export type ConceptResult = { concept: string; correct: number; total: number; pct: number };

// Per-concept % correct for a firm, aggregated across members.
export function conceptResults(
  firmId: string,
  players: PlayerRow[],
  answers: AnswerRow[],
  quiz: QuizQuestion[]
): ConceptResult[] {
  const members = players.filter((p) => p.firm_id === firmId);
  const memberIds = new Set(members.map((m) => m.id));
  const byConcept = new Map<string, { correct: number; total: number }>();
  for (const q of quiz) byConcept.set(q.concept, { correct: 0, total: 0 });
  for (const a of answers) {
    if (!a.test_key.startsWith("quiz_")) continue;
    if (!memberIds.has(a.player_id)) continue;
    const qid = a.test_key.slice("quiz_".length);
    const q = quiz.find((x) => x.id === qid);
    if (!q) continue;
    const row = byConcept.get(q.concept)!;
    row.total++;
    if (a.value === q.correct) row.correct++;
  }
  return quiz
    .map((q) => q.concept)
    .filter((c, i, a) => a.indexOf(c) === i) // unique, preserve order
    .map((concept) => {
      const r = byConcept.get(concept)!;
      return {
        concept,
        correct: r.correct,
        total: r.total,
        pct: r.total ? Math.round((r.correct / r.total) * 100) : 0,
      };
    });
}

// Firm progress for the board: answered count out of (members * quiz.length).
export function firmQuizProgress(
  firmId: string,
  players: PlayerRow[],
  answers: AnswerRow[],
  quiz: QuizQuestion[]
): { answered: number; total: number; pct: number } {
  const members = players.filter((p) => p.firm_id === firmId);
  const memberIds = new Set(members.map((m) => m.id));
  const total = members.length * quiz.length;
  let answered = 0;
  for (const a of answers) {
    if (!a.test_key.startsWith("quiz_")) continue;
    if (memberIds.has(a.player_id)) answered++;
  }
  return { answered, total, pct: total ? Math.round((answered / total) * 100) : 0 };
}
