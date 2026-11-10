import type { FirmMemoRow } from "../../hooks/useFirmMemos";
import type { FirmRow, SubmissionRow } from "../../hooks/useSession";

// Debrief showcase: shows the highest-ranked firm memo of the session in a
// large Fulcrum-styled card. Quotes two best student pitches (longest, most
// descriptive) from the firm's three submissions.
export function CaseStudyShowcase({
  memos,
  firms,
  submissions,
  loading,
}: {
  memos: FirmMemoRow[];
  firms: FirmRow[];
  submissions: SubmissionRow[];
  loading: boolean;
}) {
  if (loading && memos.length === 0) {
    return (
      <div className="text-center mt-24">
        <h2 className="text-5xl font-semibold mb-4">Thank you.</h2>
        <p className="text-xl opacity-80 italic">Writing your case studies…</p>
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <div className="text-center mt-24">
        <h2 className="text-5xl font-semibold mb-4">Thank you.</h2>
        <p className="text-xl opacity-80">Open your firm's case study on your phone.</p>
      </div>
    );
  }

  const ranked = [...memos].sort((a, b) => {
    const as = a.memo_json.overall_score ?? -1;
    const bs = b.memo_json.overall_score ?? -1;
    if (bs !== as) return bs - as;
    const am = a.memo_json.verdict?.total_meter ?? -999;
    const bm = b.memo_json.verdict?.total_meter ?? -999;
    return bm - am;
  });
  const top = ranked[0];
  const topFirm = firms.find((f) => f.id === top.firm_id);
  const topSubs = submissions
    .filter((s) => s.firm_id === top.firm_id)
    .sort((a, b) => a.round - b.round);
  const quotes = pickBestQuotes(topSubs, 2);

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.4em] text-[#E0263F] mb-3">
        Case study of the day
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold mb-6">Thank you.</h2>

      <div className="rounded-2xl border-l-8 border-[#C8102E] bg-white/5 p-8 md:p-10">
        <div className="flex flex-wrap items-baseline gap-4 mb-3">
          <div className="text-xs uppercase tracking-[0.3em] opacity-70">
            {topFirm ? (
              <>
                <span className="font-mono text-[#E0263F] mr-2">{topFirm.code}</span>
                {topFirm.name}
              </>
            ) : (
              "Top memo"
            )}
          </div>
          {top.memo_json.verdict && (
            <span className="text-[10px] uppercase tracking-widest border border-[#C8102E] text-[#E0263F] rounded-full px-3 py-0.5">
              {top.memo_json.verdict.label}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest bg-[#C8102E] text-white rounded-full px-3 py-0.5">
            Grade {top.grade_json.overall_letter}
          </span>
        </div>
        <h3 className="text-3xl md:text-4xl font-semibold leading-tight mb-3">
          {top.memo_json.title}
        </h3>
        <p className="text-lg md:text-xl opacity-80 italic mb-5">{top.memo_json.dek}</p>
        <p className="text-base md:text-lg leading-relaxed mb-5">
          {top.memo_json.executive_summary}
        </p>

        {quotes.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5 mt-5">
            {quotes.map((q, i) => (
              <blockquote
                key={i}
                className="rounded-lg bg-white/[0.04] border-l-4 border-[#E0263F] px-4 py-3 text-sm md:text-base"
              >
                "{q.text}"
                <div className="text-[10px] uppercase tracking-widest opacity-60 mt-2">
                  Round {q.round}
                </div>
              </blockquote>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-lg md:text-xl opacity-80 mt-8">
        Every firm's case study is on your phone now.
      </p>
    </div>
  );
}

function pickBestQuotes(
  subs: SubmissionRow[],
  n: number
): Array<{ text: string; round: number }> {
  const candidates = subs
    .filter((s) => (s.pitch?.trim().length ?? 0) > 20)
    .map((s) => ({ text: s.pitch.trim(), round: s.round, score: s.pitch.trim().length }));
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, n).sort((a, b) => a.round - b.round);
}
