import { writable } from 'svelte/store';

export interface DecisionOutputs {
  prepare: string;
  communicate: string;
  portfolio: string;
}

export const outputsStore = writable<DecisionOutputs | null>(null);

