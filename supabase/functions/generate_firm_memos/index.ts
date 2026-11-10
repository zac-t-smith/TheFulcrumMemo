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
  // Added in D: per-firm quiz + verdict context passed to the model.
  quiz: {
    pct: number | null;              // 0-100, null if nobody answered
    answered: number;
    total: number;                   // players * questions
    per_concept: Array<{ concept: string; correct: number; total: number; pct: number }>;
    missed: Array<{ concept: string; prompt: string; why: string }>;
  };
  verdict: {
    label: "Calibrated" | "Right, but unsure" | "Overconfident" | "Saw the risk" | "Mixed";
    subtitle: string;
    total_meter: number;
    avg_confidence: number | null;
    per_round_delta: number[];
  };
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
    `Firm's verdict (framing for the memo's "How your firm decided" section): ${f.verdict.label} — ${f.verdict.subtitle}. Total meter change: ${f.verdict.total_meter >= 0 ? "+" : ""}${f.verdict.total_meter}. Average confidence: ${f.verdict.avg_confidence == null ? "n/a" : f.verdict.avg_confidence.toFixed(0) + "/100"}.`,
    "",
    `Firm's knowledge-check results: ${f.quiz.pct == null ? "no answers yet" : f.quiz.pct + "% correct (" + f.quiz.answered + " of " + f.quiz.total + " answered)"}.`,
    "Per concept:",
    ...f.quiz.per_concept.map(
      (c) => `  ${c.concept}: ${c.correct}/${c.total} correct (${c.pct}%)`
    ),
    f.quiz.missed.length > 0
      ? "Concepts the firm missed (explain each correctly in one line in the Knowledge check section):"
      : "",
    ...f.quiz.missed.map((m) => `  - ${m.concept}: ${m.prompt} — correct reason: ${m.why}`),
    "",
    "Write a JSON object with this exact shape:",
    `{
  "title": "<short memo title tying to the firm's arc>",
  "dek": "<1-sentence dek, analytical>",
  "executive_summary": "<2-3 sentence recap in restructuring voice>",
  "how_we_decided": "<2-3 sentences framed by the verdict '${f.verdict.label}'. Quote the firm's dissent field if any. Non-judgmental.>",
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
  "knowledge_check": {
    "summary_line": "<one line stating the firm's % correct>",
    "concepts": [
      { "concept": "<concept name>", "correct": <int>, "total": <int>, "pct": <int>, "note": "<one-line correct explanation if they missed it, else 'covered'>" }
    ]
  },
  "lessons": [
    { "concept": "<one of the course concepts>", "lesson": "<1-2 sentences tying firm's behavior to the concept>" },
    { "concept": "...", "lesson": "..." },
    { "concept": "...", "lesson": "..." }
  ]
}`,
    "",
    "Quote the firm's own words when possible. Do not invent facts. Keep every field under 60 words.",
  ].filter(Boolean).join("\n");
}

