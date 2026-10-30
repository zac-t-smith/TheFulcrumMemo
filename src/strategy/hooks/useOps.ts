import { getSupabase } from "../lib/supabase";
import { DEFAULT_TIMER, Phase, PHASE_ORDER, phaseRound } from "../lib/phases";
import { sha256Hex } from "../lib/hash";

export async function createSession(code: string, opsSecret: string): Promise<string> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("create_session", {
    p_code: code.toUpperCase(),
    p_ops_secret: opsSecret,
  });
  if (error) throw error;
  return data as string;
}

export async function advanceSession(
  sessionId: string,
  opsSecret: string,
  target: Phase,
  timerSeconds?: number
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.rpc("advance_session", {
    p_session_id: sessionId,
    p_secret: opsSecret,
    p_next_phase: target,
    p_next_round: phaseRound(target) ?? 0,
    p_timer_seconds: timerSeconds ?? DEFAULT_TIMER[target],
  });
  if (error) throw error;
}

export async function setPredictionHash(sessionId: string, opsSecret: string, predictionText: string): Promise<string> {
  const sb = getSupabase();
  const hash = await sha256Hex(predictionText);
  const { error } = await sb.rpc("set_prediction_hash", {
    p_session_id: sessionId,
    p_secret: opsSecret,
    p_hash: hash,
  });
  if (error) throw error;
  return hash;
}

export async function revealPrediction(sessionId: string, opsSecret: string, predictionText: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.rpc("reveal_prediction", {
    p_session_id: sessionId,
    p_secret: opsSecret,
    p_text: predictionText,
  });
  if (error) throw error;
}

export async function fireInject(
  sessionId: string,
  opsSecret: string,
  round: number,
  title: string,
  body: string
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.rpc("fire_inject", {
    p_session_id: sessionId,
    p_secret: opsSecret,
    p_round: round,
    p_title: title,
    p_body: body,
  });
  if (error) throw error;
}

export async function verifyOpsSecret(sessionId: string, opsSecret: string): Promise<boolean> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("verify_ops_secret", {
    p_session_id: sessionId,
    p_secret: opsSecret,
  });
  if (error) throw error;
  return data === true;
}

export async function resetSession(sessionId: string, opsSecret: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.rpc("reset_session", {
    p_session_id: sessionId,
    p_secret: opsSecret,
  });
  if (error) throw error;
}

export function stepPhase(current: Phase, direction: 1 | -1): Phase | null {
  const i = PHASE_ORDER.indexOf(current);
  const j = i + direction;
  return j >= 0 && j < PHASE_ORDER.length ? PHASE_ORDER[j] : null;
}
