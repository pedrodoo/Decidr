type Level = 'info' | 'warn' | 'error';

export function log(level: Level, event: string, data?: Record<string, unknown>) {
	console[level](JSON.stringify({ ts: new Date().toISOString(), level, event, ...data }));
}
