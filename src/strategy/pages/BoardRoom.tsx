import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import caseContent from "../content/case.json";
import type { CaseContent } from "../content/types";
import { useSession } from "../hooks/useSession";
import { supabaseConfigured } from "../lib/supabase";
import { PHASE_LABEL, Phase, phaseRound } from "../lib/phases";
import { PhaseBanner } from "../components/board/PhaseBanner";
import { QRJoin } from "../components/board/QRJoin";
import { FirmLeaderboard } from "../components/board/FirmLeaderboard";
import { ChoiceDistribution } from "../components/board/ChoiceDistribution";
import { WhatHappenedCard } from "../components/board/RevealStage";
import { SealedPredictionCard } from "../components/board/SealedPredictionCard";
import { StrategyErrorBoundary } from "../components/shared/ErrorBoundary";
import { createDemoDriver, DemoDriver } from "../lib/demo";
import type { AnswerRow, FirmRow, PlayerRow, SubmissionRow } from "../hooks/useSession";
import { evaluatePrediction } from "../lib/predictions";

const content = caseContent as CaseContent;

export default function BoardRoom() {
  const [params] = useSearchParams();
  const isDemo = params.get("demo") === "1";
  const code = params.get("s") ?? "";

  return (
    <StrategyErrorBoundary projector>
      <div
        className="strategy-dark min-h-screen"
        style={{
          background: 'var(--paper)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-serif)',
        }}
      >
        {isDemo ? <BoardRoomDemo /> : code ? <BoardRoomLive code={code} /> : <BoardRoomChooser />}
      </div>
    </StrategyErrorBoundary>
  );
}

function BoardRoomChooser() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-12">
      <h1 className="text-5xl font-semibold mb-6">Strategy Board Room</h1>
      <p className="text-xl opacity-70 mb-8">Choose how to run the room.</p>
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl w-full">
        <a
          href="#/strategy?demo=1"
          className="rounded-xl border border-white/20 p-6 hover:border-[#E0263F] transition"
        >
          <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Rehearsal</div>
          <div className="text-2xl font-semibold mb-2">Demo mode</div>
          <div className="text-sm opacity-70">
            Runs the full flow offline with fake firms. No Supabase required. Use this as the
            backup if the network drops.
          </div>
        </a>
        <a href="#/falcon" className="rounded-xl border border-white/20 p-6 hover:border-[#E0263F] transition">
          <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Live</div>
          <div className="text-2xl font-semibold mb-2">Open FALCON console →</div>
          <div className="text-sm opacity-70">
            Facilitator PIN required. Opens the live session students join at <code>/#/join</code>.
          </div>
        </a>
      </div>
      {!supabaseConfigured && (
        <p className="text-xs opacity-60 mt-8">
          (Supabase env not configured in this build — only demo mode will run.)
        </p>
      )}
    </div>
  );
}

function BoardRoomLive({ code }: { code: string }) {
  const bundle = useSession(code);
  if (bundle.loading) return <StandbyScreen label="Loading session…" />;
  if (!bundle.session) return <StandbyScreen label={`No session found for code ${code}`} />;
  const s = bundle.session;
  return (
    <BoardRoomInner
      phase={s.phase}
      round={s.round}
      startedAt={s.phase_started_at}
      timerSeconds={s.timer_seconds}
      firms={bundle.firms}
      players={bundle.players}
      submissions={bundle.submissions}
      answers={bundle.answers}
      predictionHash={s.prediction_hash}
      predictionText={s.prediction_text}
      sessionCode={s.code}
    />
  );
}

function BoardRoomDemo() {
  const [driver] = useState<DemoDriver>(() => createDemoDriver());
  const [state, setState] = useState(driver.getState());
  useEffect(() => driver.subscribe(setState), [driver]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") driver.next();
      if (e.key === "ArrowLeft") driver.back();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [driver]);

  // Auto-populate prediction hash on first render for the demo
  useEffect(() => {
    if (!state.session.prediction_hash) {
      void import("../lib/hash").then(({ sha256Hex }) =>
        sha256Hex(content.predictions.map((p) => p.text).join("\n")).then((h) =>
          driver.setPredictionHash(h)
        )
      );
    }
  }, [driver, state.session.prediction_hash]);

  // On final_reveal, auto-reveal
  useEffect(() => {
    if (state.session.phase === "final_reveal" && !state.session.prediction_text) {
      driver.revealPrediction(content.predictions.map((p) => p.text).join("\n"));
    }
  }, [state.session.phase, state.session.prediction_text, driver]);

  return (
    <>
      <div className="fixed bottom-4 right-4 text-xs opacity-60 bg-white/10 px-3 py-1 rounded-full">
        DEMO · ← / → or space to advance
      </div>
      <BoardRoomInner
        phase={state.session.phase}
        round={state.session.round}
        startedAt={state.session.phase_started_at}
        timerSeconds={state.session.timer_seconds}
        firms={state.firms.map((f) => ({ ...f, session_id: "demo" }))}
        players={state.players.map((p) => ({ ...p, session_id: "demo" }))}
        submissions={state.submissions.map((s) => ({ ...s, session_id: "demo", updated_at: "" }))}
        answers={[]}
        predictionHash={state.session.prediction_hash}
        predictionText={state.session.prediction_text}
        sessionCode="DEMO"
      />
    </>
  );
}

function StandbyScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] opacity-60 mb-3">Standby</div>
        <div className="text-3xl font-semibold">{label}</div>
      </div>
    </div>
  );
}

type BoardInnerProps = {
  phase: Phase;
  round: number;
  startedAt: string;
  timerSeconds: number;
  firms: FirmRow[];
  players: PlayerRow[];
  submissions: SubmissionRow[];
  answers: AnswerRow[];
  predictionHash: string | null;
  predictionText: string | null;
  sessionCode: string;
};

function BoardRoomInner({
  phase,
  round,
  startedAt,
  timerSeconds,
  firms,
  players,
  submissions,
  answers,
  predictionHash,
  predictionText,
  sessionCode,
}: BoardInnerProps) {
  const r = phaseRound(phase);
  const roundContent = useMemo(() => (r ? content.rounds[r - 1] : null), [r]);

  return (
    <div className="p-10 md:p-16 min-h-screen">
      <PhaseBanner phase={phase} round={round} startedAt={startedAt} timerSeconds={timerSeconds} />
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {phase === "lobby" && (
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {sessionCode === "DEMO" ? (
                <div className="rounded-xl border border-white/15 p-8">
                  <div className="text-xs uppercase tracking-[0.3em] opacity-60 mb-3">Rehearsal</div>
                  <div className="text-3xl font-semibold mb-3">Projector only</div>
                  <div className="text-sm opacity-70">
                    Demo mode runs the full flow against fake firms. Phones can't join. Use this as the
                    backup if the network drops.
                  </div>
                </div>
              ) : (
                <QRJoin sessionCode={sessionCode} />
              )}
              <div>
                <div className="text-xs uppercase tracking-[0.3em] opacity-60 mb-3">
                  Firms assembling
                </div>
                <FirmLeaderboard firms={firms} players={players} />
              </div>
            </div>
          )}

          {phase === "kickoff" && (
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h2 className="text-4xl font-semibold mb-4">{content.meta.engagementTitle}</h2>
                <ul className="space-y-3 text-xl">
                  {content.meta.objectives.map((o, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#E0263F]">▸</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-base opacity-70">
                  Client: <span className="font-semibold">{content.meta.clientAlias}</span> — identity
                  revealed at the end.
                </p>
              </div>
              <SealedPredictionCard hash={predictionHash} revealedText={null} />
            </div>
          )}

          {phase === "anchor_test" && (
            <div className="max-w-5xl">
              <h2 className="text-4xl font-semibold mb-6">On your phones</h2>
              <p className="text-2xl opacity-80">
                Give your gut valuation for {content.meta.clientAlias}. Results stay sealed until the
                debrief.
              </p>
            </div>
          )}

          {phase.startsWith("teach_") && roundContent && (
            <div className="grid lg:grid-cols-2 gap-8">
              {roundContent.concepts.map((c, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <div className="text-xs uppercase tracking-[0.4em] text-[#E0263F] mb-3">
                    {c.label}: {c.title}
                  </div>
                  <ul className="space-y-3 text-lg">
                    {c.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="text-[#E0263F]">▸</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {phase.startsWith("decide_") && roundContent && (
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <div className="text-xs uppercase tracking-[0.4em] text-[#E0263F] mb-3">
                  APPLICATION
                </div>
                <h3 className="text-4xl font-semibold mb-4">{roundContent.question}</h3>
                <div className="text-xl opacity-80">Firms are deciding on their phones.</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.4em] opacity-60 mb-3">
                  Submissions in
                </div>
                <div className="text-7xl font-semibold mb-6">
                  {submissions.filter((s) => s.round === round).length}
                  <span className="opacity-40"> / {firms.length}</span>
                </div>
                <FirmLeaderboard firms={firms} players={players} />
              </div>
            </div>
          )}

          {phase.startsWith("reveal_") && roundContent && (
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-3xl font-semibold mb-6">The room's choices</h3>
                <ChoiceDistribution
                  round={round}
                  roundContent={roundContent}
                  submissions={submissions}
                  firms={firms}
                />
              </div>
              <WhatHappenedCard round={roundContent} />
            </div>
          )}

          {phase === "final_reveal" && (
            <FinalRevealStage
              submissions={submissions}
              players={players}
              answers={answers}
              firms={firms}
              predictionHash={predictionHash}
              predictionText={predictionText}
            />
          )}

          {phase === "done" && (
            <div className="text-center mt-20">
              <h2 className="text-5xl font-semibold mb-4">Thank you.</h2>
              <p className="text-xl opacity-80">
                Debrief in your firms. Questions welcome.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FinalRevealStage({
  submissions,
  players,
  answers,
  firms,
  predictionHash,
  predictionText,
}: {
  submissions: SubmissionRow[];
  players: PlayerRow[];
  answers: AnswerRow[];
  firms: FirmRow[];
  predictionHash: string | null;
  predictionText: string | null;
}) {
  const results = content.predictions.map((p) => ({
    pred: p,
    result: evaluatePrediction(p.check, { answers, players, submissions }),
  }));

  // Calibration: for each firm, average confidence across rounds vs. its total meter delta.
  const calibrationPoints = firms.map((f) => {
    const subs = submissions.filter((s) => s.firm_id === f.id);
    const avgConf =
      subs.length === 0
        ? 0
        : subs.reduce((s, x) => s + (x.confidence ?? 0), 0) / subs.length;
    let meterDelta = 0;
    const flags = new Set<string>();
    for (const sub of subs.sort((a, b) => a.round - b.round)) {
      const rc = content.rounds[sub.round - 1];
      const opt = rc?.options.find((o) => o.id === sub.option_id);
      if (!opt) continue;
      const override = opt.conditional?.find((c) => flags.has(c.ifFlag));
      const c = override ? override.consequenceOverride : opt.consequence;
      meterDelta += c.meters.cash + c.meters.trust + c.meters.fit;
      opt.setsFlags?.forEach((fl) => flags.add(fl));
    }
    return { code: f.code, avgConf, meterDelta };
  });

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div>
        <h3 className="text-3xl font-semibold mb-4">The client was…</h3>
        <div className="text-6xl font-bold text-[#E0263F] mb-4">
          {content.meta.realName}
        </div>
        <p className="text-base opacity-80 mb-2">{content.finalReveal.identity}</p>
        <p className="text-base italic opacity-80 mb-6">{content.finalReveal.closer}</p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-5">
          <div className="text-xs uppercase tracking-widest opacity-60 mb-3">
            Sealed predictions — machine-checked against your room
          </div>
          <ol className="space-y-3 text-sm">
            {results.map(({ pred, result }, i) => (
              <li key={pred.id} className="flex gap-3">
                <span
                  className={`shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                    result.ok ? "bg-emerald-500 text-black" : "bg-amber-500/30 text-amber-100"
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <div>{pred.text}</div>
                  <div className="text-[11px] opacity-70 mt-1">
                    {result.ok ? "✓ held" : "✗ did not hold"} · {result.detail}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-widest opacity-60 mb-3">
            Calibration: confidence vs. outcome
          </div>
          <CalibrationChart points={calibrationPoints} />
          <p className="text-xs opacity-60 mt-3">{content.calibration.note}</p>
        </div>
      </div>
      <SealedPredictionCard hash={predictionHash} revealedText={predictionText} />
    </div>
  );
}

function CalibrationChart({
  points,
}: {
  points: { code: string; avgConf: number; meterDelta: number }[];
}) {
  const W = 320;
  const H = 180;
  const pad = 24;
  const xs = points.map((p) => p.avgConf);
  const ys = points.map((p) => p.meterDelta);
  const xMin = 0;
  const xMax = 100;
  const yMin = Math.min(-30, ...ys);
  const yMax = Math.max(30, ...ys);
  const x = (v: number) => pad + ((v - xMin) / (xMax - xMin)) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - yMin) / (yMax - yMin || 1)) * (H - pad * 2);
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="text-white">
      <line x1={pad} y1={y(0)} x2={W - pad} y2={y(0)} stroke="currentColor" strokeOpacity="0.3" />
      <line x1={x(50)} y1={pad} x2={x(50)} y2={H - pad} stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2,3" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(p.avgConf)} cy={y(p.meterDelta)} r={6} fill="#C8102E" opacity={0.85} />
          <text x={x(p.avgConf) + 8} y={y(p.meterDelta) + 3} fontSize="10" fill="currentColor">
            {p.code}
          </text>
        </g>
      ))}
      <text x={pad} y={H - 4} fontSize="9" fill="currentColor" opacity={0.6}>
        confidence →
      </text>
      <text x={W - pad - 60} y={H - 4} fontSize="9" fill="currentColor" opacity={0.6} textAnchor="end">
        meter Δ ↑
      </text>
    </svg>
  );
}
