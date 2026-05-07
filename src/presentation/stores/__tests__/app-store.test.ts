import { useAppStore } from '@presentation/stores/app-store';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      selectedRole: null,
      nfcLogEnabled: false,
      nfcLogs: [],
    });
  });

  it('starts with null selected role', () => {
    expect(useAppStore.getState().selectedRole).toBeNull();
  });

  it('sets selected role to station', () => {
    useAppStore.getState().setSelectedRole('station');
    expect(useAppStore.getState().selectedRole).toBe('station');
  });

  it('sets selected role to gate', () => {
    useAppStore.getState().setSelectedRole('gate');
    expect(useAppStore.getState().selectedRole).toBe('gate');
  });

  it('sets selected role to terminal', () => {
    useAppStore.getState().setSelectedRole('terminal');
    expect(useAppStore.getState().selectedRole).toBe('terminal');
  });

  it('sets selected role to scout', () => {
    useAppStore.getState().setSelectedRole('scout');
    expect(useAppStore.getState().selectedRole).toBe('scout');
  });

  it('resets selected role to null', () => {
    useAppStore.getState().setSelectedRole('station');
    useAppStore.getState().setSelectedRole(null);
    expect(useAppStore.getState().selectedRole).toBeNull();
  });

  it('toggles nfc log visibility', () => {
    expect(useAppStore.getState().nfcLogEnabled).toBe(false);
    useAppStore.getState().toggleNfcLogEnabled();
    expect(useAppStore.getState().nfcLogEnabled).toBe(true);
    useAppStore.getState().setNfcLogEnabled(false);
    expect(useAppStore.getState().nfcLogEnabled).toBe(false);
  });

  it('appends and clears nfc logs', () => {
    useAppStore.getState().appendNfcLog('[NFC] test line');
    expect(useAppStore.getState().nfcLogs.length).toBe(1);
    expect(useAppStore.getState().nfcLogs[0].message).toContain('test line');

    useAppStore.getState().clearNfcLogs();
    expect(useAppStore.getState().nfcLogs).toHaveLength(0);
  });
});