type MemoJson = {
  title: string;
  dek: string;
  executive_summary: string;
  how_we_decided?: string;
  rounds: Array<{
    round: number;
    our_call: string;
    our_reasoning: string;
    what_actually_happened: string;
    what_we_would_change: string;
  }>;
  knowledge_check?: {
    summary_line: string;
    concepts: Array<{ concept: string; correct: number; total: number; pct: number; note: string }>;
  };
  lessons: Array<{ concept: string; lesson: string }>;
  // Attached post-generation by the edge function for ranking in debrief.
  overall_score?: number;
  // Added so the debrief showcase (E) can frame the top memo.
  verdict?: { label: string; subtitle: string; total_meter: number; quiz_pct: number | null };
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
// engaged with — in a pitch, tradeoff, OR via a correct quiz answer.
// Quiz misses can lower a concept score by at most 1 and never below the
// floor. Overall letter never below B for full participation.
function gradeFirm(f: FirmInput): GradeJson {
  const fullText = f.rounds
    .map((r) => `${r.pitch} ${r.tradeoff ?? ""} ${r.dissent ?? ""} ${r.framework_tag}`)
    .join(" ")
    .toLowerCase();
  const participated = f.rounds.filter((r) => r.pitch.trim().length > 0).length;
  const participationFull = participated >= 3;

  // Map concept title (from quiz) → concept id (from course_concepts) by
  // fuzzy prefix. Edge function is self-contained so we keep this simple.
  function conceptIdFor(quizConcept: string): string | null {
    const q = quizConcept.toLowerCase();
    for (const c of COURSE_CONCEPTS) {
      if (q.includes(c.title.toLowerCase().split(/[&,]/)[0].trim().split(" ")[0])) return c.id;
      if (c.markers.some((m) => q.includes(m))) return c.id;
    }
    return null;
  }

  const quizByConcept = new Map<string, { correct: number; total: number }>();
  for (const pc of f.quiz.per_concept) {
    const id = conceptIdFor(pc.concept);
    if (!id) continue;
    quizByConcept.set(id, { correct: pc.correct, total: pc.total });
  }

  const concepts: ConceptScore[] = COURSE_CONCEPTS.map((c) => {
    const hit = c.markers.find((m) => fullText.includes(m));
    const engagedInText = Boolean(hit);
    const quizStats = quizByConcept.get(c.id);
    const engagedInQuiz = quizStats && quizStats.total > 0 && quizStats.correct > 0;
    const engaged = engagedInText || engagedInQuiz;

    const quote = hit
      ? (f.rounds.find((r) =>
          `${r.pitch} ${r.tradeoff ?? ""} ${r.dissent ?? ""} ${r.framework_tag}`.toLowerCase().includes(hit)
        )?.pitch || hit)
      : "";

    const base: 1 | 2 | 3 | 4 = engaged ? 3 : 2;
    const boost =
      engagedInText && (quote.length > 40 || /why|because|trade|risk/i.test(quote)) ? 1 : 0;
    let score = Math.max(engaged ? 3 : base, Math.min(4, base + boost)) as 1 | 2 | 3 | 4;

    // Quiz miss adjustment: if the firm answered this concept's quiz items
    // and got any wrong, drop at most 1 — but never below the floor of 3
    // for an engaged concept.
    if (quizStats && quizStats.total > 0 && quizStats.correct < quizStats.total) {
      const next = Math.max(engaged ? 3 : 1, score - 1) as 1 | 2 | 3 | 4;
      score = next;
    }

    return {
      id: c.id,
      title: c.title,
      score,
      evidence: engagedInText
        ? `“${quote.slice(0, 160)}”`
        : engagedInQuiz
        ? `Demonstrated on the knowledge check (${quizStats!.correct}/${quizStats!.total}).`
        : "No direct mention in this firm's pitches or quiz — opportunity for next time.",
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
      (f.quiz.pct != null ? `Knowledge check: ${f.quiz.pct}% correct. ` : "") +
      (participationFull ? "Full participation across all three rounds." : "Partial participation."),
  };
}

// Overall_score used by the debrief showcase (E) to rank firms. Combines
// rubric average (dominant) with quiz % and verdict signal. Higher is better.
function computeOverallScore(f: FirmInput, grade: GradeJson): number {
  const rubricAvg = grade.concepts.reduce((s, c) => s + c.score, 0) / grade.concepts.length;
  const letterBonus =
    grade.overall_letter === "A" ? 1.0 :
    grade.overall_letter === "A-" ? 0.75 :
    grade.overall_letter === "B+" ? 0.4 : 0;
  const quizPct = f.quiz.pct ?? 0;
  const verdictBonus = f.verdict.label === "Calibrated" ? 0.5 : f.verdict.label === "Mixed" ? 0.1 : 0;
  // Scaled to roughly 0-10.
  return Math.round(
    (rubricAvg * 1.5 + quizPct * 0.03 + letterBonus + verdictBonus) * 100
  ) / 100;
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
  quiz: Array<{
    id: string;
    concept: string;
    prompt: string;
    correct: string;
    why: string;
  }>;
};

function verdictFor(total: number, avgConf: number | null, perRound: number[]) {
  const positives = perRound.filter((d) => d > 0).length;
  const negatives = perRound.filter((d) => d < 0).length;
  const mixed = positives > 0 && negatives > 0 && Math.abs(total) <= 15;
  if (mixed) {
    return { label: "Mixed" as const, subtitle: "Some calls landed; some didn't." };
  }
  const good = total > 0;
  const high = (avgConf ?? 0) >= 65;
  if (good && high) return { label: "Calibrated" as const, subtitle: "Right call, right confidence." };
  if (good && !high) return { label: "Right, but unsure" as const, subtitle: "The call held up; the hedge didn't need to." };
  if (!good && high) return { label: "Overconfident" as const, subtitle: "Spirit's board was sure too." };
  return { label: "Saw the risk" as const, subtitle: "The dissent you noted was the one that mattered." };
}

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
    const myPlayerIds = new Set(myPlayers);
    const myAnswers = (answersRaw as Array<{ player_id: string; test_key: string; value: string }>)
      .filter((a) => myPlayerIds.has(a.player_id) && a.test_key === "anchor")
      .map((a) => ({ value: a.value }));

    const flags = new Set<string>();
    const perRoundDelta: number[] = [];
    const rounds = [1, 2, 3].map((round) => {
      const rc = content.rounds[round - 1];
      const sub = subs.find((s) => s.firm_id === f.id && s.round === round);
      const opt = sub ? rc.options.find((o) => o.id === sub.option_id) : null;
      const override = opt?.conditional?.find((c) => flags.has(c.ifFlag));
      const cons = override ? override.consequenceOverride : opt?.consequence;
      opt?.setsFlags?.forEach((fl) => flags.add(fl));
      const delta = cons ? cons.meters.cash + cons.meters.trust + cons.meters.fit : 0;
      perRoundDelta.push(delta);
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

    // Quiz aggregation for this firm
    const quizAnswers = (answersRaw as Array<{ player_id: string; test_key: string; value: string }>)
      .filter((a) => myPlayerIds.has(a.player_id) && a.test_key.startsWith("quiz_"));
    const quizTotal = myPlayerIds.size * (content.quiz?.length ?? 0);
    const answered = quizAnswers.length;
    let correct = 0;
    const perConceptMap = new Map<string, { correct: number; total: number }>();
    for (const q of content.quiz ?? []) {
      if (!perConceptMap.has(q.concept)) perConceptMap.set(q.concept, { correct: 0, total: 0 });
    }
    for (const a of quizAnswers) {
      const qid = a.test_key.slice("quiz_".length);
      const q = (content.quiz ?? []).find((x) => x.id === qid);
      if (!q) continue;
      const row = perConceptMap.get(q.concept)!;
      row.total++;
      if (a.value === q.correct) {
        row.correct++;
        correct++;
      }
    }
    const perConcept = Array.from(perConceptMap.entries()).map(([concept, v]) => ({
      concept,
      correct: v.correct,
      total: v.total,
      pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }));
    const pct = answered > 0 ? Math.round((correct / answered) * 100) : null;
    // Concepts the firm got wrong at least once — used for "explain correctly"
    const missedConcepts = new Set<string>();
    for (const a of quizAnswers) {
      const qid = a.test_key.slice("quiz_".length);
      const q = (content.quiz ?? []).find((x) => x.id === qid);
      if (!q) continue;
      if (a.value !== q.correct) missedConcepts.add(q.concept);
    }
    const missed = (content.quiz ?? [])
      .filter((q) => missedConcepts.has(q.concept))
      // one representative question per missed concept
      .filter((q, i, arr) => arr.findIndex((x) => x.concept === q.concept) === i)
      .map((q) => ({ concept: q.concept, prompt: q.prompt, why: q.why }));

    // Verdict
    const totalMeter = perRoundDelta.reduce((s, x) => s + x, 0);
    const confs = subs.filter((s) => s.firm_id === f.id).map((s) => s.confidence).filter((c): c is number => typeof c === "number");
    const avgConf = confs.length ? confs.reduce((s, x) => s + x, 0) / confs.length : null;
    const verdict = verdictFor(totalMeter, avgConf, perRoundDelta);

    return {
      firm_id: f.id,
      firm_name: f.name,
      firm_code: f.code,
      session_code: sessionCode,
      rounds,
      valuation_answers: myAnswers,
      room_choice_distribution: roomDist,
      final_identity: content.finalReveal.identity,
      quiz: {
        pct,
        answered,
        total: quizTotal,
        per_concept: perConcept,
        missed,
      },
      verdict: {
        label: verdict.label,
        subtitle: verdict.subtitle,
        total_meter: totalMeter,
        avg_confidence: avgConf,
        per_round_delta: perRoundDelta,
      },
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
        memo.overall_score = computeOverallScore(f, grade);
        memo.verdict = {
          label: f.verdict.label,
          subtitle: f.verdict.subtitle,
          total_meter: f.verdict.total_meter,
          quiz_pct: f.quiz.pct,
        };
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
