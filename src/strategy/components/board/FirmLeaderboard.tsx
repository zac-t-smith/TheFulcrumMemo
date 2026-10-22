import type { FirmRow, PlayerRow } from "../../hooks/useSession";

export function FirmLeaderboard({ firms, players }: { firms: FirmRow[]; players: PlayerRow[] }) {
  if (!firms.length)
    return (
      <div className="text-xl opacity-60 italic">
        Firms will appear here as students join…
      </div>
    );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {firms.map((f) => {
        const members = players.filter((p) => p.firm_id === f.id);
        const bigEnough = members.length >= 7;
        return (
          <div
            key={f.id}
            className={`rounded-xl p-5 border bg-white/5 ${
              bigEnough ? "border-amber-400/60" : "border-white/10"
            }`}
          >
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm uppercase tracking-widest opacity-60">{f.code}</div>
              <div className="text-sm opacity-70">{members.length} members</div>
            </div>
            <div className="text-xl font-semibold truncate">{f.name}</div>
            {bigEnough && (
              <div className="mt-2 text-xs text-amber-300">Consider splitting into two firms</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
