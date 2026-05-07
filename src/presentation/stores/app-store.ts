import { create } from 'zustand';

type AppRole = 'station' | 'gate' | 'terminal' | 'scout' | null;

interface NfcLogEntry {
  id: string;
  createdAt: string;
  message: string;
}

interface AppStore {
  selectedRole: AppRole;
  nfcLogEnabled: boolean;
  nfcLogs: NfcLogEntry[];
  setSelectedRole: (role: AppRole) => void;
  setNfcLogEnabled: (enabled: boolean) => void;
  toggleNfcLogEnabled: () => void;
  appendNfcLog: (message: string) => void;
  clearNfcLogs: () => void;
}

export const useAppStore = create<AppStore>(set => ({
  selectedRole: null,
  setSelectedRole: selectedRole => set({ selectedRole }),
  nfcLogEnabled: false,
  nfcLogs: [],
  setNfcLogEnabled: nfcLogEnabled => set({ nfcLogEnabled }),
  toggleNfcLogEnabled: () =>
    set(state => ({ nfcLogEnabled: !state.nfcLogEnabled })),
  appendNfcLog: message =>
    set(state => {
      const createdAt = new Date().toISOString();
      const id = `${createdAt}-${state.nfcLogs.length + 1}`;
      const next = [...state.nfcLogs, { id, createdAt, message }];
      return {
        nfcLogs: next.slice(-200),
      };
    }),
  clearNfcLogs: () => set({ nfcLogs: [] }),
}));
