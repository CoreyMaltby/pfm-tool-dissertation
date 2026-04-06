import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
    persist(
        (set) => ({
            showContextualTips: true,
            toggleTips: () => set((state) => ({ showContextualTips: !state.showContextualTips })),
        }),
        {
            name: 'user-settings',
        }
    )
);