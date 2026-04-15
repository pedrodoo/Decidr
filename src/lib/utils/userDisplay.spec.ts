import { describe, expect, it } from 'vitest';
import { getUserDisplayName, getUserInitial } from './userDisplay';

describe('userDisplay', () => {
	it('derives initial from name first', () => {
		expect(getUserInitial('Pedro', 'pedro@example.com')).toBe('P');
	});

	it('falls back to email for initial', () => {
		expect(getUserInitial('   ', 'decidr@example.com')).toBe('D');
	});

	it('uses question mark when values are missing', () => {
		expect(getUserInitial(undefined, undefined)).toBe('?');
	});

	it('derives display name from first name token', () => {
		expect(getUserDisplayName('Pedro Silva', 'pedro@example.com')).toBe('Pedro');
	});

	it('falls back to email local-part for display name', () => {
		expect(getUserDisplayName(null, 'decidr@example.com')).toBe('decidr');
	});

	it('uses default display name when values are missing', () => {
		expect(getUserDisplayName(undefined, undefined)).toBe('Account');
	});
});
