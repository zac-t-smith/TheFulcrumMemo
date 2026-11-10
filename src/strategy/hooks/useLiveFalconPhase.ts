import { useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "../lib/supabase";
import type { Phase } from "../lib/phases";

// Lightweight read-only phase probe used by the home-page banner. Polls the
// permanent FALCON session every 15s. Reads nothing sensitive — just the
// phase column — and defaults to `null` on any error so the banner stays
// hidden rather than flashing in misconfigured environments.
export function useLiveFalconPhase(): Phase | null {
  const [phase, setPhase] = useState<Phase | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;

    async function fetchPhase() {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("game_sessions")
          .select("phase")
          .eq("code", "FALCON")
          .maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          setPhase(null);
          return;
        }
        setPhase((data as { phase: Phase }).phase);
      } catch {
        if (!cancelled) setPhase(null);
      }
    }

    void fetchPhase();
    const t = setInterval(fetchPhase, 15000);
    const onVis = () => {
      if (document.visibilityState === "visible") void fetchPhase();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return phase;
}

// True when the live session is active (any phase except "done" / debrief).
// Treats null (unknown) as inactive so we never surface a dead banner.
export function isFalconLive(phase: Phase | null): boolean {
  return phase != null && phase !== "done";
}
