export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'theme';

function isTheme(value: string | null): value is Theme {
	return value === 'dark' || value === 'light';
}

export function getPreferredTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';

	const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	if (isTheme(savedTheme)) return savedTheme;

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;
	document.documentElement.dataset.theme = theme;
}

export function setTheme(theme: Theme) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}

	applyTheme(theme);
}

export function toggleTheme(current: Theme): Theme {
	const nextTheme = current === 'dark' ? 'light' : 'dark';
	setTheme(nextTheme);
	return nextTheme;
}
