'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <Card className="border border-red-800 bg-black max-w-2xl w-full">
            <CardHeader className="bg-red-950 border-b border-red-800">
              <CardTitle className="text-xl text-red-300">Something went wrong</CardTitle>
              <CardDescription className="text-red-400">
                An unexpected error occurred in the application
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gray-900 border border-gray-800 rounded p-4 mb-4">
                <p className="text-sm text-gray-300 font-mono">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-white hover:bg-gray-200 text-black"
                >
                  Go to Homepage
                </Button>
                <Button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  variant="outline"
                  className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
