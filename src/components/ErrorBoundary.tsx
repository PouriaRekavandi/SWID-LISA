import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SWID-SHRK ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center font-mono">
          <div className="max-w-md w-full bg-zinc-900/90 border border-red-500/50 rounded-xl p-6 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
            <h1 className="text-lg font-bold font-orbitron text-white mb-2">
              SWID-SHRK Application Error
            </h1>
            <p className="text-xs text-zinc-400 mb-4 font-mono">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Lab Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
