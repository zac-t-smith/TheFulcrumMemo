import type { FirmScore, Verdict } from "../../lib/scorecard";

// Firm scorecard for Final reveal. One row per firm, sorted by meter total.
// Styled for the projector (dark background, serif).

const VERDICT_STYLE: Record<Verdict, { chip: string; text: string }> = {
  Calibrated: { chip: "bg-emerald-500/30 border-emerald-400 text-emerald-100", text: "text-emerald-200" },
  "Right, but unsure": { chip: "bg-sky-500/20 border-sky-400 text-sky-100", text: "text-sky-200" },
  Overconfident: { chip: "bg-amber-500/25 border-amber-400 text-amber-100", text: "text-amber-200" },
  "Saw the risk": { chip: "bg-indigo-500/25 border-indigo-400 text-indigo-100", text: "text-indigo-200" },
  Mixed: { chip: "bg-white/10 border-white/40 text-white", text: "text-white/80" },
};

export function FirmScorecard({ scores }: { scores: FirmScore[] }) {
  if (scores.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs uppercase tracking-widest opacity-60 mb-3">
        Firm scorecard — the room's decisions
      </div>
      <div className="grid gap-2">
        {scores.map((s) => {
          const vs = VERDICT_STYLE[s.verdict];
          return (
            <div
              key={s.firm.id}
              className="grid grid-cols-12 gap-3 items-center rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
            >
              <div className="col-span-3 min-w-0">
                <div className="truncate text-sm font-semibold">
                  <span className="font-mono text-[#E0263F] mr-2">{s.firm.code}</span>
                  {s.firm.name}
                </div>
              </div>
              <div className="col-span-4 min-w-0">
                <div className="flex gap-2 text-[11px] opacity-80">
                  {s.picks.map((p) => (
                    <span
                      key={p.round}
                      className="truncate px-2 py-0.5 rounded bg-white/5 border border-white/10"
                      title={p.optionLabel ?? "no submission"}
                    >
                      R{p.round}: {shortLabel(p.optionLabel)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-1 text-right text-xs tabular-nums">
                <span className={s.totalMeter >= 0 ? "text-emerald-300" : "text-red-300"}>
                  {s.totalMeter > 0 ? "+" : ""}
                  {s.totalMeter}
                </span>
              </div>
              <div className="col-span-1 text-right text-xs tabular-nums opacity-80">
                {s.avgConfidence != null ? Math.round(s.avgConfidence) : "—"}
              </div>
              <div className="col-span-1 text-right text-xs tabular-nums opacity-80">
                {s.quizPct != null ? `${s.quizPct}%` : "—"}
              </div>
              <div className="col-span-2 text-right">
                <div className={`inline-block text-[10px] uppercase tracking-widest border rounded-full px-2 py-0.5 ${vs.chip}`}>
                  {s.verdict}
                </div>
                <div className={`text-[10px] mt-1 ${vs.text}`}>{s.verdictSubtitle}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-12 gap-3 mt-3 text-[9px] uppercase tracking-widest opacity-50">
        <div className="col-span-3">Firm</div>
        <div className="col-span-4">Picks</div>
        <div className="col-span-1 text-right">ΔMeter</div>
        <div className="col-span-1 text-right">Conf</div>
        <div className="col-span-1 text-right">Quiz</div>
        <div className="col-span-2 text-right">Verdict</div>
      </div>
    </div>
  );
}

function shortLabel(label: string | null): string {
  if (!label) return "—";
  // Trim to a couple of words so three chips fit on one line on the projector.
  return label.replace(/[:—-].*$/, "").split(/\s+/).slice(0, 3).join(" ");
}
