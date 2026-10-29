import { Phase, PHASE_LABEL } from "../../lib/phases";
import { CountdownTimer } from "../shared/CountdownTimer";
import { motion } from "framer-motion";

export function PhaseBanner({
  phase,
  round,
  startedAt,
  timerSeconds,
}: {
  phase: Phase;
  round: number;
  startedAt: string;
  timerSeconds: number;
}) {
  return (
    <div className="flex items-end justify-between border-b-4 border-[#E0263F] pb-6 mb-10">
      <div>
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs uppercase tracking-[0.4em] opacity-70 mb-3"
        >
          Falcon Airways — Live Engagement{round ? ` · Round ${round}` : ""}
        </motion.div>
        <motion.h1
          key={phase + "h"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-6xl md:text-7xl font-semibold tracking-tight"
        >
          {PHASE_LABEL[phase]}
        </motion.h1>
      </div>
      {timerSeconds > 0 && (
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.3em] opacity-60 mb-2">Time</div>
          <CountdownTimer startedAt={startedAt} seconds={timerSeconds} className="text-6xl" />
        </div>
      )}
    </div>
  );
}
