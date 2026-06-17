import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassmorphicPanel } from './glassmorphic-panel';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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
    toast.error('System Error', {
      description: 'An unexpected error occurred. Please try refreshing the page.',
      duration: 5000,
    });
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <GlassmorphicPanel className="w-full p-6" glow="red" glowIntensity="shadow-xl">
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
            <AlertTriangle className="h-16 w-16 text-red-400 animate-pulse" />
            <h2 className="text-2xl font-bold text-red-300">SYSTEM ERROR DETECTED</h2>
            <p className="text-center text-gray-300 max-w-md">
              The system encountered an unexpected error. The application will attempt to recover automatically.
            </p>
            <div className="text-sm text-gray-400 text-center bg-black/30 p-3 rounded-lg max-w-md">
              <p className="font-medium">Error Details:</p>
              <p className="mt-1">{this.state.error?.message || 'Unknown error'}</p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={this.handleRetry}
                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-red-500/50 transition-all duration-200"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                REFRESH
              </Button>
              <Button
                onClick={() => {
                  // Copy error details to clipboard
                  const errorDetails = this.state.error?.message || 'Unknown error';
                  navigator.clipboard.writeText(errorDetails);
                  toast.info('Error details copied to clipboard', {
                    duration: 3000,
                  });
                }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-gray-500/50 transition-all duration-200"
              >
                COPY ERROR
              </Button>
            </div>
          </div>
        </GlassmorphicPanel>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
