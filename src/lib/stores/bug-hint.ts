import { writable } from 'svelte/store';

/** Pulse the header bug button (e.g. during demo outputs coach mark). */
export const highlightBugReportButton = writable(false);
