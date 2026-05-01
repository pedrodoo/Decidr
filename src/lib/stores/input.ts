import { writable } from 'svelte/store';
import type { AudienceSelection, DecisionForm } from '$lib/decisions/storage';

export interface DecisionInput {
  id?: string;
  audience: AudienceSelection;
  form: DecisionForm;
}

function createInputStore() {
  const { subscribe, set, update } = writable<DecisionInput | null>(null);

  return {
    subscribe,
    set,
    update,
    clear: () => set(null)
  };
}

export const inputStore = createInputStore();
