import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface DecisionInput {
  audience: { id: string; label: string; icon: string; description: string; available: boolean };
  form: {
    decision: string;
    problem: string;
    businessArea: string;
    options: string;
    data: string;
    tradeoffs: string;
    primaryMetric: string;
    guardrailMetric: string;
    expectedOutcome: string;
  };
}

const STORAGE_KEY = 'decidr_input';

function createInputStore() {
  const initial: DecisionInput | null = browser
    ? JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    : null;

  const { subscribe, set, update } = writable<DecisionInput | null>(initial);

  return {
    subscribe,
    set: (value: DecisionInput | null) => {
      if (browser) {
        if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        else localStorage.removeItem(STORAGE_KEY);
      }
      set(value);
    },
    clear: () => {
      if (browser) localStorage.removeItem(STORAGE_KEY);
      set(null);
    }
  };
}

export const inputStore = createInputStore();