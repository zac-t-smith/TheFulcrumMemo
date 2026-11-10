import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { getSupabase, supabaseConfigured } from "../lib/supabase";

type MemoRound = {
  round: number;
  our_call: string;
  our_reasoning: string;
  what_actually_happened: string;
  what_we_would_change: string;
};

type MemoJson = {
  title: string;
  dek: string;
  executive_summary: string;
  rounds: MemoRound[];
  lessons: Array<{ concept: string; lesson: string }>;
};

type ConceptScore = {
  id: string;
  title: string;
  score: 1 | 2 | 3 | 4;
  evidence: string;
};

type GradeJson = {
  concepts: ConceptScore[];
  overall_letter: "A" | "A-" | "B+" | "B";
  overall_note: string;
};

type MemoRow = {
  id: string;
  firm_id: string;
  session_id: string;
  memo_json: MemoJson;
  grade_json: GradeJson;
  created_at: string;
};

type FirmRow = { id: string; code: string; name: string };

export default function FirmMemoPage() {
  const { firmId = "" } = useParams();
  const [row, setRow] = useState<MemoRow | null>(null);
  const [firm, setFirm] = useState<FirmRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!firmId || !supabaseConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const sb = getSupabase();
        const [memoRes, firmRes] = await Promise.all([
          sb
            .from("firm_memos")
            .select("*")
            .eq("firm_id", firmId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          sb.from("firms").select("id,code,name").eq("id", firmId).maybeSingle(),
        ]);
        if (cancelled) return;
        if (memoRes.error) throw memoRes.error;
        if (firmRes.error) throw firmRes.error;
        setRow((memoRes.data as MemoRow | null) ?? null);
        setFirm((firmRes.data as FirmRow | null) ?? null);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firmId]);

  if (!supabaseConfigured) return <Shell><p>Backend not configured.</p></Shell>;
  if (loading) return <Shell><p>Loading case study…</p></Shell>;
  if (err) return <Shell><p className="text-red-700">Error: {err}</p></Shell>;
  if (!row) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold mb-2">Your case study isn't ready yet.</h1>
        <p className="opacity-80">
          The facilitator will generate memos after the Final reveal. Refresh in a minute.
        </p>
      </Shell>
    );
  }

  const memo = row.memo_json;
  const grade = row.grade_json;

  return (
    <Shell>
      <Helmet>
        <title>{memo.title} — Falcon case study</title>
      </Helmet>
      <PrintStyles />

      {/* Masthead */}
      <header className="masthead">
        <div className="masthead-kicker">The Fulcrum Memo · Case study</div>
        <div className="masthead-sub">
          {firm ? (
            <>
              <span className="code">{firm.code}</span> {firm.name}
            </>
          ) : (
            "Firm memo"
          )}{" "}
          · Generated {new Date(row.created_at).toLocaleString()}
        </div>
      </header>

      <h1 className="memo-title">{memo.title}</h1>
      <p className="memo-dek">{memo.dek}</p>

      <section className="exec-summary">
        <div className="exec-kicker">Executive summary</div>
        <p>{memo.executive_summary}</p>
      </section>

      <section>
        <h2 className="section-head">Decision timeline</h2>
        <ol className="timeline">
          {memo.rounds.map((r) => (
            <li key={r.round}>
              <div className="round-label">Round {r.round}</div>
              <div className="round-grid">
                <RoundRow label="Our call" body={r.our_call} />
                <RoundRow label="Our reasoning" body={r.our_reasoning} />
                <RoundRow label="What actually happened" body={r.what_actually_happened} />
                <RoundRow label="What we'd change" body={r.what_we_would_change} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="section-head">Lessons tied to course concepts</h2>
        <ul className="lessons">
          {memo.lessons.map((l, i) => (
            <li key={i}>
              <div className="lesson-concept">{l.concept}</div>
              <div className="lesson-body">{l.lesson}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="section-head">Scorecard — concepts demonstrated</h2>
        <div className="grade-row">
          <div className="grade-badge">{grade.overall_letter}</div>
          <div className="grade-note">{grade.overall_note}</div>
        </div>
        <table className="rubric">
          <thead>
            <tr>
              <th>Concept</th>
              <th className="score-col">Score (1–4)</th>
              <th>Evidence from your pitches</th>
            </tr>
          </thead>
          <tbody>
            {grade.concepts.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td className="score-col">
                  <span className={`score score-${c.score}`}>{c.score}</span>
                </td>
                <td>{c.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="print-cta">
        <button onClick={() => window.print()} className="print-btn">
          Print / Save as PDF
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="memo-shell max-w-3xl mx-auto px-6 py-10">{children}</div>;
}

function RoundRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="round-row">
      <div className="round-row-label">{label}</div>
      <div className="round-row-body">{body}</div>
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      .memo-shell { color: #111; font-family: Georgia, "Times New Roman", serif; line-height: 1.5; }
      .masthead { border-bottom: 3px double #111; padding-bottom: 12px; margin-bottom: 24px; }
      .masthead-kicker { font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.3em; font-size: 11px; color: #C8102E; }
      .masthead-sub { font-family: system-ui, sans-serif; font-size: 12px; color: #444; margin-top: 4px; }
      .masthead-sub .code { font-family: ui-monospace, Menlo, monospace; color: #C8102E; font-weight: 700; margin-right: 6px; }
      .memo-title { font-size: 32px; line-height: 1.2; margin: 20px 0 6px; }
      .memo-dek { font-size: 18px; color: #333; margin: 0 0 24px; }
      .exec-summary { border: 1px solid #ddd; background: #fafafa; padding: 14px 18px; margin: 20px 0 32px; }
      .exec-kicker { font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.25em; font-size: 10px; color: #C8102E; margin-bottom: 6px; }
      .section-head { font-size: 20px; margin: 32px 0 14px; padding-bottom: 6px; border-bottom: 1px solid #111; }
      .timeline { list-style: none; padding: 0; margin: 0; }
      .timeline > li { margin-bottom: 20px; }
      .round-label { font-family: system-ui, sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C8102E; margin-bottom: 6px; }
      .round-grid { display: grid; grid-template-columns: 1fr; gap: 6px; border-left: 3px solid #C8102E; padding-left: 14px; }
      .round-row { display: grid; grid-template-columns: 160px 1fr; gap: 10px; font-size: 14px; }
      .round-row-label { font-family: system-ui, sans-serif; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #666; padding-top: 2px; }
      .lessons { list-style: none; padding: 0; margin: 0; }
      .lessons > li { margin-bottom: 14px; padding: 10px 12px; background: #fafafa; border-left: 3px solid #111; }
      .lesson-concept { font-family: system-ui, sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C8102E; margin-bottom: 4px; }
      .lesson-body { font-size: 14px; }
      .grade-row { display: flex; align-items: center; gap: 16px; margin: 10px 0 18px; }
      .grade-badge { font-family: system-ui, sans-serif; font-weight: 700; font-size: 32px; line-height: 1; padding: 10px 18px; background: #C8102E; color: #fff; border-radius: 4px; }
      .grade-note { font-size: 14px; color: #333; }
      table.rubric { width: 100%; border-collapse: collapse; font-size: 13px; }
      table.rubric th, table.rubric td { padding: 6px 8px; border-bottom: 1px solid #e5e5e5; vertical-align: top; text-align: left; }
      table.rubric th { font-family: system-ui, sans-serif; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #666; }
      .score-col { text-align: center; width: 90px; }
      .score { display: inline-block; width: 28px; height: 28px; line-height: 28px; border-radius: 50%; font-weight: 700; font-family: system-ui, sans-serif; }
      .score-4 { background: #C8102E; color: #fff; }
      .score-3 { background: #E07a86; color: #fff; }
      .score-2 { background: #eee; color: #444; }
      .score-1 { background: #eee; color: #444; }
      .print-cta { margin-top: 36px; text-align: center; }
      .print-btn { font-family: system-ui, sans-serif; border: 1px solid #111; background: #fff; padding: 8px 20px; cursor: pointer; }
      @media print {
        .print-cta { display: none; }
        .memo-shell { max-width: none; padding: 0; }
        a { color: inherit; text-decoration: none; }
      }
    `}</style>
  );
}
