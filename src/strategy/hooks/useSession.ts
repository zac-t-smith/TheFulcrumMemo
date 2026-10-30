import { useEffect, useMemo, useState } from "react";
import { getSupabase, supabaseConfigured } from "../lib/supabase";
import { onReconnect, subscribeSession } from "../lib/realtime";
import type { Phase } from "../lib/phases";

export type SessionRow = {
  id: string;
  code: string;
  phase: Phase;
  round: number;
  phase_started_at: string;
  timer_seconds: number;
  prediction_hash: string | null;
  prediction_text: string | null;
  metadata: Record<string, unknown> | null;
};

export type FirmRow = { id: string; session_id: string; name: string; code: string; member_count: number };
export type PlayerRow = {
  id: string;
  session_id: string;
  firm_id: string;
  display_name: string;
  anchor_group: "high" | "low";
  framing_group: "gain" | "loss";
  role: "cfo" | "cso" | "people" | "gc";
};
export type SubmissionRow = {
  firm_id: string;
  session_id: string;
  round: number;
  option_id: string;
  pitch: string;
  framework_tag: string;
  tradeoff: string | null;
  confidence: number | null;    // 0-100
  dissent: string | null;
  submitted_by: string | null;
  locked: boolean;
  updated_at: string;
};
export type AnswerRow = {
  player_id: string;
  test_key: string;
  value: string;
};
export type InjectRow = {
  id: string;
  session_id: string;
  round: number;
  title: string;
  body: string;
  created_at: string;
};

export type SessionBundle = {
  session: SessionRow | null;
  firms: FirmRow[];
  players: PlayerRow[];
  submissions: SubmissionRow[];
  injects: InjectRow[];
  answers: AnswerRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

// Explicit column list excludes ops_secret_hash. The server also
// revokes table-level SELECT and grants column-level SELECT excluding
// the hash — but keeping the client list explicit means a stray
// select("*") won't start leaking the hash if the server grants change.
const SESSION_COLS =
  "id,code,phase,round,phase_started_at,timer_seconds,prediction_hash,prediction_text,metadata";

async function fetchAll(sessionCodeOrId: string): Promise<Omit<SessionBundle, "loading" | "error" | "refetch">> {
  const sb = getSupabase();
  // Accept either code or id
  const sessionRes =
    sessionCodeOrId.length === 36
      ? await sb.from("game_sessions").select(SESSION_COLS).eq("id", sessionCodeOrId).maybeSingle()
      : await sb.from("game_sessions").select(SESSION_COLS).eq("code", sessionCodeOrId.toUpperCase()).maybeSingle();
  if (sessionRes.error) throw sessionRes.error;
  const session = sessionRes.data as SessionRow | null;
  if (!session) return { session: null, firms: [], players: [], submissions: [], injects: [], answers: [] };
  const [firmsRes, playersRes, subsRes, injectsRes, answersRes] = await Promise.all([
    sb.from("firms").select("*").eq("session_id", session.id),
    sb.from("players").select("*").eq("session_id", session.id),
    sb.from("submissions").select("*").eq("session_id", session.id),
    sb.from("injects").select("*").eq("session_id", session.id).order("created_at", { ascending: false }),
    // answers has no session_id column; fetch via player join (we fetch all answers for the session's players)
    sb.from("players").select("id").eq("session_id", session.id).then(async (r) => {
      const ids = (r.data ?? []).map((p: { id: string }) => p.id);
      if (!ids.length) return { data: [], error: null };
      return sb.from("answers").select("*").in("player_id", ids);
    }),
  ]);
  return {
    session,
    firms: (firmsRes.data ?? []) as FirmRow[],
    players: (playersRes.data ?? []) as PlayerRow[],
    submissions: (subsRes.data ?? []) as SubmissionRow[],
    injects: (injectsRes.data ?? []) as InjectRow[],
    answers: (answersRes.data ?? []) as AnswerRow[],
  };
}

export function useSession(sessionCodeOrId: string | null): SessionBundle {
  const [bundle, setBundle] = useState<Omit<SessionBundle, "loading" | "error" | "refetch">>({
    session: null,
    firms: [],
    players: [],
    submissions: [],
    injects: [],
    answers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useMemo(
    () => async () => {
      if (!sessionCodeOrId || !supabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const next = await fetchAll(sessionCodeOrId);
        setBundle(next);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [sessionCodeOrId]
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!bundle.session || !supabaseConfigured) return;
    const sid = bundle.session.id;
    const sub = subscribeSession(sid, [
      { table: "game_sessions", filter: `id=eq.${sid}`, onChange: () => void refetch() },
      { table: "firms", onChange: () => void refetch() },
      { table: "players", onChange: () => void refetch() },
      { table: "submissions", onChange: () => void refetch() },
      { table: "injects", onChange: () => void refetch() },
      { table: "answers", filter: undefined, onChange: () => void refetch() },
    ]);
    const offReconnect = onReconnect(() => void refetch());
    return () => {
      sub.unsubscribe();
      offReconnect();
    };
  }, [bundle.session, refetch]);

  return { ...bundle, loading, error, refetch };
}
