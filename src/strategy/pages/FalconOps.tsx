import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StrategyErrorBoundary } from "../components/shared/ErrorBoundary";
import { OpsConsole } from "../components/ops/OpsConsole";
import { useSession } from "../hooks/useSession";
import { supabaseConfigured } from "../lib/supabase";
import { verifyOpsSecret, resetSession } from "../hooks/useOps";

const FALCON = "FALCON";
const PIN_KEY = "fm_falcon_pin";

export default function FalconOps() {
  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">Backend not configured</h1>
          <p className="text-sm text-muted-foreground">
            Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, rebuild, and reload. Rehearsal still
            works via <a href="#/strategy?demo=1" className="underline">Rehearsal mode</a>.
          </p>
        </div>
      </div>
    );
  }
  return (
    <StrategyErrorBoundary>
      <FalconOpsInner />
    </StrategyErrorBoundary>
  );
}

function FalconOpsInner() {
  const bundle = useSession(FALCON);
  const session = bundle.session;
  const [pin, setPin] = useState<string>(() => sessionStorage.getItem(PIN_KEY) ?? "");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"console" | "qa">("console");

  // When a PIN is already cached, verify silently as soon as the session loads.
  useEffect(() => {
    if (!pin || !session || verified) return;
    (async () => {
      try {
        const ok = await verifyOpsSecret(session.id, pin);
        if (ok) setVerified(true);
        else {
          sessionStorage.removeItem(PIN_KEY);
          setPin("");
        }
      } catch {
        /* fall through to the PIN form */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  if (bundle.loading && !session) {
    return <CenterFrame>Loading session…</CenterFrame>;
  }
  if (!session) {
    return (
      <CenterFrame>
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">No FALCON session.</div>
          <div className="text-sm text-muted-foreground">
            Run the live-entry migration first. Then set the PIN hash in the SQL editor.
          </div>
        </div>
      </CenterFrame>
    );
  }

  async function tryPin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!session) return;
    if (pin.length < 6) {
      setErr("PIN must be at least 6 characters.");
      return;
    }
    setVerifying(true);
    setErr(null);
    try {
      const ok = await verifyOpsSecret(session.id, pin);
      if (ok) {
        sessionStorage.setItem(PIN_KEY, pin);
        setVerified(true);
      } else {
        setErr("Wrong PIN.");
      }
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setVerifying(false);
    }
  }

  if (!verified) {
    return (
      <CenterFrame>
        <form onSubmit={tryPin} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-2">Team PIN</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the facilitator PIN to open the FALCON console. The PIN is verified
            server-side; wrong PINs can't open the console or run any ops action.
          </p>
          <input
            type="password"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full px-3 py-3 border rounded-lg mb-3 text-lg font-mono"
          />
          {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50"
          >
            {verifying ? "Verifying…" : "Enter"}
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            Rehearsal without PIN: <a className="underline" href="#/strategy?demo=1">open demo mode</a>.
          </p>
        </form>
      </CenterFrame>
    );
  }

  return (
    <OpsConsole
      code={FALCON}
      secret={pin}
      tab={tab}
      setTab={setTab}
      headerExtras={<CockpitButtons sessionId={session.id} pin={pin} />}
    />
  );
}

function CockpitButtons({ sessionId, pin }: { sessionId: string; pin: string }) {
  const base = import.meta.env.BASE_URL;
  const boardUrl = `${base}#/strategy?s=${FALCON}`;
  const demoUrl = `${base}#/strategy?demo=1`;
  return (
    <>
      <a
        href={boardUrl}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1 rounded-md text-sm border"
      >
        Open board ↗
      </a>
      <a
        href={demoUrl}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1 rounded-md text-sm border"
      >
        Rehearsal ↗
      </a>
      <ResetButton sessionId={sessionId} pin={pin} />
    </>
  );
}

function ResetButton({ sessionId, pin }: { sessionId: string; pin: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [working, setWorking] = useState(false);

  async function doReset() {
    setWorking(true);
    try {
      await resetSession(sessionId, pin);
      toast.success("Session reset — all firms, players, submissions, injects deleted.");
      setOpen(false);
      setTyped("");
    } catch (e) {
      toast.error(`Reset failed: ${(e as Error).message}`);
    } finally {
      setWorking(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 rounded-md text-sm border border-red-500 text-red-600 hover:bg-red-50"
      >
        Reset session
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 p-2 border border-red-500 rounded-md bg-red-50">
      <span className="text-xs text-red-800">Type RESET to confirm:</span>
      <input
        autoFocus
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder="RESET"
        className="px-2 py-1 border rounded text-sm font-mono w-24"
      />
      <button
        disabled={typed !== "RESET" || working}
        onClick={doReset}
        className="px-2 py-1 bg-red-600 text-white rounded text-sm font-semibold disabled:opacity-50"
      >
        {working ? "…" : "Reset"}
      </button>
      <button
        onClick={() => { setOpen(false); setTyped(""); }}
        className="px-2 py-1 text-sm text-muted-foreground"
      >
        Cancel
      </button>
    </div>
  );
}

function CenterFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {children}
    </div>
  );
}
