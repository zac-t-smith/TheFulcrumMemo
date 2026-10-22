import { useState } from "react";
import { fireInject } from "../../hooks/useOps";
import type { Inject } from "../../content/types";

export function InjectComposer({
  sessionId,
  opsSecret,
  round,
  canned,
}: {
  sessionId: string;
  opsSecret: string;
  round: number;
  canned: Inject[];
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send(t?: string, b?: string) {
    const T = (t ?? title).trim();
    const B = (b ?? body).trim();
    if (!T || !B) {
      setErr("Need both a title and body.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await fireInject(sessionId, opsSecret, round, T, B);
      setTitle("");
      setBody("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-card space-y-3">
      <div className="text-sm font-semibold">Fire inject</div>
      <div className="flex flex-wrap gap-2">
        {canned.map((c) => (
          <button
            key={c.id}
            onClick={() => send(c.title, c.body)}
            className="text-xs px-3 py-1 border rounded-full hover:bg-primary hover:text-primary-foreground"
          >
            {c.title}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Breaking title"
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="One-sentence body"
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button
        disabled={busy}
        onClick={() => send()}
        className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold disabled:opacity-50"
      >
        Push to all phones
      </button>
    </div>
  );
}
