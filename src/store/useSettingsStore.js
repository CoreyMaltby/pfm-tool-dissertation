import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
    persist(
        (set) => ({
            showContextualTips: true,
            showSafeToSpend: true,
            setTips: (value) => set({ showContextualTips: value }),
            setSafeToSpend: (value) => set({ showSafeToSpend: value }),
            toggleTips: () => set((state) => ({ showContextualTips: !state.showContextualTips })),
        }),
        { name: 'user-settings' }
    )
);