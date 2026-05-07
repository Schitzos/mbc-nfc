import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';

let shouldThrow = true;

const MaybeThrow = (): React.ReactElement => {
  if (shouldThrow) {
    throw new Error('test error');
  }
  return <Text>Recovered</Text>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <Text>OK</Text>
      </ErrorBoundary>,
    );
    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('resets state when Try Again is pressed', () => {
    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    );
    shouldThrow = false;
    fireEvent.press(screen.getByText('Try Again'));
    expect(screen.getByText('Recovered')).toBeTruthy();
  });
});
