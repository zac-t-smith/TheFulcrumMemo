import { useEffect, useState } from "react";

export type RoleId = "cfo" | "cso" | "people" | "gc";

export type PlayerIdentity = {
  id: string;
  sessionCode: string;
  firmId: string;
  firmCode: string;
  displayName: string;
  anchor: "high" | "low";
  framing: "gain" | "loss";
  role: RoleId;                // v2: round-robin assigned at join
};

const KEY = (sessionCode: string) => `fm_strategy_player_${sessionCode.toUpperCase()}`;

export function loadPlayer(sessionCode: string): PlayerIdentity | null {
  if (!sessionCode) return null;
  try {
    const raw = localStorage.getItem(KEY(sessionCode));
    return raw ? (JSON.parse(raw) as PlayerIdentity) : null;
  } catch {
    return null;
  }
}

export function savePlayer(p: PlayerIdentity) {
  localStorage.setItem(KEY(p.sessionCode), JSON.stringify(p));
}

export function clearPlayer(sessionCode: string) {
  localStorage.removeItem(KEY(sessionCode));
}

export function newPlayerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "p-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function usePlayerIdentity(sessionCode: string | null): [PlayerIdentity | null, (p: PlayerIdentity | null) => void] {
  const [player, setPlayer] = useState<PlayerIdentity | null>(() =>
    sessionCode ? loadPlayer(sessionCode) : null
  );
  useEffect(() => {
    if (sessionCode) setPlayer(loadPlayer(sessionCode));
  }, [sessionCode]);
  const update = (p: PlayerIdentity | null) => {
    if (!sessionCode) return;
    if (p) savePlayer(p);
    else clearPlayer(sessionCode);
    setPlayer(p);
  };
  return [player, update];
}
