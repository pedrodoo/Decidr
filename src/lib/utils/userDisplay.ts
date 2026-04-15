export function getUserInitial(name?: string | null, email?: string | null): string {
	if (name?.trim()) return name.trim()[0].toUpperCase();
	if (email?.trim()) return email.trim()[0].toUpperCase();
	return '?';
}

export function getUserDisplayName(name?: string | null, email?: string | null): string {
	if (name?.trim()) return name.trim().split(' ')[0];
	if (email?.trim()) return email.trim().split('@')[0];
	return 'Account';
}
