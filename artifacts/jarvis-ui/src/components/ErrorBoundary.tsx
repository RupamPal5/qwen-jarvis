import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassmorphicPanel } from './glassmorphic-panel';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <GlassmorphicPanel className="w-full p-6" glow="red" glowIntensity="shadow-xl">
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
            <AlertTriangle className="h-16 w-16 text-red-400" />
            <h2 className="text-2xl font-bold text-red-300">SYSTEM GLITCH DETECTED</h2>
            <p className="text-center text-gray-300 max-w-md">
              The system encountered an unexpected error. Don't worry, we can recover from this.
            </p>
            <div className="text-sm text-gray-400 text-center">
              <p>Error: {this.state.error?.message || 'Unknown error'}</p>
            </div>
            <Button
              onClick={this.handleRetry}
              className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-red-500/50 transition-all duration-200"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              RECOVER SYSTEM
            </Button>
          </div>
        </GlassmorphicPanel>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
