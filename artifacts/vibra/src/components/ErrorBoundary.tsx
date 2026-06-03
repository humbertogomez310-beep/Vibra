import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

// React requires class components for error boundaries.
// Wrap any visual/animated component that might throw (canvas, etc.).
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch() {
    // Could log to a monitoring service here in a future version
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card border border-border text-center">
          <AlertTriangle size={28} className="text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            {this.props.label ?? "Este componente no pudo cargarse"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="text-xs text-primary underline"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
