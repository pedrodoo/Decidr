import { writable } from 'svelte/store';

export interface DecisionOutputs {
  confidence?: string;
  prepare?: string;
  communicate?: string;
  portfolio?: string;
}

export const outputsStore = writable<DecisionOutputs>({});