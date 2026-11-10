import { useEffect, useRef, useState } from "react";
import type { Toolkit, ToolkitEntry, ToolkitVisual } from "../../content/types";

// Bottom-right "Toolkit" pill shown during decide_* phases. Opens the sheet.
// Decision form must leave bottom padding so this pill doesn't cover Submit.
export function ToolkitButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Open framework toolkit"
      className="fixed bottom-4 right-4 z-30 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg text-sm font-semibold active:scale-95 transition"
    >
      Toolkit
    </button>
  );
}

// Resolve a frameworks id to the toolkit entry id it maps to.
export function resolveToolkitId(toolkit: Toolkit, frameworkId: string): string {
  return toolkit.aliases[frameworkId] ?? frameworkId;
}

export function ToolkitSheet({
  open,
  onClose,
  toolkit,
  currentRound,
  scrollToId,
}: {
  open: boolean;
  onClose: () => void;
  toolkit: Toolkit;
  currentRound: 1 | 2 | 3;
  scrollToId: string | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    // Prevent body scroll while the sheet is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Scroll to the requested framework when the sheet opens or target changes.
  useEffect(() => {
    if (!open || !scrollToId) return;
    const key = `${scrollToId}:${Date.now()}`;
    if (key === prevOpenKey) return;
    setPrevOpenKey(key);
    const t = setTimeout(() => {
      const el = panelRef.current?.querySelector(
        `[data-toolkit-id="${scrollToId}"]`
      ) as HTMLElement | null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => clearTimeout(t);
  }, [open, scrollToId, prevOpenKey]);

  if (!open) return null;

  const current = toolkit.rounds[`r${currentRound}` as "r1" | "r2" | "r3"] ?? [];
  const earlierRounds = ([1, 2, 3] as const)
    .filter((r) => r < currentRound)
    .map((r) => ({
      round: r,
      entries: toolkit.rounds[`r${r}` as "r1" | "r2" | "r3"] ?? [],
    }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Framework toolkit"
      onClick={(e) => {
        // Click on backdrop closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-xl max-h-[88vh] bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto"
        onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
        onTouchMove={(e) => {
          if (touchStartY == null) return;
          // Only swipe-down close when the content is scrolled to the top.
          const panel = panelRef.current;
          if (panel && panel.scrollTop === 0) {
            const dy = e.touches[0].clientY - touchStartY;
            if (dy > 80) {
              setTouchStartY(null);
              onClose();
            }
          }
        }}
        onTouchEnd={() => setTouchStartY(null)}
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-3 flex items-center justify-between border-b">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary">
              Toolkit
            </div>
            <div className="text-base font-semibold">Round {currentRound} frameworks</div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm border rounded-md hover:bg-muted"
            aria-label="Close toolkit"
          >
            Close
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {current.map((e) => (
            <ToolkitCard key={e.id} entry={e} />
          ))}

          {earlierRounds.length > 0 && (
            <details className="mt-2 rounded-lg border bg-muted/20">
              <summary className="cursor-pointer px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">
                From earlier rounds
              </summary>
              <div className="px-3 pb-3 pt-1 space-y-3">
                {earlierRounds.map(({ round, entries }) => (
                  <div key={round}>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Round {round}
                    </div>
                    <div className="space-y-3">
                      {entries.map((e) => (
                        <ToolkitCard key={e.id} entry={e} compact />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolkitCard({ entry, compact = false }: { entry: ToolkitEntry; compact?: boolean }) {
  return (
    <div
      data-toolkit-id={entry.id}
      className={`rounded-lg border bg-card ${compact ? "p-3" : "p-4"}`}
    >
      <div className="text-base font-semibold mb-1 leading-tight">{entry.name}</div>
      <div className="text-sm text-muted-foreground mb-3 leading-snug">{entry.oneLiner}</div>
      <VisualRenderer v={entry.visual} />
      <div className="mt-3 text-sm">
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">Example:</span> {entry.example}
        </div>
        <div className="mt-2">
          <span className="font-bold">Ask your firm:</span> {entry.ask}
        </div>
      </div>
    </div>
  );
}

function VisualRenderer({ v }: { v: ToolkitVisual }) {
  switch (v.type) {
    case "rows":
      return (
        <div className="divide-y rounded-md border bg-muted/20 text-sm">
          {v.rows.map(([k, val], i) => (
            <div key={i} className="grid grid-cols-[120px_1fr] gap-2 px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground pt-0.5">
                {k}
              </div>
              <div>{val}</div>
            </div>
          ))}
        </div>
      );
    case "matrix": {
      const cells: React.ReactNode[] = [];
      cells.push(<div key="corner" />);
      cells.push(
        <div
          key="col-0"
          className="text-[10px] uppercase tracking-widest text-muted-foreground text-center pb-1"
        >
          {v.cols[0]}
        </div>
      );
      cells.push(
        <div
          key="col-1"
          className="text-[10px] uppercase tracking-widest text-muted-foreground text-center pb-1"
        >
          {v.cols[1]}
        </div>
      );
      for (const r of [0, 1] as const) {
        cells.push(
          <div
            key={`rh-${r}`}
            className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center pr-1"
          >
            {v.rows[r]}
          </div>
        );
        cells.push(
          <div
            key={`cell-${r}-0`}
            className="rounded-md border bg-muted/20 p-2 text-center font-medium"
          >
            {v.cells[r][0]}
          </div>
        );
        cells.push(
          <div
            key={`cell-${r}-1`}
            className="rounded-md border bg-muted/20 p-2 text-center font-medium"
          >
            {v.cells[r][1]}
          </div>
        );
      }
      return (
        <div>
          <div className="grid grid-cols-[110px_1fr_1fr] gap-1 text-xs">{cells}</div>
          {v.note && (
            <div className="mt-2 text-xs italic text-muted-foreground">{v.note}</div>
          )}
        </div>
      );
    }
    case "formula":
      return (
        <div className="rounded-md border bg-muted/40 px-3 py-3 font-mono text-sm text-center">
          {v.text}
        </div>
      );
    case "waterfall":
      return (
        <ol className="space-y-1.5">
          {v.steps.map((s, i) => (
            <li key={i} className="flex flex-col items-stretch">
              <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                  {i + 1}
                </span>
                <span>{s}</span>
              </div>
              {i < v.steps.length - 1 && (
                <div className="text-primary text-center text-base leading-none select-none" aria-hidden="true">
                  ↓
                </div>
              )}
            </li>
          ))}
        </ol>
      );
  }
}
