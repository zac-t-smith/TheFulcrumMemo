import { Navigate } from "react-router-dom";

// Students scan the board's QR and land here. The one permanent live
// session is FALCON, so there is no code to type.
export default function FalconJoin() {
  return <Navigate to="/strategy/play?s=FALCON" replace />;
}
