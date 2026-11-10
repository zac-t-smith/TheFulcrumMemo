import { useMemo, useState } from "react";
import { upsertAnswer } from "../../hooks/useFirm";
import type { PlayerIdentity } from "../../hooks/usePlayer";
import type { AnswerRow } from "../../hooks/useSession";
import type { QuizQuestion } from "../../content/types";
import {
  playerQuizAnswers,
  quizScore,
  quizTestKey,
  shuffleForPlayer,
} from "../../lib/quiz";

// One-question-per-screen quiz. Writes each answer to `answers` on tap, so
// a refresh resumes where the player left off. Option order is shuffled per
// player id (deterministic) so adjacent phones don't share answer letters.
export function QuizCard({
  quiz,
  me,
  answers,
}: {
  quiz: QuizQuestion[];
  me: PlayerIdentity;
  answers: AnswerRow[];
}) {
  const mine = useMemo(() => playerQuizAnswers(me.id, answers), [me.id, answers]);

  // Start at the first unanswered question. Resume-after-refresh for free.
  const firstUnansweredIdx = Math.max(
    0,
    quiz.findIndex((q) => !mine[q.id])
  );
  const [idx, setIdx] = useState(
    firstUnansweredIdx === -1 ? quiz.length : firstUnansweredIdx
  );
  const [picking, setPicking] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const score = useMemo(() => quizScore(me.id, answers, quiz), [me.id, answers, quiz]);

  // All done
  if (idx >= quiz.length) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">
          Knowledge check
        </div>
        <h1 className="text-2xl font-bold mb-3">
          Your score: {score.correct}/{quiz.length}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your firm's score will be revealed on the projector.
        </p>
      </div>
    );
  }

  const q = quiz[idx];
  const shuffledOptions = useMemo(
    () => shuffleForPlayer(q.options, `${me.id}:${q.id}`),
    [me.id, q.id, q.options]
  );
  const existing = mine[q.id];
  const picked = existing ?? picking;
  const revealed = Boolean(picked);
  const isRight = picked === q.correct;

  async function choose(optId: string) {
    if (picked) return; // can't re-answer in one pass
    setPicking(optId);
    setErr(null);
    try {
      await upsertAnswer(me.id, quizTestKey(q.id), optId);
    } catch (e) {
      setErr((e as Error).message);
      setPicking(null);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">
          Knowledge check
        </div>
        <div className="text-xs text-muted-foreground">
          Question {idx + 1} of {quiz.length} ·{" "}
          <span className="font-semibold text-foreground">{score.correct}</span> correct
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4 leading-snug">{q.prompt}</h2>

      <div className="space-y-2 mb-3">
        {shuffledOptions.map((o) => {
          const isPicked = picked === o.id;
          const isCorrectOpt = o.id === q.correct;
          const color = !revealed
            ? "border-border hover:border-primary/50"
            : isPicked && isRight
            ? "border-emerald-500 bg-emerald-50"
            : isPicked && !isRight
            ? "border-red-400 bg-red-50"
            : isCorrectOpt
            ? "border-emerald-500 bg-emerald-50/50"
            : "border-border opacity-60";
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              disabled={revealed}
              className={`w-full text-left rounded-lg border-2 p-3 transition ${color}`}
            >
              <div className="text-sm">{o.text}</div>
            </button>
          );
        })}
      </div>

      {err && <p className="text-xs text-red-600 mb-3">{err}</p>}

      {revealed && (
        <div
          className={`rounded-lg p-3 text-sm mb-3 ${
            isRight ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="font-semibold mb-1">
            {isRight ? "Correct" : "Not quite"}
          </div>
          <div className="text-[13px] leading-snug">{q.why}</div>
        </div>
      )}

      {revealed && (
        <button
          onClick={() => setIdx((n) => n + 1)}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-base font-semibold"
        >
          {idx + 1 === quiz.length ? "Finish" : "Next →"}
        </button>
      )}
    </div>
  );
}
