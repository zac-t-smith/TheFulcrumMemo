import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Students scan the board's QR and land here. The one permanent live
// session is FALCON, so there is no code to type. Programmatic redirect
// (rather than <Navigate>) so the destination is explicit if the
// router ever gets wrapped by something that reinterprets `to` strings.
export default function FalconJoin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ pathname: "/strategy/play", search: "?s=FALCON" }, { replace: true });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] opacity-60 mb-2">Session</div>
        <div className="text-2xl font-semibold">Opening FALCON…</div>
      </div>
    </div>
  );
}
