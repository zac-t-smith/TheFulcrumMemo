import { Phase, PHASE_LABEL, PHASE_ORDER, nextPhase, prevPhase } from "../../lib/phases";
import { CountdownTimer } from "../shared/CountdownTimer";

export function PhaseControls({
  phase,
  startedAt,
  timerSeconds,
  onNext,
  onBack,
  onResetTimer,
  onLock,
  canLock,
}: {
  phase: Phase;
  startedAt: string;
  timerSeconds: number;
  onNext: () => void;
  onBack: () => void;
  onResetTimer: () => void;
  onLock: () => void;
  canLock: boolean;
}) {
  const nxt = nextPhase(phase);
  const prv = prevPhase(phase);
  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Current phase</div>
          <div className="text-xl font-bold">{PHASE_LABEL[phase]}</div>
        </div>
        {timerSeconds > 0 && (
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Time</div>
            <CountdownTimer startedAt={startedAt} seconds={timerSeconds} className="text-xl" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          disabled={!prv}
          onClick={onBack}
          className="py-3 border rounded-md font-semibold disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          disabled={!nxt}
          onClick={onNext}
          className="py-3 bg-primary text-primary-foreground rounded-md font-semibold disabled:opacity-40"
        >
          Next phase →
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onResetTimer} className="py-2 text-sm border rounded-md">
          Reset timer
        </button>
        <button
          onClick={onLock}
          disabled={!canLock}
          className="py-2 text-sm border rounded-md disabled:opacity-40"
        >
          Lock submissions
        </button>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Phase {PHASE_ORDER.indexOf(phase) + 1} of {PHASE_ORDER.length}
      </div>
    </div>
  );
}
