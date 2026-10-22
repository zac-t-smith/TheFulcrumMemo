import { motion, AnimatePresence } from "framer-motion";
import type { InjectRow } from "../../hooks/useSession";

export function InjectBanner({ latest }: { latest: InjectRow | null }) {
  return (
    <AnimatePresence>
      {latest && (
        <motion.div
          key={latest.id}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="sticky top-0 z-40 bg-[hsl(358,88%,47%)] text-white px-4 py-3 shadow-lg"
        >
          <div className="text-[10px] uppercase tracking-widest opacity-80">Breaking</div>
          <div className="font-semibold text-sm">{latest.title}</div>
          <div className="text-xs opacity-90 mt-1">{latest.body}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
