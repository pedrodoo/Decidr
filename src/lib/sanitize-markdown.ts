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
	// SSR fail-safe: DOMPurify needs a DOM. This path is never reached today
	// (outputs are set in onMount, so {#if} blocks don't render server-side),
	// but return empty rather than unsanitized HTML so a future server-side
	// render path can never silently become an XSS hole.
	if (typeof window === 'undefined') return '';
	return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, ALLOWED_URI_REGEXP });
}
