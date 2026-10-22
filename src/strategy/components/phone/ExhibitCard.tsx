import { useState } from "react";
import type { Round } from "../../content/types";

export function ExhibitCard({
  round,
  roundIndex,
}: {
  round: Round;
  roundIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const x = round.exhibit;
  return (
    <div className="p-6 lg:p-5 max-w-md lg:max-w-none mx-auto lg:mx-0">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-1">
        Exhibit · Round {roundIndex}
      </div>
      <h2 className="text-xl font-bold mb-4">{round.title}</h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {x.kpis.map((k) => (
          <div key={k.label} className="rounded-md border p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {k.label}
            </div>
            <div className="text-xl font-bold">{k.value}</div>
            {k.note && <div className="text-xs text-muted-foreground">{k.note}</div>}
          </div>
        ))}
      </div>

      <div className="rounded-md border p-3 mb-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {x.chart.title ?? `${x.chart.type} chart`}
        </div>
        <MiniChart chart={x.chart} />
      </div>

      <div className="space-y-2 mb-4">
        {x.headlines.map((h, i) => (
          <div key={i} className="rounded-md bg-muted/50 p-3">
            <div className="text-sm font-semibold leading-tight">{h.text}</div>
            <div className="text-xs text-muted-foreground">
              {h.outlet} · {h.date}
            </div>
          </div>
        ))}
      </div>

      {x.deepDive && (
        <button
          onClick={() => setOpen(!open)}
          className="w-full py-2 text-sm font-semibold border rounded-md"
        >
          {open ? "Hide" : x.deepDive.title}
        </button>
      )}
      {open && x.deepDive && (
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground leading-relaxed list-disc list-inside">
          {x.deepDive.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}

function MiniChart({ chart }: { chart: Round["exhibit"]["chart"] }) {
  // v2: series[].values (was .data in v1)
  const all = chart.series.flatMap((s) => s.values);
  const max = Math.max(...all);
  const min = Math.min(...all);
  const H = 80;
  const W = 240;
  const stepX = chart.labels.length > 1 ? W / (chart.labels.length - 1) : W;
  const y = (v: number) => H - ((v - min) / (max - min || 1)) * (H - 10) - 5;
  const colors = ["hsl(358,88%,55%)", "hsl(210,70%,55%)"];

  if (chart.type === "bar") {
    const barW = Math.max(10, (W / chart.labels.length) * 0.6);
    return (
      <svg width="100%" height={H + 20} viewBox={`0 0 ${W} ${H + 20}`}>
        {chart.series[0].values.map((v, i) => {
          const h = ((v - min) / (max - min || 1)) * (H - 10);
          const x = i * stepX + stepX / 2 - barW / 2;
          return (
            <rect
              key={i}
              x={x}
              y={H - h - 5}
              width={barW}
              height={Math.max(0, h)}
              fill={colors[0]}
            />
          );
        })}
        {chart.labels.map((l, i) => (
          <text
            key={i}
            x={i * stepX + stepX / 2}
            y={H + 15}
            fontSize="9"
            textAnchor="middle"
            fill="currentColor"
          >
            {l}
          </text>
        ))}
      </svg>
    );
  }

  return (
    <svg width="100%" height={H + 20} viewBox={`0 0 ${W} ${H + 20}`}>
      {chart.series.map((s, si) => {
        const d = s.values
          .map((v, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${y(v)}`)
          .join(" ");
        return <path key={si} d={d} stroke={colors[si % colors.length]} fill="none" strokeWidth={2} />;
      })}
      {chart.labels.map((l, i) => (
        <text key={i} x={i * stepX} y={H + 15} fontSize="9" textAnchor="middle" fill="currentColor">
          {l}
        </text>
      ))}
    </svg>
  );
}
