import { Navigate } from "react-router-dom";

// Legacy alias. The ops console lives at /#/falcon now, gated by a
// server-verified PIN. Preserved so bookmarks, QR codes printed in the
// past, and anything linking to /strategy/ops still work.
export default function OpsView() {
  return <Navigate to="/falcon" replace />;
}
