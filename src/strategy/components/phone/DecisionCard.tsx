import { useEffect, useState } from "react";
import { upsertSubmission } from "../../hooks/useFirm";
import type { Round, Framework } from "../../content/types";
import type { PlayerIdentity } from "../../hooks/usePlayer";
import type { SubmissionRow } from "../../hooks/useSession";

export function DecisionCard({
  round,
  roundIndex,
  frameworks,
  me,
  current,
}: {
  round: Round;
  roundIndex: number;              // 1-based for the submissions table
  frameworks: Framework[];
  me: PlayerIdentity;
  current: SubmissionRow | undefined;
}) {
  const [optionId, setOptionId] = useState<string>(current?.option_id ?? "");
  const [pitch, setPitch] = useState<string>(current?.pitch ?? "");
  const [frameworkTag, setFrameworkTag] = useState<string>(
    current?.framework_tag ?? frameworks[0]?.id ?? ""
  );
  const [tradeoff, setTradeoff] = useState<string>(current?.tradeoff ?? "");
  const [confidence, setConfidence] = useState<number>(current?.confidence ?? 50);
  const [dissent, setDissent] = useState<string>(current?.dissent ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const locked = current?.locked ?? false;

  useEffect(() => {
    if (current) {
      setOptionId(current.option_id);
      setPitch(current.pitch);
      setFrameworkTag(current.framework_tag);
      setTradeoff(current.tradeoff ?? "");
      setConfidence(current.confidence ?? 50);
      setDissent(current.dissent ?? "");
    }
    // Intentionally keyed on identity, not snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.firm_id, current?.round]);

  async function submit() {
    if (!optionId) { setErr("Pick an option."); return; }
    if (!pitch.trim()) { setErr("One sentence pitch, please."); return; }
    if (!tradeoff.trim()) { setErr("The tradeoff field is required."); return; }
    setBusy(true);
    setErr(null);
    try {
      await upsertSubmission({
        firmId: me.firmId,
        round: roundIndex,
        optionId,
        pitch: pitch.trim(),
        frameworkTag,
        tradeoff: tradeoff.trim(),
        confidence,
        dissent: dissent.trim() || undefined,
        submittedBy: me.id,
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 lg:p-5 max-w-md lg:max-w-none mx-auto lg:mx-0">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-1">
        Round {roundIndex} · firm decision
      </div>
      <h2 className="text-xl font-bold mb-4">{round.question}</h2>

      <div className="space-y-2 mb-4">
        {round.options.map((o) => (
          <button
            key={o.id}
            disabled={locked}
            onClick={() => setOptionId(o.id)}
            className={`w-full text-left rounded-lg border-2 p-3 transition ${
              optionId === o.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">{o.label}</div>
            <div className="text-sm text-muted-foreground">{o.description}</div>
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium mb-1">One-sentence pitch</label>
      <textarea
        maxLength={200}
        value={pitch}
        disabled={locked}
        onChange={(e) => setPitch(e.target.value)}
        placeholder="Why your firm picks this option"
        className="w-full px-3 py-2 border rounded-lg mb-1 text-sm"
        rows={2}
      />
      <div className="text-xs text-muted-foreground text-right mb-3">{pitch.length}/200</div>

      <label className="block text-sm font-medium mb-1">Framework</label>
      <select
        value={frameworkTag}
        disabled={locked}
        onChange={(e) => setFrameworkTag(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg mb-4 text-sm"
      >
        {frameworks.map((f) => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>

      <label className="block text-sm font-medium mb-1">{round.tradeoffPrompt}</label>
      <textarea
        maxLength={200}
        value={tradeoff}
        disabled={locked}
        onChange={(e) => setTradeoff(e.target.value)}
        placeholder="One sentence"
        className="w-full px-3 py-2 border rounded-lg mb-1 text-sm"
        rows={2}
      />
      <div className="text-xs text-muted-foreground text-right mb-3">{tradeoff.length}/200</div>

      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <label className="text-sm font-medium">How sure are you?</label>
          <span className="text-sm font-mono">{confidence}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={confidence}
          disabled={locked}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Not sure</span><span>Very sure</span>
        </div>
      </div>

      <label className="block text-sm font-medium mb-1">
        Dissent <span className="text-xs text-muted-foreground">(optional)</span>
      </label>
      <textarea
        value={dissent}
        disabled={locked}
        onChange={(e) => setDissent(e.target.value)}
        placeholder="Strongest argument against your choice"
        className="w-full px-3 py-2 border rounded-lg mb-4 text-sm"
        rows={2}
      />

      {err && <p className="text-sm text-red-600 mb-3">{err}</p>}

      <button
        onClick={submit}
        disabled={busy || locked}
        className="w-full py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold disabled:opacity-50"
      >
        {locked ? "Locked" : current ? "Update submission" : "Submit"}
      </button>

      {current && !locked && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Any firm member can update until the facilitator locks.
        </p>
      )}
    </div>
  );
}
