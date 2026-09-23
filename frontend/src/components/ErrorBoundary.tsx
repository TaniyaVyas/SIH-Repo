import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

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
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 max-w-lg w-full text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#E76F51]/10 text-[#E76F51] flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-xl font-black text-[#124B3A]">Application Recovered from Error</h2>
            <p className="text-xs text-[#65736B] leading-relaxed">
              An unexpected issue occurred while rendering this module. Your active retinal image data is safely preserved.
            </p>
            {this.state.error && (
              <pre className="text-[10px] font-mono p-3 rounded-xl bg-[#FAF4ED] text-[#E76F51] overflow-x-auto text-left max-h-24">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-xl bg-[#124B3A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#0E3C2E] transition-all"
              >
                <RotateCcw size={13} />
                <span>Try Reloading Module</span>
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-[#F8F6EF] hover:bg-[#FAF4ED] text-[#124B3A] text-xs font-bold border border-[#DDE5DC] flex items-center gap-1.5 transition-all"
              >
                <Home size={13} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
