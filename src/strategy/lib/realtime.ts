import { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase, FALCON_SCHEMA } from "./supabase";

type Row = Record<string, unknown>;
type Handler = (payload: { new: Row | null; old: Row | null; eventType: "INSERT" | "UPDATE" | "DELETE" }) => void;

export type ChannelSpec = {
  table: string;
  filter?: string;
  onChange: Handler;
};

export function subscribeSession(sessionId: string, specs: ChannelSpec[]): {
  channel: RealtimeChannel;
  unsubscribe: () => void;
} {
  const sb = getSupabase();
  const channel = sb.channel(`session:${sessionId}:${Math.random().toString(36).slice(2, 8)}`);
  for (const spec of specs) {
    channel.on(
      // @ts-expect-error — supabase-js realtime types are loose for the generic callback
      "postgres_changes",
      {
        event: "*",
        schema: FALCON_SCHEMA,
        table: spec.table,
        filter: spec.filter ?? `session_id=eq.${sessionId}`,
      },
      spec.onChange
    );
  }
  channel.subscribe();
  return {
    channel,
    unsubscribe: () => {
      sb.removeChannel(channel);
    },
  };
}

// Hook up visibility / focus / online handlers so a phone that was asleep catches up.
// Also fires on window 'focus' because iOS Safari sometimes skips visibilitychange.
export function onReconnect(cb: () => void): () => void {
  const vis = () => {
    if (document.visibilityState === "visible") cb();
  };
  const focus = () => cb();
  document.addEventListener("visibilitychange", vis);
  window.addEventListener("online", cb);
  window.addEventListener("focus", focus);
  window.addEventListener("pageshow", focus);
  return () => {
    document.removeEventListener("visibilitychange", vis);
    window.removeEventListener("online", cb);
    window.removeEventListener("focus", focus);
    window.removeEventListener("pageshow", focus);
  };
}

// Polling fallback: run cb every intervalMs while the tab is visible.
// Pauses when hidden (saves battery and Supabase quota) and resumes when visible.
// This is the safety net for when Supabase realtime drops phase / inject changes.
export function onVisibleInterval(cb: () => void, intervalMs: number): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;
  const start = () => {
    if (timer != null) return;
    timer = setInterval(cb, intervalMs);
  };
  const stop = () => {
    if (timer == null) return;
    clearInterval(timer);
    timer = null;
  };
  const sync = () => {
    if (document.visibilityState === "visible") start();
    else stop();
  };
  sync();
  document.addEventListener("visibilitychange", sync);
  return () => {
    stop();
    document.removeEventListener("visibilitychange", sync);
  };
}
