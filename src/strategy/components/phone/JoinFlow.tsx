import { useRef, useState } from "react";
import { joinOrCreateByCode } from "../../hooks/useFirm";
import type { SessionRow } from "../../hooks/useSession";
import type { PlayerIdentity } from "../../hooks/usePlayer";

type Mode = "start" | "join" | "place";

const CTA_IDLE: Record<Mode, string> = {
  start: "Start firm",
  join: "Join firm",
  place: "Place me into a firm",
};

const CTA_BUSY: Record<Mode, string> = {
  start: "Starting firm…",
  join: "Joining firm…",
  place: "Placing you…",
};

export function JoinFlow({
  session,
  onJoined,
}: {
  session: SessionRow;
  onJoined: (p: PlayerIdentity) => void;
}) {
  const [mode, setMode] = useState<Mode>("start");
  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Ref lock: React state updates aren't synchronous enough to block a
  // double-tap that fires both handlers before the first setBusy(true)
  // repaints the disabled button. The ref flips immediately.
  const inFlight = useRef(false);

  async function submit() {
    if (inFlight.current) return;
    if (!name.trim()) {
      setErr("Your first name, please.");
      return;
    }
    if (mode === "start" && !firmName.trim()) {
      setErr("Name your firm, or pick Join firm / Place me.");
      return;
    }
    if (mode === "join" && !joinCode.trim()) {
      setErr("Enter the 3-letter firm code.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setErr(null);
    try {
      const res = await joinOrCreateByCode({
        session,
        displayName: name.trim(),
        firmName: mode === "start" ? firmName.trim() : undefined,
        joinCode: mode === "join" ? joinCode.trim() : undefined,
        autoPlace: mode === "place",
      });
      onJoined(res.player);
    } catch (e) {
      setErr((e as Error).message);
      inFlight.current = false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto">
      <div className="mt-6 mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">
          Session {session.code}
        </div>
        <h1 className="text-3xl font-bold mb-1">Join the engagement</h1>
        <p className="text-muted-foreground">You'll form or join a firm and advise Falcon.</p>
      </div>

      <label className="block text-sm font-medium mb-1">First name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={busy}
        placeholder="e.g., Jordan"
        className="w-full px-4 py-3 border rounded-lg mb-6 text-lg disabled:opacity-50"
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        {(["start", "join", "place"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            disabled={busy}
            className={`py-3 rounded-lg text-sm font-semibold disabled:opacity-50 ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {m === "start" ? "Start firm" : m === "join" ? "Join code" : "Place me"}
          </button>
        ))}
      </div>

      {mode === "start" && (
        <input
          value={firmName}
          onChange={(e) => setFirmName(e.target.value)}
          disabled={busy}
          placeholder="Firm name (e.g., Keystone Capital)"
          className="w-full px-4 py-3 border rounded-lg mb-6 text-lg disabled:opacity-50"
        />
      )}

      {mode === "join" && (
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 3))}
          disabled={busy}
          placeholder="3-letter code"
          className="w-full px-4 py-3 border rounded-lg mb-6 text-lg tracking-[0.4em] font-mono uppercase disabled:opacity-50"
        />
      )}

      {mode === "place" && (
        <p className="text-sm text-muted-foreground mb-6">
          We'll place you with the smallest firm. You can switch later.
        </p>
      )}

      {err && <p className="text-sm text-red-600 mb-3">{err}</p>}

      <button
        disabled={busy}
        onClick={submit}
        className="w-full py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold disabled:opacity-50"
      >
        {busy ? CTA_BUSY[mode] : CTA_IDLE[mode]}
      </button>
    </div>
  );
}
