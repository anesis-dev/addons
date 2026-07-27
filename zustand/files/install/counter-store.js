import { create } from 'zustand';

/**
 * A worked example, not a fixture to keep — replace it with real state.
 *
 * The selector form is what keeps zustand cheap: `useCounterStore((s) => s.count)`
 * re-renders only on `count`, while `useCounterStore()` subscribes to the whole
 * store and re-renders on every change.
 */
export const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
