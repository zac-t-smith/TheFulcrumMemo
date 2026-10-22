import { useState } from "react";
import type { FirmRow, PlayerRow, SubmissionRow } from "../../hooks/useSession";
import type { Round } from "../../content/types";

type ExpertTab = "rx" | "consulting" | "strategy";

export function FirmGrid({
  firms,
  players,
  submissions,
  round,
  roundContent,
}: {
  firms: FirmRow[];
  players: PlayerRow[];
  submissions: SubmissionRow[];
  round: number;
  roundContent?: Round;
}) {
  const [expertTab, setExpertTab] = useState<ExpertTab>("rx");

  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">
          Firms — live submissions (round {round || "—"})
        </div>
        <div className="flex gap-1">
          {(["rx", "consulting", "strategy"] as ExpertTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setExpertTab(t)}
              className={`px-2 py-1 rounded text-[11px] uppercase tracking-wide ${
                expertTab === t ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {firms.map((f) => {
          const members = players.filter((p) => p.firm_id === f.id);
          const sub = submissions.find((s) => s.firm_id === f.id && s.round === round);
          const opt = sub && roundContent?.options.find((o) => o.id === sub.option_id);
          return (
            <div
              key={f.id}
              className={`rounded-lg border p-3 ${
                members.length >= 7 ? "border-amber-500" : "border-border"
              }`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <div className="font-semibold">
                  <span className="font-mono mr-2">{f.code}</span>
                  {f.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {members.length} members {sub?.locked ? "· locked" : ""}
                </div>
              </div>
              {sub ? (
                <>
                  <div className="text-sm mb-1 font-semibold">{opt?.label}</div>
                  <div className="text-xs italic text-muted-foreground mb-1">"{sub.pitch}"</div>
                  {sub.tradeoff && (
                    <div className="text-xs text-muted-foreground mb-1">
                      <b>Tradeoff:</b> {sub.tradeoff}
                    </div>
                  )}
                  {sub.confidence != null && (
                    <div className="text-xs text-muted-foreground mb-1">
                      <b>Confidence:</b> {sub.confidence}/100
                    </div>
                  )}
                  {sub.dissent && (
                    <div className="text-xs text-muted-foreground mb-2">
                      <b>Dissent:</b> {sub.dissent}
                    </div>
                  )}
                  {opt && (
                    <div className="text-xs bg-muted/50 rounded p-2 space-y-2">
                      {opt.facilitator.pushback && (
                        <div className="text-base font-bold leading-snug text-foreground">
                          {opt.facilitator.pushback}
                        </div>
                      )}
                      <div>
                        <b>Insight:</b> {opt.facilitator.insight}
                      </div>
                      <div>
                        <b>Follow-up:</b> {opt.facilitator.followUp}
                      </div>
                      {opt.facilitator.realTie && (
                        <div>
                          <b>Real tie:</b> {opt.facilitator.realTie}
                        </div>
                      )}
                      {opt.facilitator.expertLens && (
                        <div className="pt-1 border-t border-border/40">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
                            {expertTab} lens
                          </span>
                          {opt.facilitator.expertLens[expertTab]}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-muted-foreground italic">No submission yet</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
