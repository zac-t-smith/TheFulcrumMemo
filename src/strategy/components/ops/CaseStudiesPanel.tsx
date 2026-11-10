import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import caseContent from "../../content/case.json";
import { getSupabase, supabaseConfigured } from "../../lib/supabase";
import { generateFirmMemos } from "../../hooks/useOps";
import type { FirmRow } from "../../hooks/useSession";
import type { Phase } from "../../lib/phases";

type Row = { id: string; firm_id: string; created_at: string };

// Post-final case studies. Enabled only at `final_reveal` or `done`. Writes
// one memo per firm via the generate_firm_memos edge function. Never
// touches game_sessions / submissions — safe to click even during debrief.
export function CaseStudiesPanel({
  sessionId,
  opsSecret,
  phase,
  firms,
}: {
  sessionId: string;
  opsSecret: string;
  phase: Phase;
  firms: FirmRow[];
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [memos, setMemos] = useState<Row[]>([]);
  const canRun = phase === "final_reveal" || phase === "done";

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    const refetch = async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("firm_memos")
          .select("id,firm_id,created_at")
          .eq("session_id", sessionId);
        if (error) throw error;
        if (!cancelled) setMemos((data ?? []) as Row[]);
      } catch {
        /* non-fatal — table might not exist yet */
      }
    };
    void refetch();
    const t = setInterval(refetch, 4000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [sessionId]);

  async function run() {
    if (busy) return;
    setBusy(true);
    setProgress("Writing memos…");
    try {
      const results = await generateFirmMemos(sessionId, opsSecret, caseContent);
      const ok = results.filter((r) => r.ok).length;
      const fail = results.length - ok;
      toast.success(`Generated ${ok} memos${fail ? ` · ${fail} skipped` : ""}.`);
      setProgress(`Done: ${ok} ok, ${fail} skipped.`);
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(`Generate failed: ${msg}`);
      setProgress(`Error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  const base = import.meta.env.BASE_URL;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="rounded-xl border p-4 bg-card space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Case studies</div>
        <button
          onClick={run}
          disabled={!canRun || busy}
          className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-40"
          title={canRun ? "Generate one memo per firm" : "Enabled at Final reveal or Debrief"}
        >
          {busy ? "Generating…" : "Generate case studies"}
        </button>
      </div>
      {progress && <div className="text-xs text-muted-foreground">{progress}</div>}
      {firms.length > 0 ? (
        <ul className="text-xs space-y-1 max-h-48 overflow-auto pr-1">
          {firms.map((f) => {
            const ready = memos.some((m) => m.firm_id === f.id);
            const href = `${origin}${base}#/strategy/memo/${f.id}`;
            return (
              <li key={f.id} className="flex items-baseline justify-between gap-2">
                <span className="truncate">
                  <span className="font-mono text-foreground mr-1">{f.code}</span>
                  {f.name}
                </span>
                {ready ? (
                  <a
                    href={`#/strategy/memo/${f.id}`}
                    className="shrink-0 text-primary underline"
                  >
                    Memo →
                  </a>
                ) : (
                  <span className="shrink-0 text-muted-foreground">pending</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-xs text-muted-foreground italic">No firms yet.</div>
      )}
    </div>
  );
}
