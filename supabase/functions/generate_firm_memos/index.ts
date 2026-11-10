// Supabase Edge Function: generate_firm_memos
//
// Produces a Claude-written credit-memo-style case study + forgiving-rubric
// grade for every firm in a FALCON session. Called from the ops console
// AFTER Final reveal / Debrief — never on the live path.
//
// Deploy:
//   supabase functions deploy generate_firm_memos --no-verify-jwt
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-... \
//                       SUPABASE_SERVICE_ROLE_KEY=... \
//                       SUPABASE_URL=https://<ref>.supabase.co \
//                       ANTHROPIC_MODEL=claude-sonnet-5-5
//
// POST body: { session_id: string, ops_secret: string, force?: boolean }
// Returns:   { memos: Array<{ firm_id: string; ok: boolean; error?: string }> }

// Deno runtime declaration (Supabase edge functions run on Deno Deploy).
// This file is edge-only — not bundled into the Vite app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-5-5";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

async function sbSelect(path: string) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Accept-Profile": "falcon",
    },
  });
  if (!r.ok) throw new Error(`select ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}

async function sbRpc(name: string, body: Record<string, unknown>) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
      "Content-Profile": "falcon",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`rpc ${name} ${r.status}: ${await r.text()}`);
  return r.json();
}

// Concepts the course teaches; the rubric scores each 1-4 and quotes the
// firm's own words as evidence. Floor is 3 for any concept the firm engaged
// with and the overall grade never dips below B for full participation.
const COURSE_CONCEPTS: Array<{ id: string; title: string; markers: string[] }> = [
  { id: "mvv", title: "Mission, Vision, Values", markers: ["mission", "vision", "values", "purpose"] },
  { id: "corp_vs_bu", title: "Corporate vs. Business Strategy", markers: ["corporate", "business unit", "portfolio", "divest"] },
  { id: "integration", title: "Integration", markers: ["merge", "integration", "synergy", "combined"] },
  { id: "governance", title: "Governance & Fiduciary Duty", markers: ["board", "fiduciary", "shareholder", "governance"] },
  { id: "porter_generic", title: "Porter's Generic Strategies", markers: ["cost leadership", "differentiation", "focus", "low cost"] },
  { id: "five_forces", title: "Five Forces", markers: ["supplier", "buyer", "rivalry", "new entrant", "substitute", "five forces"] },
  { id: "ansoff", title: "Ansoff Matrix", markers: ["market penetration", "market development", "product development", "diversification", "ansoff"] },
  { id: "stakeholders", title: "Stakeholders vs. Shareholders", markers: ["stakeholder", "shareholder", "employees", "community"] },
  { id: "scenario", title: "Scenario Planning", markers: ["scenario", "stress", "if-then", "contingency", "downside"] },
  { id: "going_concern", title: "Going Concern vs. Liquidation", markers: ["going concern", "liquidation", "wind-down", "chapter 7", "chapter 11", "rescue"] },
];

const SYSTEM_PROMPT =
  "You are an instructor writing a short credit-memo-style case study of a student firm's choices in a live strategy simulation. Be analytical, direct, and generous: your job is to surface the concepts the firm demonstrated and name one or two sharpenings for next time. You never shame the students. Write in the voice of a seasoned restructuring partner who teaches. Return only valid JSON matching the requested schema — no prose outside the JSON.";

type FirmInput = {
  firm_id: string;
  firm_name: string;
  firm_code: string;
  session_code: string;
  rounds: Array<{
    round: number;
    option_label: string;
    option_description: string;
    pitch: string;
    framework_tag: string;
    tradeoff: string | null;
    confidence: number | null;
    dissent: string | null;
    what_happened_title: string;
    what_happened_body: string;
    consequence_title: string;
    consequence_body: string;
    meter_delta: { cash: number; trust: number; fit: number };
  }>;
  valuation_answers: Array<{ value: string }>;
  room_choice_distribution: Array<{ round: number; option_label: string; firms: number }>;
  final_identity: string;
};

function buildUserPrompt(f: FirmInput): string {
  return [
    `Firm: ${f.firm_name} (${f.firm_code}), session ${f.session_code}.`,
    `Real client (revealed at the end): ${f.final_identity}.`,
    "",
    "The firm's three rounds:",
    ...f.rounds.map(
      (r) =>
        `Round ${r.round}: chose "${r.option_label}" — ${r.option_description}\n` +
        `  Pitch: ${r.pitch}\n` +
        `  Framework used: ${r.framework_tag}\n` +
        (r.tradeoff ? `  Tradeoff they named: ${r.tradeoff}\n` : "") +
        (r.confidence != null ? `  Confidence: ${r.confidence}/100\n` : "") +
        (r.dissent ? `  Dissent: ${r.dissent}\n` : "") +
        `  What actually happened: ${r.what_happened_title} — ${r.what_happened_body}\n` +
        `  Their consequence: ${r.consequence_title} — ${r.consequence_body}\n` +
        `  Meters change: cash ${r.meter_delta.cash >= 0 ? "+" : ""}${r.meter_delta.cash}, trust ${r.meter_delta.trust >= 0 ? "+" : ""}${r.meter_delta.trust}, fit ${r.meter_delta.fit >= 0 ? "+" : ""}${r.meter_delta.fit}`
    ),
    "",
    "Diagnostic (valuation) answers from the firm's members:",
    f.valuation_answers.length
      ? f.valuation_answers.map((v) => `  - ${v.value}`).join("\n")
      : "  (none)",
    "",
    "What the whole room chose:",
    ...f.room_choice_distribution.map(
      (c) => `  R${c.round} — ${c.option_label}: ${c.firms} firms`
    ),
    "",
    "Write a JSON object with this exact shape:",
    `{
  "title": "<short memo title tying to the firm's arc>",
  "dek": "<1-sentence dek, analytical>",
  "executive_summary": "<2-3 sentence recap in restructuring voice>",
  "rounds": [
    { "round": 1,
      "our_call": "<the option they picked, 1 line>",
      "our_reasoning": "<quote their own pitch/framework in 1-2 lines>",
      "what_actually_happened": "<ground truth in 1-2 lines>",
      "what_we_would_change": "<1 sentence sharpening>"
    },
    { "round": 2, ... },
    { "round": 3, ... }
  ],
  "lessons": [
    { "concept": "<one of the course concepts>", "lesson": "<1-2 sentences tying firm's behavior to the concept>" },
    { "concept": "...", "lesson": "..." },
    { "concept": "...", "lesson": "..." }
  ]
}`,
    "",
    "Quote the firm's own words when possible. Do not invent facts. Keep every field under 60 words.",
  ].join("\n");
}

type MemoJson = {
  title: string;
  dek: string;
  executive_summary: string;
  rounds: Array<{
    round: number;
    our_call: string;
    our_reasoning: string;
    what_actually_happened: string;
    what_we_would_change: string;
  }>;
  lessons: Array<{ concept: string; lesson: string }>;
};

type ConceptScore = {
  id: string;
  title: string;
  score: 1 | 2 | 3 | 4;
  evidence: string;
};

type GradeJson = {
  concepts: ConceptScore[];
  overall_letter: "A" | "A-" | "B+" | "B";
  overall_note: string;
};

// Forgiving rubric. Baseline = "fully participated" (3 round submissions
// with pitches and framework tags). Floor of 3 on any concept the firm
// engaged with; overall never below B.
function gradeFirm(f: FirmInput): GradeJson {
  const fullText = f.rounds
    .map((r) => `${r.pitch} ${r.tradeoff ?? ""} ${r.dissent ?? ""} ${r.framework_tag}`)
    .join(" ")
    .toLowerCase();
  const participated = f.rounds.filter((r) => r.pitch.trim().length > 0).length;
  const participationFull = participated >= 3;

  const concepts: ConceptScore[] = COURSE_CONCEPTS.map((c) => {
    const hit = c.markers.find((m) => fullText.includes(m));
    const engaged = Boolean(hit);
    const quote = hit
      ? (f.rounds.find((r) =>
          `${r.pitch} ${r.tradeoff ?? ""} ${r.dissent ?? ""} ${r.framework_tag}`.toLowerCase().includes(hit)
        )?.pitch || hit)
      : "";
    const base: 1 | 2 | 3 | 4 = engaged ? 3 : 2;
    const boost = engaged && (quote.length > 40 || /why|because|trade|risk/i.test(quote)) ? 1 : 0;
    const score = Math.max(engaged ? 3 : base, Math.min(4, base + boost)) as 1 | 2 | 3 | 4;
    return {
      id: c.id,
      title: c.title,
      score,
      evidence: engaged ? `“${quote.slice(0, 160)}”` : "No direct mention in this firm's pitches — opportunity for next time.",
    };
  });

  const engagedCount = concepts.filter((c) => c.score >= 3).length;
  const avg = concepts.reduce((s, c) => s + c.score, 0) / concepts.length;
  let letter: GradeJson["overall_letter"] = "B";
  if (avg >= 3.6 && engagedCount >= 7) letter = "A";
  else if (avg >= 3.3 && engagedCount >= 5) letter = "A-";
  else if (avg >= 3.1 && engagedCount >= 4) letter = "B+";
  if (participationFull && letter === "B" && engagedCount >= 3) letter = "B+";

  return {
    concepts,
    overall_letter: letter,
    overall_note:
      `Concepts demonstrated: ${engagedCount} of ${concepts.length}. ` +
      `Average score ${avg.toFixed(2)}/4.00. ` +
      (participationFull ? "Full participation across all three rounds." : "Partial participation."),
  };
}

async function callClaude(userPrompt: string): Promise<MemoJson> {
  const r = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const text = (data.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("model returned no JSON block");
  const parsed = JSON.parse(text.slice(start, end + 1)) as MemoJson;
  if (!parsed.title || !Array.isArray(parsed.rounds)) {
    throw new Error("model JSON failed shape check");
  }
  return parsed;
}

async function callClaudeWithRetry(userPrompt: string): Promise<MemoJson> {
  try {
    return await callClaude(userPrompt);
  } catch (e) {
    // Retry once per spec. One failure, then skip the firm (caller handles).
    await new Promise((r) => setTimeout(r, 750));
    return callClaude(userPrompt);
  }
}

// Case content ships in the client bundle; the edge function receives it
// inlined in the request body so we don't have to maintain two copies.
type CaseContentShape = {
  rounds: Array<{
    id: string;
    options: Array<{
      id: string;
      label: string;
      description: string;
      consequence: { title: string; body: string; meters: { cash: number; trust: number; fit: number } };
      conditional?: Array<{ ifFlag: string; consequenceOverride: { title: string; body: string; meters: { cash: number; trust: number; fit: number } } }>;
      setsFlags?: string[];
    }>;
    whatHappened: { title: string; body: string; date: string };
  }>;
  finalReveal: { identity: string; closer: string };
};

async function assembleFirmInputs(
  sessionId: string,
  content: CaseContentShape
): Promise<FirmInput[]> {
  const [firms, players, submissions, answersRaw, session] = await Promise.all([
    sbSelect(`firms?session_id=eq.${sessionId}`),
    sbSelect(`players?session_id=eq.${sessionId}`),
    sbSelect(`submissions?session_id=eq.${sessionId}`),
    sbSelect(
      `answers?player_id=in.(${Array.from(
        new Set(
          (await sbSelect(`players?session_id=eq.${sessionId}&select=id`))
            .map((p: { id: string }) => p.id)
        )
      ).join(",") || "00000000-0000-0000-0000-000000000000"})`
    ),
    sbSelect(`game_sessions?id=eq.${sessionId}&select=code`),
  ]);

  const sessionCode = (session[0] as { code: string } | undefined)?.code ?? "FALCON";

  // Pre-compute room-wide choice distribution per round.
  type Sub = {
    firm_id: string;
    round: number;
    option_id: string;
    pitch: string;
    framework_tag: string;
    tradeoff: string | null;
    confidence: number | null;
    dissent: string | null;
  };
  const subs = submissions as Sub[];
  const roomDist: Array<{ round: number; option_label: string; firms: number }> = [];
  for (let r = 1; r <= content.rounds.length; r++) {
    const rc = content.rounds[r - 1];
    for (const opt of rc.options) {
      const n = subs.filter((s) => s.round === r && s.option_id === opt.id).length;
      roomDist.push({ round: r, option_label: opt.label, firms: n });
    }
  }

  return (firms as Array<{ id: string; name: string; code: string }>).map((f) => {
    const myPlayers = (players as Array<{ id: string; firm_id: string }>)
      .filter((p) => p.firm_id === f.id)
      .map((p) => p.id);
    const myAnswers = (answersRaw as Array<{ player_id: string; test_key: string; value: string }>)
      .filter((a) => myPlayers.includes(a.player_id) && a.test_key === "anchor")
      .map((a) => ({ value: a.value }));

    const flags = new Set<string>();
    const rounds = [1, 2, 3].map((round) => {
      const rc = content.rounds[round - 1];
      const sub = subs.find((s) => s.firm_id === f.id && s.round === round);
      const opt = sub ? rc.options.find((o) => o.id === sub.option_id) : null;
      const override = opt?.conditional?.find((c) => flags.has(c.ifFlag));
      const cons = override ? override.consequenceOverride : opt?.consequence;
      opt?.setsFlags?.forEach((fl) => flags.add(fl));
      return {
        round,
        option_label: opt?.label ?? "(no submission)",
        option_description: opt?.description ?? "",
        pitch: sub?.pitch ?? "",
        framework_tag: sub?.framework_tag ?? "",
        tradeoff: sub?.tradeoff ?? null,
        confidence: sub?.confidence ?? null,
        dissent: sub?.dissent ?? null,
        what_happened_title: rc.whatHappened.title,
        what_happened_body: rc.whatHappened.body,
        consequence_title: cons?.title ?? "—",
        consequence_body: cons?.body ?? "",
        meter_delta: cons?.meters ?? { cash: 0, trust: 0, fit: 0 },
      };
    });

    return {
      firm_id: f.id,
      firm_name: f.name,
      firm_code: f.code,
      session_code: sessionCode,
      rounds,
      valuation_answers: myAnswers,
      room_choice_distribution: roomDist,
      final_identity: content.finalReveal.identity,
    };
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors() });
  }
  if (req.method !== "POST") {
    return new Response("method", { status: 405, headers: cors() });
  }
  if (!ANTHROPIC_API_KEY || !SERVICE_ROLE || !SUPABASE_URL) {
    return new Response(
      JSON.stringify({ error: "server missing ANTHROPIC_API_KEY / SUPABASE env" }),
      { status: 500, headers: { ...cors(), "content-type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const sessionId: string = body.session_id;
    const opsSecret: string = body.ops_secret;
    const content: CaseContentShape = body.case_content;
    if (!sessionId || !opsSecret || !content) {
      return new Response(JSON.stringify({ error: "missing session_id / ops_secret / case_content" }), {
        status: 400,
        headers: { ...cors(), "content-type": "application/json" },
      });
    }

    const firms = await assembleFirmInputs(sessionId, content);
    const results: Array<{ firm_id: string; ok: boolean; error?: string }> = [];

    for (const f of firms) {
      try {
        const memo = await callClaudeWithRetry(buildUserPrompt(f));
        const grade = gradeFirm(f);
        await sbRpc("insert_firm_memo", {
          p_session_id: sessionId,
          p_secret: opsSecret,
          p_firm_id: f.firm_id,
          p_memo: memo,
          p_grade: grade,
        });
        results.push({ firm_id: f.firm_id, ok: true });
      } catch (e) {
        results.push({ firm_id: f.firm_id, ok: false, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ memos: results }), {
      headers: { ...cors(), "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...cors(), "content-type": "application/json" },
    });
  }
});
