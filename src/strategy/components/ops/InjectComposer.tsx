import { useState } from "react";
import { toast } from "sonner";
import { fireInject } from "../../hooks/useOps";
import type { Inject } from "../../content/types";

export function InjectComposer({
  sessionId,
  opsSecret,
  round,
  canned,
  phoneCount,
}: {
  sessionId: string;
  opsSecret: string;
  round: number;
  canned: Inject[];
  phoneCount: number;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function selectPresetKeyed(c: Inject, key: string) {
    setTitle(c.title);
    setBody(c.body);
    setSelectedId(key);
    setErr(null);
  }

  async function send() {
    const T = title.trim();
    const B = body.trim();
    if (!T || !B) {
      setErr("Need both a title and body.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await fireInject(sessionId, opsSecret, round, T, B);
      toast.success(`Sent to ${phoneCount} ${phoneCount === 1 ? "phone" : "phones"}.`);
      setTitle("");
      setBody("");
      setSelectedId(null);
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      toast.error(`Inject failed: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-card space-y-3">
      <div className="text-sm font-semibold">Fire inject</div>
      <div className="flex flex-wrap gap-2">
        {canned.map((c, i) => {
          // case.json injects don't carry stable ids; fall back to title+index
          // so React can key the list without "same key" warnings.
          const key = c.id ?? `${c.title}-${i}`;
          const isSelected = key === selectedId;
          return (
            <button
              key={key}
              onClick={() => selectPresetKeyed(c, key)}
              className={`text-xs px-3 py-1 border rounded-full transition ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-primary/10"
              }`}
              aria-pressed={isSelected}
            >
              {c.title}
            </button>
          );
        })}
      </div>
      <input
        value={title}
        onChange={(e) => { setTitle(e.target.value); setSelectedId(null); }}
        placeholder="Breaking title"
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => { setBody(e.target.value); setSelectedId(null); }}
        rows={2}
        placeholder="One-sentence body"
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button
        disabled={busy}
        onClick={send}
        className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold disabled:opacity-50"
      >
        {busy ? "Pushing…" : `Push to ${phoneCount} ${phoneCount === 1 ? "phone" : "phones"}`}
      </button>
    </div>
  );
}
