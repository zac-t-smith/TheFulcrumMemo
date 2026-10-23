import { useEffect, useState } from "react";

export function CountdownTimer({
  startedAt,
  seconds,
  className = "",
}: {
  startedAt: string;
  seconds: number;
  className?: string;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  if (!seconds) return null;
  const start = new Date(startedAt).getTime();
  const remaining = Math.max(0, Math.floor((start + seconds * 1000 - now) / 1000));
  const m = Math.floor(remaining / 60)
    .toString()
    .padStart(1, "0");
  const s = (remaining % 60).toString().padStart(2, "0");
  const low = remaining <= 15;
  return (
    <span className={`font-mono tabular-nums ${low ? "text-red-400" : ""} ${className}`}>
      {m}:{s}
    </span>
  );
}
