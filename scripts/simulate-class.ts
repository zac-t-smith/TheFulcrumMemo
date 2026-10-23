#!/usr/bin/env tsx
// Load-test the strategy simulation. Spins up 20 fake players across 5 firms
// against an existing session, then auto-submits whenever a decide_* phase fires.
//
// Usage:
//   npx tsx scripts/simulate-class.ts <SESSION_CODE>
//
// Requires in .env.local:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (service role for insert speed; never ship this to the browser)

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { randomUUID } from "crypto";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !svcKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sessionCode = (process.argv[2] ?? "").toUpperCase();
if (!sessionCode) {
  console.error("Usage: npx tsx scripts/simulate-class.ts <SESSION_CODE>");
  process.exit(1);
}

const caseJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "src/strategy/content/case.json"), "utf-8")
);

// Game data lives in the `falcon` schema — same as the browser client.
const sb = createClient(url, svcKey, {
  db: { schema: "falcon" },
  auth: { persistSession: false },
});

const FIRM_NAMES = ["Keystone Capital", "Harbor Advisory", "Ironside Partners", "North Peak", "Lantern Group"];
const NAMES = [
  "Jordan", "Alex", "Sam", "Taylor", "Morgan", "Riley", "Casey", "Dakota",
  "Peyton", "Quinn", "Reese", "Rowan", "Avery", "Blake", "Cameron", "Drew",
  "Emerson", "Finley", "Hayden", "Jamie",
];

function rand<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}
function firmCode(i: number): string {
  return ["ALP", "BRV", "CDR", "DLT", "ECH"][i];
}

async function main() {
  console.log(`[sim] session ${sessionCode}`);
  const { data: session, error: sErr } = await sb
    .from("game_sessions")
    .select("*")
    .eq("code", sessionCode)
    .maybeSingle();
  if (sErr || !session) {
    console.error("No session found:", sErr?.message ?? "null");
    process.exit(1);
  }

  // Create 5 firms
  const firms: { id: string; name: string; code: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const { data, error } = await sb
      .from("firms")
      .insert({ session_id: session.id, name: FIRM_NAMES[i], code: firmCode(i) })
      .select("*")
      .single();
    if (error) {
      console.error(`firm ${i} insert failed:`, error.message);
    } else {
      firms.push(data);
      console.log(`[sim] firm ${data.code} ${data.name}`);
    }
  }

  // Create 20 players, 4 per firm, round-robin roles
  const roleOrder = ["cfo", "cso", "people", "gc"] as const;
  const players: { id: string; firm_id: string }[] = [];
  for (let i = 0; i < 20; i++) {
    const firm = firms[i % firms.length];
    const id = randomUUID();
    const { data, error } = await sb
      .from("players")
      .insert({
        id,
        session_id: session.id,
        firm_id: firm.id,
        display_name: `${NAMES[i]} (bot)`,
        anchor_group: i % 2 === 0 ? "high" : "low",
        framing_group: i % 2 === 0 ? "gain" : "loss",
        role: roleOrder[Math.floor(i / firms.length) % roleOrder.length],
      })
      .select("*")
      .single();
    if (error) console.error(`player ${i} insert failed:`, error.message);
    else {
      players.push(data);
      console.log(`[sim] player ${data.display_name} -> ${firm.code}`);
    }
  }

  // Subscribe to the session; on each decide_* phase, submit for every firm.
  const submittedForRound = new Set<number>();
  const channel = sb.channel(`sim:${session.id}`);
  channel.on(
    "postgres_changes" as any,
    { event: "*", schema: "falcon", table: "game_sessions", filter: `id=eq.${session.id}` },
    async (payload: any) => {
      const phase: string = payload.new.phase;
      const round: number = payload.new.round;
      console.log(`[sim] phase → ${phase} (round ${round})`);
      if (phase.startsWith("decide_") && !submittedForRound.has(round)) {
        submittedForRound.add(round);
        const options = caseJson.rounds[round - 1].options;
        const frameworks = caseJson.frameworks;
        for (const firm of firms) {
          const opt = rand(options);
          const fw = rand(frameworks);
          const member = players.find((p) => p.firm_id === firm.id)!;
          const pitch = `We pick ${opt.label.toLowerCase()} — unit economics support it.`;
          const { error } = await sb
            .from("submissions")
            .upsert({
              firm_id: firm.id,
              round,
              option_id: opt.id,
              pitch,
              framework_tag: fw.id,
              tradeoff: "We accept this risk because it preserves the mission.",
              confidence: 30 + Math.floor(Math.random() * 60),
              dissent: Math.random() < 0.3 ? "Someone argued we're pricing in too much upside." : null,
              submitted_by: member.id,
            }, { onConflict: "firm_id,round" });
          if (error) console.error(`[sim] submit ${firm.code}:`, error.message);
          else console.log(`[sim] ${firm.code} → ${opt.id} ${opt.label}`);
          await new Promise((r) => setTimeout(r, 300 + Math.random() * 1200));
        }
      }
      if (phase === "done") {
        console.log("[sim] session done. exiting.");
        await sb.removeChannel(channel);
        process.exit(0);
      }
    }
  );
  channel.subscribe((status) => console.log("[sim] channel", status));

  console.log("[sim] ready. advance phases from the ops console to see submissions arrive.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
