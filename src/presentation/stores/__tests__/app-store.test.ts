import { useAppStore } from '../app-store';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ selectedRole: null });
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
});
