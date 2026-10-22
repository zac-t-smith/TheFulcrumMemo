import { getSupabase } from "../lib/supabase";
import { assignGroups, randomFirmCode, GroupCounters } from "../lib/balance";
import { newPlayerId, savePlayer, PlayerIdentity, RoleId } from "./usePlayer";
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

  // Fetch existing members to decide the new player's role (round-robin per firm).
  const { data: existingMembers } = await sb
    .from("players")
    .select("*")
    .eq("firm_id", firm.id);
  const role = nextRoleForFirm((existingMembers ?? []) as PlayerRow[]);

  const counters = await readCounters(opts.session.id);
  const assignment = assignGroups(counters);

  const id = newPlayerId();
  const { data: playerData, error: pErr } = await sb
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
    .single();
  if (pErr) throw pErr;

  const player: PlayerIdentity = {
    id: playerData.id,
    sessionCode: opts.session.code,
    firmId: firm.id,
    firmCode: firm.code,
    displayName: opts.displayName,
    anchor: assignment.anchor,
    framing: assignment.framing,
    role,
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
