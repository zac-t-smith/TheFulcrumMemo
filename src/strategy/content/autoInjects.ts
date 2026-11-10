// Scheduled auto-injects. Fully client-side: every board/phone renders the
// inject once `now >= phase_started_at + atSeconds` for the current phase.
// Nothing fires on the server; this means it works even if the facilitator's
// phone is asleep or the ops console is closed.
//
// Behavior:
//   - Scoped to `decide_1` / `decide_2` / `decide_3` only.
//   - Cleared automatically when the phase advances (phase key resets the banner).
//   - Toggled off via `game_sessions.metadata.auto_events_enabled = false`.
//     Default (missing or `true`) = enabled.
//   - The copy intentionally matches the existing "BREAKING" injects in
//     case.json so the room reads as one voice.

import type { Phase } from "../lib/phases";

export type AutoInject = {
  phase: Extract<Phase, "decide_1" | "decide_2" | "decide_3">;
  atSeconds: number;
  title: string;
  body: string;
};

export const AUTO_INJECTS: ReadonlyArray<AutoInject> = [
  {
    phase: "decide_1",
    atSeconds: 75,
    title: "BREAKING: Bluewing sweetens the pot",
    body:
      "Bluewing raises its offer to $33.50/share in cash and promises $400M to shareholders if regulators block the deal. Does that change your answer?",
  },
  {
    phase: "decide_2",
    atSeconds: 75,
    title: "BREAKING: More jets grounded",
    body:
      "The engine maker says up to 40 Falcon jets will be parked by December for inspections. Your capacity just shrank. Does your plan still work?",
  },
  {
    phase: "decide_3",
    atSeconds: 75,
    title: "BREAKING: Fuel hits $4.60",
    body:
      "Jet fuel spikes to $4.60 a gallon as tanker traffic through the Strait of Hormuz stalls. Re-run your numbers.",
  },
];

export function autoInjectForPhase(phase: Phase): AutoInject | null {
  return AUTO_INJECTS.find((i) => i.phase === phase) ?? null;
}

// Returns true when auto-events should render for this session.
// Missing / malformed metadata defaults to true (safe default for live show).
export function autoEventsEnabled(metadata: Record<string, unknown> | null | undefined): boolean {
  if (!metadata) return true;
  const v = metadata["auto_events_enabled"];
  if (v === false) return false;
  return true;
}
