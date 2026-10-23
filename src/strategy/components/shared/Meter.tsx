import { motion } from "framer-motion";

export function Meter({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number; // -30 .. +30
  tone?: "cash" | "trust" | "fit" | "neutral";
}) {
  const pct = Math.min(100, Math.max(0, ((value + 30) / 60) * 100));
  const color =
    tone === "cash"
      ? "bg-emerald-500"
      : tone === "trust"
      ? "bg-sky-500"
      : tone === "fit"
      ? "bg-amber-500"
      : "bg-primary";
  return (
    <div>
      <div className="flex justify-between text-xs uppercase tracking-widest opacity-80 mb-1">
        <span>{label}</span>
        <span className={value >= 0 ? "text-emerald-300" : "text-red-300"}>
          {value >= 0 ? "+" : ""}
          {value}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
