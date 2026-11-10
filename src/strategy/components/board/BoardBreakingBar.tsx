import { motion, AnimatePresence } from "framer-motion";

// Full-width breaking bar for the projected BoardRoom. Mirrors InjectBanner
// on phones (same copy, same color) so the room reads as one voice.
// `phaseKey` is the current phase string; when it changes, framer-motion
// re-mounts the banner and the exit animation clears it automatically.
export function BoardBreakingBar({
  title,
  body,
  phaseKey,
}: {
  title: string | null;
  body: string | null;
  phaseKey: string;
}) {
  const show = Boolean(title && body);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`${phaseKey}-breaking`}
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed top-0 inset-x-0 z-50 bg-[#C8102E] text-white px-8 py-5 shadow-2xl"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-[1600px] mx-auto">
            <div className="text-xs md:text-sm uppercase tracking-[0.4em] opacity-90 mb-1">
              Breaking
            </div>
            <div className="text-2xl md:text-3xl font-semibold leading-tight">{title}</div>
            <div className="text-base md:text-lg opacity-95 mt-1">{body}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
