import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import caseContent from "../../content/case.json";
import type { CaseContent } from "../../content/types";
import { useSession } from "../../hooks/useSession";
import { PhaseControls } from "./PhaseControls";
import { FirmGrid } from "./FirmGrid";
import { PredictionsPanel } from "./PredictionsPanel";
import { InjectComposer } from "./InjectComposer";
import { QABankTab } from "./QABankTab";
import { advanceSession, stepPhase } from "../../hooks/useOps";
import { DEFAULT_TIMER, nextPhase, phaseRound, Phase } from "../../lib/phases";

const content = caseContent as CaseContent;

function JoinLinkInfo({ playerCount }: { playerCount: number }) {
  const base = import.meta.env.BASE_URL;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${base}#/join`
      : `${base}#/join`;
  const copy = () => {
    navigator.clipboard?.writeText(url).then(
      () => toast.success("Player join link copied."),
      () => toast.error("Clipboard blocked — copy from the URL field.")
    );
  };
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Players join
        </div>
        <div className="font-mono text-sm truncate" title={url}>
          {url.replace(/^https?:\/\//, "")}
        </div>
        <div className="text-xs text-muted-foreground">
          {playerCount} connected
        </div>
      </div>
      <button
        onClick={copy}
        className="shrink-0 px-2 py-1 border rounded-md text-xs hover:bg-muted"
        aria-label="Copy player join link"
      >
        <Copy className="h-3 w-3 inline mr-1" />
        Copy
      </button>
    </div>
  );
}

export function OpsConsole({
  code,
  secret,
  tab,
  setTab,
  headerExtras,
}: {
  code: string;
  secret: string;
  tab: "console" | "qa";
  setTab: (t: "console" | "qa") => void;
  headerExtras?: ReactNode;
}) {
  const bundle = useSession(code);
  const session = bundle.session;
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const roundContent = useMemo(
    () => (session ? content.rounds[(phaseRound(session.phase) ?? 1) - 1] : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.phase]
  );
  const injectBank = useMemo(() => content.rounds.flatMap((r) => r.injects), []);

  // Admin-side poll fallback: realtime on firms/players is unreliable because
  // the admin page already holds a competing useSession channel upstream in
  // FalconOps. Poll every 5s so the firms grid and player count stay fresh
  // even if the WebSocket subscription silently drops events.
  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => { void bundle.refetch(); }, 5000);
    return () => clearInterval(t);
  }, [session?.id, bundle.refetch]);

  async function doAdvance(direction: 1 | -1) {
    if (!session) return;
    if (busy) return; // guard against double-click producing two advances
    const target = stepPhase(session.phase as Phase, direction);
    if (!target) return;
    setBusy(true);
    setErr(null);
    try {
      await advanceSession(session.id, secret, target);
      toast.success(direction === 1 ? `Advanced to ${target}.` : `Back to ${target}.`);
      await bundle.refetch(); // don't trust realtime; our own RPC must reflect immediately
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      toast.error(`Advance failed: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  async function resetTimer() {
    if (!session) return;
    try {
      await advanceSession(session.id, secret, session.phase as Phase, DEFAULT_TIMER[session.phase as Phase]);
      toast.success("Timer reset.");
      await bundle.refetch();
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      toast.error(`Timer reset failed: ${msg}`);
    }
  }

  async function lockRound() {
    if (!session) return;
    const r = phaseRound(session.phase as Phase);
    if (!r) return;
    const sb = (await import("../../lib/supabase")).getSupabase();
    const { error, count } = await sb
      .from("submissions")
      .update({ locked: true }, { count: "exact" })
      .eq("session_id", session.id)
      .eq("round", r);
    if (error) {
      setErr(error.message);
      toast.error(`Lock failed: ${error.message}`);
    } else {
      toast.success(`Locked round ${r}${typeof count === "number" ? ` (${count} submissions)` : ""}.`);
      await bundle.refetch();
    }
  }

  if (bundle.loading) return <div className="p-6">Loading…</div>;
  if (!session) return <div className="p-6">No session.</div>;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-30 bg-background border-b px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Session</div>
            <div className="font-mono text-lg font-bold">{session.code}</div>
          </div>
          <JoinLinkInfo playerCount={bundle.players.length} />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
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
          {headerExtras}
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
              phoneCount={bundle.players.length}
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
