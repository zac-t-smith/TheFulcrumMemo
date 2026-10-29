import { QRCodeSVG } from "qrcode.react";

export function QRJoin({ sessionCode }: { sessionCode: string }) {
  // HashRouter: route path lives in the URL hash fragment
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${import.meta.env.BASE_URL}#/strategy/play?s=${sessionCode}`
      : `#/strategy/play?s=${sessionCode}`;
  return (
    <div className="flex items-center gap-10 bg-white/5 p-10 rounded-2xl border border-white/10">
      <div className="bg-white p-5 rounded-xl">
        <QRCodeSVG value={url} size={240} level="M" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.4em] opacity-60 mb-3">Scan to join</div>
        <div className="text-4xl font-semibold mb-4">Session code</div>
        <div className="text-7xl font-bold tracking-widest text-[#E0263F]">{sessionCode}</div>
        <div className="text-sm opacity-60 mt-4">{url}</div>
      </div>
    </div>
  );
}
