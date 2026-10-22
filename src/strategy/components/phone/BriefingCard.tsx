import type { Round } from "../../content/types";

export function BriefingCard({ round }: { round: Round }) {
  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-1">
        Round {round.id} briefing · {round.dateLabel}
      </div>
      <h2 className="text-2xl font-bold mb-3">{round.title}</h2>
      <p className="text-base leading-relaxed mb-6">{round.briefing}</p>
      <p className="text-sm text-muted-foreground">
        The projector is covering the concept. Watch there, then your exhibit opens next.
      </p>
    </div>
  );
}
