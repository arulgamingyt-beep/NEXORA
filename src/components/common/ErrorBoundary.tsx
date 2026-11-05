import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, ShieldAlert, LogOut } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    // Sanitize error message to prevent leaking stack traces or internal paths
    const cleanMsg = error?.message
      ? error.message.replace(/([a-zA-Z]:\\[^:\n\r]+)/g, '[internal path]')
      : 'An unexpected transmission exception occurred.';
    return { hasError: true, errorMessage: cleanMsg };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Production safe logging (does not expose tokens, auth keys, or user credentials)
    if (process.env.NODE_ENV !== 'production') {
      console.error('[NEXORA SECURITY SANDBOX] Anomaly caught by ErrorBoundary:', error, errorInfo);
    }
  }

  private handleReboot = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      localStorage.removeItem('nexora_active_session_v1');
    } catch {}
    this.setState({ hasError: false, errorMessage: '' });
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#070810] text-slate-100 p-6 select-none font-sans relative overflow-hidden">
          {/* Cyberpunk Background Glows */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-md w-full bg-gradient-to-b from-[#121424] to-[#0a0b16] border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                SECURITY SANDBOX INTERCEPT
              </span>
              <h1 className="text-xl font-extrabold text-white mt-2">
                Interface Glitch Contained
              </h1>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                An unexpected transmission error was captured before it could compromise application state.
              </p>
            </div>

            {this.state.errorMessage && (
              <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-left text-xs font-mono text-rose-300 break-words max-h-24 overflow-y-auto">
                {this.state.errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReboot}
                className="flex-1 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-violet-600/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reboot Terminal</span>
              </button>

              <button
                onClick={this.handleClearAndReset}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

