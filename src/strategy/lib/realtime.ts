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

// Hook up a visibility-change / online handler so a phone that was asleep catches up.
export function onReconnect(cb: () => void): () => void {
  const handler = () => {
    if (document.visibilityState === "visible") cb();
  };
  document.addEventListener("visibilitychange", handler);
  window.addEventListener("online", cb);
  return () => {
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener("online", cb);
  };
}
