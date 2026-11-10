import { QRCodeSVG } from "qrcode.react";
import type { FirmRow, PlayerRow } from "../../hooks/useSession";

// Projected lobby: step-by-step join instructions + live counts + firm list.
// Replaces the raw QRJoin + leaderboard split for the lobby phase so the
// room sees a single, easy-to-read screen.
export function JoinSteps({
  sessionCode,
  firms,
  players,
}: {
  sessionCode: string;
  firms: FirmRow[];
  players: PlayerRow[];
}) {
  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${import.meta.env.BASE_URL}#/join`
      : `#/join`;

  return (
    <div className="grid lg:grid-cols-5 gap-10 items-start">
      {/* Left: steps */}
      <div className="lg:col-span-3">
        <div className="text-xs uppercase tracking-[0.4em] opacity-60 mb-4">
          Join the live game
        </div>
        <ol className="space-y-5">
          <Step n={1}>
            Go to <span className="font-semibold">thefulcrummemo.com</span>
          </Step>
          <Step n={2}>
            Tap <span className="font-semibold">"Join the live game"</span>
          </Step>
          <Step n={3}>Enter your first name</Step>
          <Step n={4}>Start a firm, or join one with its 3-letter code</Step>
        </ol>
        <div className="mt-8 text-sm opacity-70">
          Session <span className="font-mono text-[#E0263F] font-semibold">{sessionCode}</span>
        </div>
      </div>

      {/* Right: QR + counts */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-5">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={joinUrl} size={150} level="M" />
          </div>
          <div className="text-xs opacity-70 leading-relaxed">
            Or scan this with your phone camera.
            <div className="mt-2 font-mono text-[11px] opacity-60 break-all">
              {joinUrl.replace(/^https?:\/\//, "")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CountTile label="Players" value={players.length} />
          <CountTile label={`Firm${firms.length === 1 ? "" : "s"}`} value={firms.length} />
        </div>

        <FirmList firms={firms} players={players} />
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-5">
      <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C8102E] text-white text-2xl font-bold">
        {n}
      </span>
      <span className="text-3xl md:text-4xl leading-tight pt-1">{children}</span>
    </li>
  );
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">{label}</div>
      <div className="text-5xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function FirmList({ firms, players }: { firms: FirmRow[]; players: PlayerRow[] }) {
  if (firms.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm italic opacity-60">
        Firms will appear here as students join…
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2">Firms</div>
      <ul className="space-y-1.5 max-h-56 overflow-auto pr-1">
        {firms.map((f) => {
          const count = players.filter((p) => p.firm_id === f.id).length;
          return (
            <li key={f.id} className="flex items-baseline justify-between text-sm">
              <span className="truncate pr-2">
                <span className="font-mono text-[#E0263F] mr-2">{f.code}</span>
                {f.name}
              </span>
              <span className="opacity-70 shrink-0">
                {count} member{count === 1 ? "" : "s"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
