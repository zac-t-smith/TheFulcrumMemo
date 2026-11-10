import type { AnswerRow, FirmRow, PlayerRow } from "../../hooks/useSession";
import type { QuizQuestion } from "../../content/types";
import { firmQuizProgress } from "../../lib/quiz";

// Projector-side display of per-firm quiz progress. Shows the fraction
// answered without revealing scores (those come at final reveal).
export function QuizProgressBoard({
  firms,
  players,
  answers,
  quiz,
}: {
  firms: FirmRow[];
  players: PlayerRow[];
  answers: AnswerRow[];
  quiz: QuizQuestion[];
}) {
  return (
    <div>
      <h2 className="text-4xl md:text-5xl font-semibold mb-3">
        Knowledge check: on your phones
      </h2>
      <p className="text-base md:text-lg opacity-70 mb-8">
        Eight questions · scores revealed at the final reveal.
      </p>

      {firms.length === 0 ? (
        <div className="text-xl opacity-60 italic">Waiting for firms…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {firms.map((f) => {
            const p = firmQuizProgress(f.id, players, answers, quiz);
            return (
              <div
                key={f.id}
                className="rounded-xl p-5 border border-white/15 bg-white/5"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-xl font-semibold truncate">
                    <span className="font-mono text-[#E0263F] mr-2">{f.code}</span>
                    {f.name}
                  </div>
                  <div className="text-sm opacity-70 tabular-nums">
                    {p.answered} / {p.total}
                  </div>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#C8102E] transition-all"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
