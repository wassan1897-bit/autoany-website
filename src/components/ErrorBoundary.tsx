import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  /** Rendered instead of the children once the subtree has thrown. */
  fallback?: ReactNode;
  /** Called once, when the subtree first fails. */
  onError?: (error: Error) => void;
};

type ErrorBoundaryState = { failed: boolean };

/**
 * Keeps one failing subtree from blanking the page.
 *
 * The hero mounts a third-party WebGL runtime that fetches its scene and a WASM
 * module from origins we do not control; without a boundary, either of those
 * failing threw past the router and left an empty document.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, info.componentStack);
    }
    this.props.onError?.(error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
