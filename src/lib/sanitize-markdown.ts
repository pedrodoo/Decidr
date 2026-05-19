import DOMPurify from 'dompurify';
import { marked } from 'marked';

const ALLOWED_TAGS = [
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'p',
	'br',
	'hr',
	'ul',
	'ol',
	'li',
	'strong',
	'em',
	'b',
	'i',
	'a',
	'code',
	'pre',
	'blockquote'
];

const ALLOWED_ATTR = ['href', 'title'];

// Restrict link targets to safe protocols only.
const ALLOWED_URI_REGEXP = /^(?:https?|mailto):/i;

export function renderMarkdown(text: string): string {
	const html = marked.parse(text) as string;
	// DOMPurify requires a DOM — it is never called during SSR because
	// outputs are populated in onMount and the {#if} blocks never render server-side.
	if (typeof window === 'undefined') return html;
	return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, ALLOWED_URI_REGEXP });
}
