import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

jest.mock('../navigation', () => ({
  AppNavigator: () => null,
}));

jest.mock('../providers', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => children,
}));

describe('src app entry', () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});
