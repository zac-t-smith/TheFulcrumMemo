import type { AnswerRow, FirmRow, PlayerRow, SubmissionRow } from "../../hooks/useSession";
import type { FramingTest } from "../../content/types";

// Ops-only. Live counters for the two side-bar tests + the per-round
// submission gap. Everything is derived from the same bundle the board
// already receives — no extra queries.
export function AnswerCounts({
  round,
  firms,
  players,
  submissions,
  answers,
  framingTest,
  framingRound,
}: {
  round: number;
  firms: FirmRow[];
  players: PlayerRow[];
  submissions: SubmissionRow[];
  answers: AnswerRow[];
  framingTest: FramingTest;
  framingRound: number;
}) {
  // Diagnostic (valuation / anchor): count of distinct players with an answer,
  // mean of numeric values. Keep it cheap — this renders inside a live loop.
  const anchorAnswers = answers.filter((a) => a.test_key === "anchor");
  const anchorMean =
    anchorAnswers.length === 0
      ? null
      : anchorAnswers
          .map((a) => Number(a.value))
          .filter((n) => Number.isFinite(n))
          .reduce((s, n) => s + n, 0) / anchorAnswers.length;

  // Framing: tally choices against the known 2-way list.
  const framingAnswers = answers.filter((a) => a.test_key === "framing");
  const framingCounts = new Map<string, number>();
  for (const c of framingTest.choices) framingCounts.set(c, 0);
  for (const a of framingAnswers) {
    framingCounts.set(a.value, (framingCounts.get(a.value) ?? 0) + 1);
  }

  // Missing submissions this round: by firm, list firms with no row.
  const firmsWithSub = new Set(
    submissions.filter((s) => s.round === round).map((s) => s.firm_id)
  );
  const missingFirms = round > 0 ? firms.filter((f) => !firmsWithSub.has(f.id)) : [];

  return (
    <div className="rounded-xl border p-4 bg-card space-y-4">
      <div className="text-sm font-semibold">Live counts</div>

      <div className="grid grid-cols-2 gap-3">
        <Tile
          label="Diagnostic answers"
          value={`${anchorAnswers.length} / ${players.length}`}
          sub={anchorMean != null ? `mean ${anchorMean.toFixed(1)}` : "—"}
        />
        <Tile
          label={`Framing (R${framingRound})`}
          value={`${framingAnswers.length} / ${players.length}`}
          sub={
            framingAnswers.length
              ? Array.from(framingCounts.entries())
                  .map(([c, n]) => `${c}: ${n}`)
                  .join(" · ")
              : "—"
          }
        />
      </div>

      {round > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Haven't submitted (R{round})
          </div>
          {missingFirms.length === 0 ? (
            <div className="text-sm text-emerald-700">All firms in. ✓</div>
          ) : (
            <ul className="text-xs text-muted-foreground space-y-1">
              {missingFirms.map((f) => {
                const members = players.filter((p) => p.firm_id === f.id);
                return (
                  <li key={f.id} className="flex items-baseline justify-between gap-2">
                    <span className="truncate">
                      <span className="font-mono text-foreground mr-1">{f.code}</span>
                      {f.name}
                    </span>
                    <span className="shrink-0">
                      {members.length} member{members.length === 1 ? "" : "s"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 truncate" title={sub}>
        {sub}
      </div>
    </div>
  );
}
