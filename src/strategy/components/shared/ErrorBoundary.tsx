import React from "react";

type Props = { children: React.ReactNode; projector?: boolean };
type State = { error: Error | null };

export class StrategyErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidCatch(error: Error) {
    // Projector-safe: swallow and show a muted standby card instead of a stack trace.
    console.error("[strategy] render error", error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.projector) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(220,40%,8%)] text-white">
          <div className="text-center">
            <div className="text-sm uppercase tracking-[0.3em] opacity-60 mb-4">Standby</div>
            <div className="text-3xl font-semibold">Reconnecting…</div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Something went sideways.</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Pull-to-refresh and we'll try again. If this keeps happening, ask your facilitator.
          </p>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
