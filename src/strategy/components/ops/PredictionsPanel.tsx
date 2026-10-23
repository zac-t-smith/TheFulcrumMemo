import { useState } from "react";
import { setPredictionHash, revealPrediction } from "../../hooks/useOps";

export function PredictionsPanel({
  sessionId,
  opsSecret,
  currentHash,
  revealed,
}: {
  sessionId: string;
  opsSecret: string;
  currentHash: string | null;
  revealed: string | null;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function commit() {
    if (!text.trim()) {
      setErr("Enter the prediction text before committing.");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const h = await setPredictionHash(sessionId, opsSecret, text);
      setMsg(`Committed: ${h.slice(0, 12)}…`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function reveal() {
    if (!text.trim()) {
      setErr("Paste the SAME prediction text you committed, then reveal.");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await revealPrediction(sessionId, opsSecret, text);
      setMsg("Revealed. The board will show the live hash recompute.");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-card space-y-3">
      <div className="text-sm font-semibold">Sealed predictions</div>
      <div className="text-xs text-muted-foreground">
        Paste your prediction text before class. Commit the hash now. Reveal the same text at final.
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="e.g., The modal firm will pick D in round 1 and B in round 3."
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={commit}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold disabled:opacity-50"
        >
          Commit hash
        </button>
        <button
          disabled={busy}
          onClick={reveal}
          className="flex-1 py-2 border rounded-md text-sm font-semibold disabled:opacity-50"
        >
          Reveal text
        </button>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      {msg && <p className="text-xs text-emerald-700">{msg}</p>}
      <div className="text-xs text-muted-foreground">
        Current hash: <span className="font-mono">{currentHash ? currentHash.slice(0, 16) + "…" : "—"}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Revealed? {revealed ? "yes" : "no"}
      </div>
    </div>
  );
}
