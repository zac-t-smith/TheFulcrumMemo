import { getSupabase } from "../lib/supabase";
import { assignGroups, randomFirmCode, GroupCounters } from "../lib/balance";
import { loadPlayer, savePlayer, stablePlayerId, PlayerIdentity, RoleId } from "./usePlayer";
import type { FirmRow, PlayerRow, SessionRow } from "./useSession";

export type JoinResult = {
  player: PlayerIdentity;
  firm: FirmRow;
};

// Role rotation per firm: CFO, CSO, People, GC, then repeat.
// Firms of 3 skip GC (CFO wears both hats — handled in the UI).
const ROLE_ORDER: RoleId[] = ["cfo", "cso", "people", "gc"];

function nextRoleForFirm(existing: PlayerRow[]): RoleId {
  const counts: Record<RoleId, number> = { cfo: 0, cso: 0, people: 0, gc: 0 };
  for (const p of existing) counts[p.role] += 1;
  // Pick the role with the smallest count, break ties by canonical order.
  let best: RoleId = ROLE_ORDER[0];
  let bestCount = counts[best];
  for (const r of ROLE_ORDER) {
    if (counts[r] < bestCount) {
      best = r;
      bestCount = counts[r];
    }
  }
  return best;
}

async function readCounters(sessionId: string): Promise<GroupCounters> {
  const sb = getSupabase();
  const { data } = await sb.from("game_sessions").select("metadata").eq("id", sessionId).maybeSingle();
  const meta = (data?.metadata ?? {}) as Partial<GroupCounters> & Record<string, unknown>;
  return {
    anchor_high: Number(meta.anchor_high ?? 0),
    anchor_low: Number(meta.anchor_low ?? 0),
    framing_gain: Number(meta.framing_gain ?? 0),
    framing_loss: Number(meta.framing_loss ?? 0),
  };
}

async function pickFewestFirm(sessionId: string): Promise<FirmRow | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("firms")
    .select("*")
    .eq("session_id", sessionId)
    .order("member_count", { ascending: true })
    .limit(1);
  return (data?.[0] ?? null) as FirmRow | null;
}

export async function joinOrCreateByCode(opts: {
  session: SessionRow;
  firmName?: string;
  joinCode?: string;
  autoPlace?: boolean;
  displayName: string;
}): Promise<JoinResult> {
  const sb = getSupabase();

  // Short-circuit: if this browser already joined this session, return the
  // stored identity instead of re-inserting. Covers the "clicked twice,
  // page re-mounted" case cheaply (no round trips).
  const prior = loadPlayer(opts.session.code);
  if (prior) {
    const firmRes = await sb
      .from("firms")
      .select("*")
      .eq("id", prior.firmId)
      .maybeSingle();
    if (firmRes.data) {
      return { player: prior, firm: firmRes.data as FirmRow };
    }
    // Firm was deleted (reset session). Fall through and re-join.
  }

  // Stable per-device id. If a concurrent click races past the short-circuit
  // above, both inserts carry the SAME id — the second hits the primary-key
  // constraint and fails cleanly instead of creating a ghost member.
  const id = stablePlayerId(opts.session.code);

  let firm: FirmRow | null = null;

  if (opts.joinCode) {
    const { data, error } = await sb
      .from("firms")
      .select("*")
      .eq("session_id", opts.session.id)
      .eq("code", opts.joinCode.toUpperCase())
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("No firm with that code in this session.");
    firm = data as FirmRow;
  } else if (opts.autoPlace) {
    firm = await pickFewestFirm(opts.session.id);
    if (!firm) {
      opts.firmName = "Firm A";
    }
  }

  if (!firm) {
    const existing = await sb.from("firms").select("code").eq("session_id", opts.session.id);
    const existingSet = new Set<string>((existing.data ?? []).map((r: { code: string }) => r.code));
    const code = randomFirmCode(existingSet);
    const { data, error } = await sb
      .from("firms")
      .insert({ session_id: opts.session.id, name: opts.firmName || "Unnamed Firm", code })
      .select("*")
      .single();
    if (error) throw error;
    firm = data as FirmRow;
  }

  // Parallelize the two independent reads needed for the player insert.
  const [membersRes, counters] = await Promise.all([
    sb.from("players").select("*").eq("firm_id", firm.id),
    readCounters(opts.session.id),
  ]);
  const role = nextRoleForFirm((membersRes.data ?? []) as PlayerRow[]);
  const assignment = assignGroups(counters);

  // Idempotent insert. If a prior request already landed this id, we read
  // the existing row back instead of creating a duplicate.
  const insertRes = await sb
    .from("players")
    .insert({
      id,
      session_id: opts.session.id,
      firm_id: firm.id,
      display_name: opts.displayName,
      anchor_group: assignment.anchor,
      framing_group: assignment.framing,
      role,
    })
    .select("*")
    .maybeSingle();

  let playerRow = insertRes.data as PlayerRow | null;
  if (insertRes.error) {
    // 23505 = unique_violation. Treat as "already joined, read the row."
    const code = (insertRes.error as unknown as { code?: string }).code;
    if (code !== "23505") throw insertRes.error;
    const existing = await sb
      .from("players")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (existing.error) throw existing.error;
    playerRow = existing.data as PlayerRow | null;
  }
  if (!playerRow) throw new Error("Join succeeded but player row missing. Please retry.");

  const player: PlayerIdentity = {
    id: playerRow.id,
    sessionCode: opts.session.code,
    firmId: firm.id,
    firmCode: firm.code,
    displayName: playerRow.display_name,
    anchor: playerRow.anchor_group,
    framing: playerRow.framing_group,
    role: playerRow.role,
  };
  savePlayer(player);
  return { player, firm };
}

export async function upsertSubmission(opts: {
  firmId: string;
  round: number;
  optionId: string;
  pitch: string;
  frameworkTag: string;
  tradeoff: string;
  confidence: number;
  dissent?: string;
  submittedBy: string;
}): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("submissions").upsert(
    {
      firm_id: opts.firmId,
      round: opts.round,
      option_id: opts.optionId,
      pitch: opts.pitch.slice(0, 200),
      framework_tag: opts.frameworkTag,
      tradeoff: opts.tradeoff.slice(0, 200),
      confidence: Math.max(0, Math.min(100, Math.round(opts.confidence))),
      dissent: opts.dissent?.slice(0, 500) ?? null,
      submitted_by: opts.submittedBy,
    },
    { onConflict: "firm_id,round" }
  );
  if (error) throw error;
}

export async function upsertAnswer(playerId: string, testKey: string, value: string) {
  const sb = getSupabase();
  const { error } = await sb.from("answers").upsert({ player_id: playerId, test_key: testKey, value });
  if (error) throw error;
}
