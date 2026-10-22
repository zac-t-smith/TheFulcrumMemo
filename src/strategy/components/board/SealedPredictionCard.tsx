import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sha256Hex } from "../../lib/hash";

export function SealedPredictionCard({
  hash,
  revealedText,
}: {
  hash: string | null;
  revealedText: string | null;
}) {
  const [computed, setComputed] = useState<string | null>(null);
  useEffect(() => {
    if (!revealedText) {
      setComputed(null);
      return;
    }
    void sha256Hex(revealedText).then(setComputed);
  }, [revealedText]);

  const match = computed && hash && computed === hash;

  return (
    <div className="rounded-2xl p-8 border border-white/10 bg-white/5">
      <div className="text-xs uppercase tracking-[0.4em] opacity-60 mb-3">Sealed prediction</div>
      {!revealedText ? (
        <>
          <div className="text-2xl font-mono break-all opacity-80">{hash ?? "— not set —"}</div>
          <div className="text-sm opacity-60 mt-3">
            This hash was committed at kickoff. The text behind it will appear at the final reveal.
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="text-2xl mb-6 italic leading-snug">"{revealedText}"</div>
          <div className="text-xs opacity-60 mb-1">Committed hash</div>
          <div className="font-mono text-sm break-all opacity-80 mb-3">{hash}</div>
          <div className="text-xs opacity-60 mb-1">Live recompute</div>
          <div className="font-mono text-sm break-all opacity-80 mb-4">{computed ?? "…"}</div>
          <div
            className={`inline-block px-5 py-2 rounded-full text-xl font-bold ${
              match ? "bg-emerald-500 text-black" : "bg-amber-500/30 text-amber-100"
            }`}
          >
            {match ? "MATCH" : "verifying…"}
          </div>
        </motion.div>
      )}
    </div>
  );
}
