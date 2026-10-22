import { motion } from "framer-motion";
import type { Round } from "../../content/types";

export function WhatHappenedCard({ round }: { round: Round }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-2xl p-8 border border-[hsl(358,88%,55%)]/50 bg-[hsl(358,88%,55%)]/10"
    >
      <div className="text-xs uppercase tracking-[0.4em] text-[hsl(358,88%,70%)] mb-3">
        {round.whatHappened.date}
      </div>
      <h3 className="text-3xl font-semibold mb-4">{round.whatHappened.title}</h3>
      <p className="text-xl leading-relaxed opacity-90">{round.whatHappened.body}</p>
    </motion.div>
  );
}
