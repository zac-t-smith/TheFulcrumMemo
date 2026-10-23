import type { FirmRow, PlayerRow } from "../../hooks/useSession";
import type { PlayerIdentity } from "../../hooks/usePlayer";

export function FirmLobby({
  firm,
  members,
  me,
}: {
  firm: FirmRow;
  members: PlayerRow[];
  me: PlayerIdentity;
}) {
  const bigEnough = members.length >= 7;
  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-1">Your firm</div>
      <h2 className="text-3xl font-bold">{firm.name}</h2>
      <div className="text-lg font-mono tracking-widest text-muted-foreground mb-6">{firm.code}</div>

      <div className="rounded-lg bg-muted/50 p-4 mb-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {members.length} member{members.length === 1 ? "" : "s"}
        </div>
        <ul className="space-y-1">
          {members.map((m) => (
            <li key={m.id} className={m.id === me.id ? "font-semibold" : ""}>
              {m.display_name}
              {m.id === me.id ? " (you)" : ""}
            </li>
          ))}
        </ul>
      </div>

      {bigEnough && (
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-3 mb-4 text-sm">
          Your firm has {members.length} members. Consider splitting into two firms so everyone can
          contribute.
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Waiting on the facilitator to start. Share your code{" "}
        <span className="font-mono font-bold">{firm.code}</span> with anyone still joining.
      </p>
    </div>
  );
}
