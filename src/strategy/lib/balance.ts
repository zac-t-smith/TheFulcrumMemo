// Deterministic balanced assignment of split-test groups.
// Counters live in game_sessions.metadata; this keeps groups within ±1.

export type GroupCounters = {
  anchor_high: number;
  anchor_low: number;
  framing_gain: number;
  framing_loss: number;
};

export function emptyCounters(): GroupCounters {
  return { anchor_high: 0, anchor_low: 0, framing_gain: 0, framing_loss: 0 };
}

export function assignGroups(c: GroupCounters): {
  anchor: "high" | "low";
  framing: "gain" | "loss";
  next: GroupCounters;
} {
  // Pick the smaller side; tie → randomize so first player of a tie isn't deterministic.
  const anchor: "high" | "low" =
    c.anchor_high === c.anchor_low
      ? Math.random() < 0.5
        ? "high"
        : "low"
      : c.anchor_high < c.anchor_low
      ? "high"
      : "low";
  const framing: "gain" | "loss" =
    c.framing_gain === c.framing_loss
      ? Math.random() < 0.5
        ? "gain"
        : "loss"
      : c.framing_gain < c.framing_loss
      ? "gain"
      : "loss";
  const next: GroupCounters = { ...c };
  next[anchor === "high" ? "anchor_high" : "anchor_low"] += 1;
  next[framing === "gain" ? "framing_gain" : "framing_loss"] += 1;
  return { anchor, framing, next };
}

export function randomFirmCode(existing: Set<string>): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid confusion
  for (let i = 0; i < 50; i++) {
    const code =
      chars[Math.floor(Math.random() * chars.length)] +
      chars[Math.floor(Math.random() * chars.length)] +
      chars[Math.floor(Math.random() * chars.length)];
    if (!existing.has(code)) return code;
  }
  // Last-ditch fallback with timestamp seed; still 3 chars but caller must accept collision risk.
  return (
    chars[Math.floor(Math.random() * chars.length)] +
    chars[Math.floor(Math.random() * chars.length)] +
    chars[Math.floor(Math.random() * chars.length)]
  );
}
