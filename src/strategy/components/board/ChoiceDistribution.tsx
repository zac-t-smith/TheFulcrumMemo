import { motion } from "framer-motion";
import type { FirmRow, SubmissionRow } from "../../hooks/useSession";
import type { Round } from "../../content/types";

export function ChoiceDistribution({
  round,
  roundContent,
  submissions,
  firms,
}: {
  round: number;
  roundContent: Round;
  submissions: SubmissionRow[];
  firms: FirmRow[];
}) {
  const subs = submissions.filter((s) => s.round === round);
  const total = subs.length || 1;
  return (
    <div className="space-y-4">
      {roundContent.options.map((opt) => {
        const picks = subs.filter((s) => s.option_id === opt.id);
        const pct = (picks.length / total) * 100;
        return (
          <div key={opt.id}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xl font-semibold">{opt.label}</span>
              <span className="text-sm opacity-70">
                {picks.length}/{subs.length} firms
              </span>
            </div>
            <div className="h-4 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-[#E0263F]"
              />
            </div>
            {picks.length > 0 && (
              <div className="text-xs opacity-60 mt-1">
                {picks
                  .map((s) => firms.find((f) => f.id === s.firm_id)?.code ?? "?")
                  .join(" · ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
