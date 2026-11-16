// Small pieces the registry pages are built from: escaping, inline code, icons, and the words
// for counts, places and ages. Every text a stranger submitted passes through `escape` or
// `withCode` before it reaches a page.
import * as R from 'remeda'

const ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escapes text for HTML, both between tags and inside a quoted attribute. */
export const escape = (text: string): string => text.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char)

/**
 * Escapes text, then shows its `backtick spans` as code, the way the catalog's comments
 * write them. Escaping comes first, so a span can only ever hold escaped text.
 */
export const withCode = (text: string): string => escape(text).replace(/`([^`\n]+)`/g, '<code>$1</code>')

/** `1 vote`, `2 votes`. */
export const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`

const SUFFIXES: Readonly<Record<number, string>> = { 1: 'st', 2: 'nd', 3: 'rd' }

/** `1st`, `2nd`, `3rd`, `11th`, `23rd`. */
export const ordinal = (n: number): string => {
  const teen = n % 100 >= 11 && n % 100 <= 13
  return `${n}${teen ? 'th' : (SUFFIXES[n % 10] ?? 'th')}`
}

const DAY = 24 * 60 * 60 * 1000

/** How long ago an ISO time was, in the words a person would use: `today`, `3 days ago`. */
export const age = (iso: string, now: Date): string => {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY)
  if (Number.isNaN(days) || days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return 'last week'
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return plural(Math.floor(days / 365), 'year ago', 'years ago')
}

// Lucide's outlines, drawn inline so the page fetches nothing for them.
const PATHS = {
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  github:
    '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  eyeOff:
    '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
} as const

export type IconName = keyof typeof PATHS

/** An icon at `size` pixels, in the text colour around it, hidden from screen readers. */
export const icon = (name: IconName, size: number): string =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`

/** Joins rendered pieces of HTML. */
export const html = (pieces: readonly string[]): string => R.join(pieces, '')
