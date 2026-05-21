import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NfcLogPanel } from '../index';
import { useAppStore } from '@presentation/stores/app-store';

describe('NfcLogPanel', () => {
  beforeEach(() => {
    useAppStore.setState({
      nfcLogEnabled: true,
      nfcLogs: [
        { id: '1', message: 'Test log', createdAt: '2026-05-01T10:30:45.000Z' },
      ],
    });
  });

  it('renders with dark variant (default)', () => {
    render(<NfcLogPanel />);
    expect(screen.getByText('NFC Log')).toBeTruthy();
    expect(screen.getByText('ON')).toBeTruthy();
  });

  it('renders with light variant', () => {
    render(<NfcLogPanel variant="light" />);
    expect(screen.getByText('NFC Log')).toBeTruthy();
  });

  it('shows OFF and hidden message when nfcLogEnabled is false', () => {
    useAppStore.setState({ nfcLogEnabled: false });
    render(<NfcLogPanel />);
    expect(screen.getByText('OFF')).toBeTruthy();
    expect(screen.getByText(/Log panel hidden/)).toBeTruthy();
  });

  it('shows empty state when logs are empty', () => {
    useAppStore.setState({ nfcLogEnabled: true, nfcLogs: [] });
    render(<NfcLogPanel />);
    expect(screen.getByText('No NFC log lines yet.')).toBeTruthy();
  });

  it('toggles log enabled on press', () => {
    render(<NfcLogPanel />);
    fireEvent.press(screen.getByText('ON'));
    expect(useAppStore.getState().nfcLogEnabled).toBe(false);
  });

  it('clears logs on press', () => {
    render(<NfcLogPanel />);
    fireEvent.press(screen.getByText('Clear'));
    expect(useAppStore.getState().nfcLogs).toHaveLength(0);
  });

  it('returns null when __DEV__ is false', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    const { toJSON } = render(<NfcLogPanel />);
    expect(toJSON()).toBeNull();
    (global as any).__DEV__ = originalDev;
  });
});
