import { useState } from "react";

const SESSION_KEY = "fm_strategy_ops_pin_ok";

export function PinGate({ children }: { children: React.ReactNode }) {
  const required = (import.meta.env.VITE_OPS_PIN as string | undefined) ?? "";
  const [ok, setOk] = useState<boolean>(
    required === "" || sessionStorage.getItem(SESSION_KEY) === "1"
  );
  const [input, setInput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (ok) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Ops access</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the facilitator PIN. This is a UI gate only — real mutations are protected
          server-side by a per-session ops secret.
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="PIN"
          className="w-full px-3 py-3 border rounded-lg mb-3 text-lg font-mono"
        />
        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
        <button
          onClick={() => {
            if (input === required) {
              sessionStorage.setItem(SESSION_KEY, "1");
              setOk(true);
            } else {
              setErr("Not quite.");
            }
          }}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
