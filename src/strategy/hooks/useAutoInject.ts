import { useEffect, useMemo, useState } from "react";
import { AUTO_INJECTS, AutoInject, autoEventsEnabled } from "../content/autoInjects";
import type { Phase } from "../lib/phases";

// Normalize `phase_started_at` to epoch ms. Supabase returns ISO; guard against
// bad values so a clock hiccup never throws in a shared hook.
function toEpoch(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export type AutoInjectState = {
  // The inject to show RIGHT NOW on this device, or null.
  active: AutoInject | null;
  // The next inject scheduled for this phase that hasn't fired yet (used by
  // the ops console "Up next" line).
  upcoming: AutoInject | null;
  // Seconds until `upcoming` fires. Negative means "already fired" (null then).
  secondsUntilUpcoming: number;
};

// Shared hook — used by BoardRoom, PlayerView, and the ops "Up next" line.
// Ticks every 1s. Cheap: no network, just a wall-clock diff.
export function useAutoInject(params: {
  phase: Phase | null;
  phaseStartedAt: string | null | undefined;
  metadata: Record<string, unknown> | null | undefined;
}): AutoInjectState {
  const { phase, phaseStartedAt, metadata } = params;
  const enabled = autoEventsEnabled(metadata);

  // Single candidate per phase today. Kept as an array so we can grow later
  // without touching consumers.
  const candidates = useMemo<AutoInject[]>(
    () => (phase ? AUTO_INJECTS.filter((i) => i.phase === phase) : []),
    [phase]
  );

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!enabled || candidates.length === 0) return;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [enabled, candidates.length]);

  return useMemo<AutoInjectState>(() => {
    if (!enabled || !phase || candidates.length === 0) {
      return { active: null, upcoming: null, secondsUntilUpcoming: -1 };
    }
    const startedMs = toEpoch(phaseStartedAt);
    if (!startedMs) return { active: null, upcoming: null, secondsUntilUpcoming: -1 };
    const elapsed = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
    // Most recent inject whose time has passed is "active"; the earliest one
    // whose time hasn't passed yet is "upcoming".
    let active: AutoInject | null = null;
    let upcoming: AutoInject | null = null;
    for (const c of candidates) {
      if (elapsed >= c.atSeconds) {
        // Later triggers override earlier ones (future-proofing for >1/phase).
        if (!active || c.atSeconds >= active.atSeconds) active = c;
      } else if (!upcoming || c.atSeconds < upcoming.atSeconds) {
        upcoming = c;
      }
    }
    return {
      active,
      upcoming,
      secondsUntilUpcoming: upcoming ? Math.max(0, upcoming.atSeconds - elapsed) : -1,
    };
  }, [enabled, phase, phaseStartedAt, candidates, nowMs]);
}
