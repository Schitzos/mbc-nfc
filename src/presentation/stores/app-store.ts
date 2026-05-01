import { create } from 'zustand';

type AppRole = 'station' | 'gate' | 'terminal' | 'scout' | null;

type AppStore = {
  selectedRole: AppRole;
  setSelectedRole: (role: AppRole) => void;
};

export const useAppStore = create<AppStore>(set => ({
  selectedRole: null,
  setSelectedRole: selectedRole => set({ selectedRole }),
}));
