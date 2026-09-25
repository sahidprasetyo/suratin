import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props { children: ReactNode; message: string; actionLabel: string; onRecover: () => void; resetKey: number }

/** Keeps the editor usable if the preview throws; the letter itself is already saved. */
export default class PreviewBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Letter preview failed to render', error);
  }

  // Retry after the next edit instead of staying broken until the letter is replaced.
  componentDidUpdate(prev: Props) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="font-sans text-sm text-zinc-700 space-y-3">
        <p>{this.props.message}</p>
        <button
          type="button"
          // A confirmed reset bumps resetKey, which re-arms the boundary; a cancel leaves it down.
          onClick={this.props.onRecover}
          className="rounded-md bg-zinc-800 px-3 py-2 text-white"
        >
          {this.props.actionLabel}
        </button>
      </div>
    );
  }
}
