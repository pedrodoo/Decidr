import { writable } from 'svelte/store';

/**
 * @typedef {object} DecisionOutputs
 * @property {string} prepare
 * @property {string} communicate
 * @property {string} portfolio
 */

/** @type {import('svelte/store').Writable<DecisionOutputs | null>} */
export const outputsStore = writable(null);

