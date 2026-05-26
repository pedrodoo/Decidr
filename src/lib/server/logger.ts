import { env } from '$env/dynamic/private';

type Level = 'info' | 'warn' | 'error';
type LogEntry = { ts: string; level: Level; event: string; [key: string]: unknown };

function sendToAxiom(entry: LogEntry) {
	const { AXIOM_TOKEN: token, AXIOM_DATASET: dataset } = env;
	if (!token || !dataset) return;
	fetch(`https://eu-central-1.aws.edge.axiom.co/v1/ingest/${dataset}`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify([entry])
	}).catch(() => {});
}

export function log(level: Level, event: string, data?: Record<string, unknown>) {
	const entry: LogEntry = { ts: new Date().toISOString(), level, event, ...data };
	console[level](JSON.stringify(entry));
	sendToAxiom(entry);
}
