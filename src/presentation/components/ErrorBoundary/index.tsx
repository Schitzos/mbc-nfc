import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-6 bg-white">
          <Text className="text-xl font-semibold mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-[#666] text-center mb-6">
            The app encountered an unexpected error. Please try again.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-[#0050AE] px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
