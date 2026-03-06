import { create } from 'zustand'
import type { SopTab } from '@/types/app.types'

interface SopTabStore {
    openTabs: SopTab[]
    activeTabId: string | null
    openTab: (sop: SopTab) => void
    closeTab: (id: string) => void
    setActive: (id: string) => void
}

export const useSopTabStore = create<SopTabStore>((set) => ({
    openTabs: [],
    activeTabId: null,

    openTab: (sop) =>
        set((state) => {
            const alreadyOpen = state.openTabs.some((t) => t.id === sop.id)
            if (alreadyOpen) {
                return { activeTabId: sop.id }
            }
            return {
                openTabs: [...state.openTabs, sop],
                activeTabId: sop.id,
            }
        }),

    closeTab: (id) =>
        set((state) => {
            const remaining = state.openTabs.filter((t) => t.id !== id)
            let nextActive = state.activeTabId
            if (state.activeTabId === id) {
                nextActive = remaining.length > 0 ? remaining[remaining.length - 1].id : null
            }
            return { openTabs: remaining, activeTabId: nextActive }
        }),

    setActive: (id) => set({ activeTabId: id }),
}))
