import { useMemo, useState } from "react";
import type { QAEntry } from "../../content/types";

export function QABankTab({ entries }: { entries: QAEntry[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return entries;
    return entries.filter(
      (e) =>
        e.q.toLowerCase().includes(needle) ||
        e.a.toLowerCase().includes(needle) ||
        e.tags.some((t) => t.toLowerCase().includes(needle))
    );
  }, [entries, q]);
  return (
    <div className="rounded-xl border p-4 bg-card">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search Q&A bank…"
        className="w-full px-3 py-2 border rounded-md text-sm mb-3"
      />
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {filtered.map((e, i) => (
          <details key={i} className="rounded-md border p-2">
            <summary className="font-semibold text-sm cursor-pointer">{e.q}</summary>
            <p className="text-sm mt-2 text-muted-foreground">{e.a}</p>
            <div className="flex gap-1 mt-2">
              {e.tags.map((t) => (
                <span key={t} className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-muted">
                  {t}
                </span>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
