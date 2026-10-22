import { motion } from "framer-motion";
import type { Round } from "../../content/types";
import { resolveConsequence } from "../../content/types";
import type { SubmissionRow } from "../../hooks/useSession";
import { Meter } from "../shared/Meter";

export function ConsequenceCard({
  round,
  mySubmission,
  priorFlags,
}: {
  round: Round;
  mySubmission?: SubmissionRow;
  priorFlags: Set<string>;
}) {
  if (!mySubmission) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">No submission from your firm</h2>
        <p className="text-muted-foreground">
          Your firm didn't submit for round {round.id}. Watch the projector for the group reveal.
        </p>
      </div>
    );
  }
  const opt = round.options.find((o) => o.id === mySubmission.option_id);
  if (!opt) return null;

  // v2: first matching flag wins (handled inside resolveConsequence)
  const consequence = resolveConsequence(opt, priorFlags);

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-1">
        Round {round.id} · consequence
      </div>
      <h2 className="text-xl font-bold mb-2">
        Your firm chose: {opt.label}
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 mb-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">{consequence.title}</h3>
          <span
            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
              consequence.outcomeType === "real"
                ? "bg-emerald-500/20 text-emerald-700"
                : "bg-sky-500/20 text-sky-700"
            }`}
          >
            {consequence.outcomeType}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{consequence.body}</p>
      </motion.div>

      <div className="space-y-3 bg-[hsl(220,40%,10%)] text-white rounded-xl p-4">
        <Meter label="Cash runway" value={consequence.meters.cash} tone="cash" />
        <Meter label="Stakeholder trust" value={consequence.meters.trust} tone="trust" />
        <Meter label="Strategic fit" value={consequence.meters.fit} tone="fit" />
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        "{mySubmission.pitch}"
      </p>
    </div>
  );
}
