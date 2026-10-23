import { useState } from "react";
import { upsertAnswer } from "../../hooks/useFirm";
import type { AnchorTest, FramingTest } from "../../content/types";
import type { PlayerIdentity } from "../../hooks/usePlayer";

export function AnchorCard({ test, me }: { test: AnchorTest; me: PlayerIdentity }) {
  const [val, setVal] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // v2: highRef/lowRef are prompt strings, not numbers.
  const prompt = me.anchor === "high" ? test.highRef : test.lowRef;
  async function go() {
    const n = Number(val);
    if (!Number.isFinite(n) || n < test.inputMin || n > test.inputMax) {
      setErr(`Give us a number between ${test.inputMin} and ${test.inputMax}.`);
      return;
    }
    try {
      await upsertAnswer(me.id, "anchor", String(n));
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-1">Quick valuation</div>
      <h2 className="text-xl font-bold mb-3">{test.question}</h2>
      <p className="text-sm italic text-muted-foreground mb-4 bg-muted/40 p-3 rounded-md">{prompt}</p>
      <label className="block text-sm font-medium mb-1">Your estimate ({test.unit})</label>
      <input
        type="number"
        inputMode="decimal"
        min={test.inputMin}
        max={test.inputMax}
        step="0.1"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={`${test.inputMin} – ${test.inputMax}`}
        className="w-full px-3 py-3 border rounded-lg mb-4 text-lg font-mono"
      />
      {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
      {sent ? (
        <p className="text-sm text-emerald-700 text-center">
          Thanks — results stay hidden until the final reveal.
        </p>
      ) : (
        <button
          onClick={go}
          className="w-full py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold"
        >
          Submit
        </button>
      )}
    </div>
  );
}

export function FramingCard({ test, me }: { test: FramingTest; me: PlayerIdentity }) {
  const [choice, setChoice] = useState<string>("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    if (!choice) {
      setErr("Pick one.");
      return;
    }
    try {
      await upsertAnswer(me.id, "framing", choice);
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  // v2: gain/loss text selected by player's framing group; choices is a string[]
  const framingText = me.framing === "gain" ? test.gainText : test.lossText;
  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-1">Side bar · board vote</div>
      <p className="text-base leading-relaxed mb-4 italic bg-muted/40 p-3 rounded-md">
        {framingText}
      </p>
      <h2 className="text-lg font-semibold mb-3">{test.question}</h2>
      <div className="space-y-2 mb-4">
        {test.choices.map((c) => (
          <button
            key={c}
            onClick={() => setChoice(c)}
            className={`w-full text-left rounded-lg border-2 p-3 ${
              choice === c ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
      {sent ? (
        <p className="text-sm text-emerald-700 text-center">Logged.</p>
      ) : (
        <button
          onClick={go}
          className="w-full py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold"
        >
          Submit
        </button>
      )}
    </div>
  );
}
