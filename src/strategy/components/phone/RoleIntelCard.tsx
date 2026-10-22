import type { Role, RoleIntel } from "../../content/types";
import type { PlayerIdentity } from "../../hooks/usePlayer";

export function RoleIntelCard({
  roles,
  intel,
  me,
}: {
  roles: Role[];
  intel: RoleIntel;
  me: PlayerIdentity;
}) {
  const myRole = roles.find((r) => r.id === me.role) ?? roles[0];
  const intelText = intel[me.role];
  // In firms of 3 the CFO also reads the GC card. We don't know the firm size from here;
  // the parent is responsible for passing GC intel too if applicable.
  const colors = {
    red: "border-[hsl(358,88%,55%)] bg-[hsl(358,88%,55%)]/5",
    navy: "border-[hsl(220,40%,30%)] bg-[hsl(220,40%,30%)]/5",
    amber: "border-amber-500 bg-amber-50",
    slate: "border-slate-500 bg-slate-50",
  } as const;
  return (
    <div className={`rounded-xl border-l-4 p-5 ${colors[myRole.color]}`}>
      <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">Your role</div>
      <div className="text-xl font-bold mb-1">{myRole.title}</div>
      <div className="text-xs text-muted-foreground mb-3">{myRole.focus}</div>
      <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Role intel · only you see this</div>
      <p className="text-sm leading-relaxed">{intelText}</p>
    </div>
  );
}
