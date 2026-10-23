import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { usePlayerIdentity } from "../hooks/usePlayer";
import { phaseKind, phaseRound } from "../lib/phases";
import caseContent from "../content/case.json";
import type { CaseContent } from "../content/types";
import { JoinFlow } from "../components/phone/JoinFlow";
import { FirmLobby } from "../components/phone/FirmLobby";
import { BriefingCard } from "../components/phone/BriefingCard";
import { ExhibitCard } from "../components/phone/ExhibitCard";
import { DecisionCard } from "../components/phone/DecisionCard";
import { ConsequenceCard } from "../components/phone/ConsequenceCard";
import { AnchorCard, FramingCard } from "../components/phone/SplitTestCard";
import { InjectBanner } from "../components/phone/InjectBanner";
import { RoleIntelCard } from "../components/phone/RoleIntelCard";
import { StrategyErrorBoundary } from "../components/shared/ErrorBoundary";
import { supabaseConfigured } from "../lib/supabase";

const content = caseContent as CaseContent;

export default function PlayerView() {
  const [params] = useSearchParams();
  const [codeInput, setCodeInput] = useState("");
  const code = params.get("s") ?? codeInput;

  if (!code) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-2">Join a session</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter the code from the projector.</p>
        <input
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="CODE"
          className="w-full max-w-xs px-4 py-3 border rounded-lg text-2xl text-center font-mono tracking-widest mb-4"
        />
        <a
          href={`?s=${codeInput}`}
          className="w-full max-w-xs text-center py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
        >
          Go
        </a>
      </div>
    );
  }

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-bold mb-2">Backend not configured</h1>
          <p className="text-sm text-muted-foreground">
            Your facilitator can run the projector in demo mode. The phone view requires Supabase env
            vars at build time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StrategyErrorBoundary>
      <PlayerViewInner code={code} />
    </StrategyErrorBoundary>
  );
}

function PlayerViewInner({ code }: { code: string }) {
  const bundle = useSession(code);
  const [me, setMe] = usePlayerIdentity(code);

  const session = bundle.session;
  const myFirm = me && session ? bundle.firms.find((f) => f.id === me.firmId) ?? null : null;
  const latestInject = bundle.injects[0] ?? null;

  const r = session ? phaseRound(session.phase) : null;
  const myFirmId = myFirm?.id ?? null;

  // Flags accumulated across prior rounds for this firm (drives conditional consequences).
  const priorFlags = useMemo(() => {
    const flags = new Set<string>();
    if (!myFirmId || !r) return flags;
    for (const sub of bundle.submissions) {
      if (sub.firm_id !== myFirmId || sub.round >= r) continue;
      const prior = content.rounds[sub.round - 1];
      const opt = prior?.options.find((o) => o.id === sub.option_id);
      opt?.setsFlags?.forEach((f) => flags.add(f));
    }
    return flags;
  }, [bundle.submissions, myFirmId, r]);

  if (bundle.loading) return <Full>Loading…</Full>;
  if (!session) return <Full>No session <span className="font-mono">{code}</span>.</Full>;
  if (!me || !myFirm) {
    return (
      <>
        <InjectBanner latest={latestInject} />
        <JoinFlow session={session} onJoined={setMe} />
      </>
    );
  }

  const roundContent = r ? content.rounds[r - 1] : null;
  const members = bundle.players.filter((p) => p.firm_id === myFirm.id);
  const myCurrentSub =
    roundContent && r
      ? bundle.submissions.find((s) => s.firm_id === me.firmId && s.round === r)
      : undefined;

  return (
    <>
      <InjectBanner latest={latestInject} />
      <div className="min-h-screen">
        {session.phase === "lobby" && <FirmLobby firm={myFirm} members={members} me={me} />}

        {session.phase === "kickoff" && (
          <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-3">{content.meta.engagementTitle}</h1>
            <ul className="space-y-2 mb-4">
              {content.meta.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">▸</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs italic text-muted-foreground mb-4">{content.meta.disclaimer}</p>
            <p className="text-sm text-muted-foreground">
              Firm: <span className="font-semibold">{myFirm.name}</span> ·{" "}
              <span className="font-mono">{myFirm.code}</span> · role:{" "}
              <span className="font-semibold">
                {content.meta.roles.find((rl) => rl.id === me.role)?.title}
              </span>
            </p>
          </div>
        )}

        {session.phase === "anchor_test" && <AnchorCard test={content.splitTests.anchor} me={me} />}

        {phaseKind(session.phase) === "teach" && roundContent && (
          <BriefingCard round={roundContent} />
        )}

        {phaseKind(session.phase) === "decide" && roundContent && r && (
          <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:p-6 max-w-7xl lg:mx-auto">
            {/* Panel 1: Exhibit */}
            <div className="lg:col-span-1">
              <ExhibitCard round={roundContent} roundIndex={r} />
            </div>
            {/* Panel 2: Role intel + split-test side bar for R2 framing */}
            <div className="lg:col-span-1 p-6 lg:p-0 space-y-4">
              <RoleIntelCard
                roles={content.meta.roles}
                intel={roundContent.roleIntel}
                me={me}
              />
              {members.length <= 3 && me.role === "cfo" && (
                <RoleIntelCard
                  roles={content.meta.roles}
                  intel={roundContent.roleIntel}
                  // Firms of 3: CFO also sees GC. Fake-override by passing a GC-shaped me.
                  me={{ ...me, role: "gc" }}
                />
              )}
              {r === content.splitTests.framing.round && (
                <FramingCard test={content.splitTests.framing} me={me} />
              )}
            </div>
            {/* Panel 3: Decision form */}
            <div className="lg:col-span-1">
              <DecisionCard
                round={roundContent}
                roundIndex={r}
                frameworks={content.frameworks}
                me={me}
                current={myCurrentSub}
              />
            </div>
          </div>
        )}

        {phaseKind(session.phase) === "reveal" && roundContent && (
          <ConsequenceCard
            round={roundContent}
            mySubmission={myCurrentSub}
            priorFlags={priorFlags}
          />
        )}

        {session.phase === "final_reveal" && (
          <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-2">The debrief</h1>
            <p className="text-sm text-muted-foreground">
              Watch the projector. Your firm's choices are on screen.
            </p>
          </div>
        )}

        {session.phase === "done" && (
          <div className="p-6 max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-2">Thank you.</h1>
            <p className="text-sm text-muted-foreground">Questions welcome.</p>
          </div>
        )}
      </div>
    </>
  );
}

function Full({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center p-6 text-center">{children}</div>;
}
