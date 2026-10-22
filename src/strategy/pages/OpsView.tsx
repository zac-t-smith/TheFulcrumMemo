import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import caseContent from "../content/case.json";
import type { CaseContent } from "../content/types";
import { useSession } from "../hooks/useSession";
import { PinGate } from "../components/ops/PinGate";
import { PhaseControls } from "../components/ops/PhaseControls";
import { FirmGrid } from "../components/ops/FirmGrid";
import { PredictionsPanel } from "../components/ops/PredictionsPanel";
import { InjectComposer } from "../components/ops/InjectComposer";
import { QABankTab } from "../components/ops/QABankTab";
import { StrategyErrorBoundary } from "../components/shared/ErrorBoundary";
import { advanceSession, createSession, stepPhase } from "../hooks/useOps";
import { supabaseConfigured } from "../lib/supabase";
import { DEFAULT_TIMER, nextPhase, phaseRound, Phase } from "../lib/phases";

const content = caseContent as CaseContent;

export default function OpsView() {
  return (
    <StrategyErrorBoundary>
      <PinGate>
        <OpsInner />
      </PinGate>
    </StrategyErrorBoundary>
  );
}

function OpsInner() {
  const [params, setParams] = useSearchParams();
  const code = params.get("s") ?? "";
  const [secret, setSecret] = useState<string>(() => sessionStorage.getItem("fm_strategy_ops_secret") ?? "");
  const [tab, setTab] = useState<"console" | "qa">("console");

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">Backend not configured</h1>
          <p className="text-sm text-muted-foreground">
            Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, rebuild, and reload. Rehearsal still
            works via /strategy?demo=1.
          </p>
        </div>
      </div>
    );
  }

  if (!code) {
    return <NewSessionForm onCreated={(c, s) => { setSecret(s); sessionStorage.setItem("fm_strategy_ops_secret", s); setParams({ s: c }); }} />;
  }
  if (!secret) {
    return <SecretGate code={code} onSet={setSecret} />;
  }
  return (
    <>
      <OpsConsole code={code} secret={secret} tab={tab} setTab={setTab} />
    </>
  );
}

function NewSessionForm({ onCreated }: { onCreated: (code: string, secret: string) => void }) {
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    if (!/^[A-Z0-9]{3,6}$/.test(code)) {
      setErr("Code: 3-6 letters/numbers, uppercase.");
      return;
    }
    if (secret.length < 6) {
      setErr("Ops secret: at least 6 characters.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await createSession(code, secret);
      onCreated(code, secret);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">New session</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Pick a short code (shown to students) and an ops secret (used to protect phase changes).
        </p>
        <label className="block text-sm font-medium mb-1">Session code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="e.g., FALCON"
          className="w-full px-3 py-3 border rounded-lg mb-4 text-lg font-mono"
        />
        <label className="block text-sm font-medium mb-1">Ops secret</label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="At least 6 characters"
          className="w-full px-3 py-3 border rounded-lg mb-6 text-lg"
        />
        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
        <button
          disabled={busy}
          onClick={go}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50"
        >
          Create session
        </button>
      </div>
    </div>
  );
}

function SecretGate({ code, onSet }: { code: string; onSet: (s: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Session {code}</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter the ops secret to resume.</p>
        <input
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full px-3 py-3 border rounded-lg mb-4"
        />
        <button
          onClick={() => {
            if (val) {
              sessionStorage.setItem("fm_strategy_ops_secret", val);
              onSet(val);
            }
          }}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function OpsConsole({
  code,
  secret,
  tab,
  setTab,
}: {
  code: string;
  secret: string;
  tab: "console" | "qa";
  setTab: (t: "console" | "qa") => void;
}) {
  const bundle = useSession(code);
  const session = bundle.session;
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const roundContent = useMemo(
    () => (session ? content.rounds[(phaseRound(session.phase) ?? 1) - 1] : null),
    // Only re-derive on the phase string change, not the whole session object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.phase]
  );
  const injectBank = useMemo(() => {
    const all = content.rounds.flatMap((r) => r.injects);
    return all;
  }, []);

  async function doAdvance(direction: 1 | -1) {
    if (!session) return;
    const target = stepPhase(session.phase as Phase, direction);
    if (!target) return;
    setBusy(true);
    setErr(null);
    try {
      await advanceSession(session.id, secret, target);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function resetTimer() {
    if (!session) return;
    try {
      await advanceSession(session.id, secret, session.phase as Phase, DEFAULT_TIMER[session.phase as Phase]);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function lockRound() {
    // Lock = flip submissions.locked for current round.
    // Supabase doesn't need an RPC — anon has update on submissions. We bulk-update.
    if (!session) return;
    const r = phaseRound(session.phase as Phase);
    if (!r) return;
    const sb = (await import("../lib/supabase")).getSupabase();
    const { error } = await sb
      .from("submissions")
      .update({ locked: true })
      .eq("session_id", session.id)
      .eq("round", r);
    if (error) setErr(error.message);
  }

  if (bundle.loading) return <div className="p-6">Loading…</div>;
  if (!session) return <div className="p-6">No session.</div>;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-30 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Session</div>
          <div className="font-mono text-lg font-bold">{session.code}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("console")}
            className={`px-3 py-1 rounded-md text-sm ${
              tab === "console" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            Console
          </button>
          <button
            onClick={() => setTab("qa")}
            className={`px-3 py-1 rounded-md text-sm ${
              tab === "qa" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            Q&A bank
          </button>
          <a
            href={`${import.meta.env.BASE_URL}#/strategy?s=${session.code}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-md text-sm border"
          >
            Open board ↗
          </a>
        </div>
      </header>
      {err && (
        <div className="bg-red-50 border-b border-red-300 text-red-800 text-sm px-4 py-2">{err}</div>
      )}

      {tab === "qa" ? (
        <div className="p-4 max-w-3xl mx-auto">
          <QABankTab entries={content.qaBank} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4 p-4">
          <div className="lg:col-span-1 space-y-4">
            <PhaseControls
              phase={session.phase as Phase}
              startedAt={session.phase_started_at}
              timerSeconds={session.timer_seconds}
              onNext={() => doAdvance(1)}
              onBack={() => doAdvance(-1)}
              onResetTimer={resetTimer}
              onLock={lockRound}
              canLock={!!phaseRound(session.phase as Phase)}
            />
            <PredictionsPanel
              sessionId={session.id}
              opsSecret={secret}
              currentHash={session.prediction_hash}
              revealed={session.prediction_text}
            />
            <InjectComposer
              sessionId={session.id}
              opsSecret={secret}
              round={session.round}
              canned={injectBank}
            />
            <div className="rounded-xl border p-4 bg-card text-xs text-muted-foreground">
              <div className="font-semibold text-foreground mb-1">Up next</div>
              <div>
                Next phase: <span className="font-semibold">{nextPhase(session.phase as Phase) ?? "—"}</span>
              </div>
              <div className="mt-1">
                Busy: {busy ? "yes" : "no"}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <FirmGrid
              firms={bundle.firms}
              players={bundle.players}
              submissions={bundle.submissions}
              round={session.round}
              roundContent={roundContent ?? undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
