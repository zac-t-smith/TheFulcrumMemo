import { useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "../lib/supabase";

export type FirmMemoRow = {
  id: string;
  firm_id: string;
  session_id: string;
  memo_json: {
    title: string;
    dek: string;
    executive_summary: string;
    how_we_decided?: string;
    rounds?: Array<{
      round: number;
      our_call: string;
      our_reasoning: string;
      what_actually_happened: string;
      what_we_would_change: string;
    }>;
    knowledge_check?: {
      summary_line: string;
      concepts: Array<{ concept: string; correct: number; total: number; pct: number; note: string }>;
    };
    lessons?: Array<{ concept: string; lesson: string }>;
    overall_score?: number;
    verdict?: { label: string; subtitle: string; total_meter: number; quiz_pct: number | null };
  };
  grade_json: {
    concepts: Array<{ id: string; title: string; score: 1 | 2 | 3 | 4; evidence: string }>;
    overall_letter: "A" | "A-" | "B+" | "B";
    overall_note: string;
  };
  created_at: string;
};

// Polls all firm_memos for a session. Used by the debrief showcase.
// Degrades silently to [] when the table isn't yet in the DB.
export function useFirmMemos(sessionId: string | null): {
  rows: FirmMemoRow[];
  loading: boolean;
} {
  const [rows, setRows] = useState<FirmMemoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const refetch = async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("firm_memos")
          .select("*")
          .eq("session_id", sessionId);
        if (cancelled) return;
        if (!error) setRows((data ?? []) as FirmMemoRow[]);
      } catch {
        // Non-fatal — table might not be deployed yet.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void refetch();
    const t = setInterval(refetch, 3000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [sessionId]);

  return { rows, loading };
}
