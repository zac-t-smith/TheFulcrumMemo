import { useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "../lib/supabase";

// Polls firm_memos for the given firm. Returns true once a row exists. Used
// by the phone to show the "Your firm's case study is ready →" link during
// Final reveal / Debrief without needing to wire firm_memos into useSession.
export function useFirmMemoReady(firmId: string | null): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!firmId || !supabaseConfigured) return;
    let cancelled = false;
    const check = async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("firm_memos")
          .select("id")
          .eq("firm_id", firmId)
          .limit(1)
          .maybeSingle();
        if (cancelled) return;
        if (!error) setReady(Boolean(data));
      } catch {
        /* table might not be deployed yet — stay false */
      }
    };
    void check();
    const t = setInterval(check, 4000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [firmId]);
  return ready;
}
