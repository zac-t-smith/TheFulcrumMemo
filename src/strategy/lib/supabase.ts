import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

// Dedicated schema for the simulation — kept separate from any other data in the project.
// Requires the Supabase dashboard "Exposed schemas" setting to include `falcon`.
export const FALCON_SCHEMA = "falcon";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, or load /strategy?demo=1 for offline mode."
    );
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      db: { schema: FALCON_SCHEMA },
      realtime: { params: { eventsPerSecond: 20 } },
      auth: { persistSession: false },
    });
  }
  return client;
}
