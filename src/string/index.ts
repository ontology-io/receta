/**
 * String module - String processing, validation, and transformation utilities.
 *
 * @module string
 */

// Types
export type {
  TruncateOptions,
  CaseOptions,
  WordsOptions,
  EscapeHtmlOptions,
  TemplateError,
  TemplateVars,
} from './types'

// Template utilities
export { template, parseTemplate } from './template'

// Transformers
export { slugify } from './slugify'
export { kebabCase, snakeCase, camelCase, pascalCase, capitalize, titleCase } from './case'
export { truncate } from './truncate'

// Validators
export {
  isEmpty,
  isBlank,
  isEmail,
  isUrl,
  isAlphanumeric,
  isNumeric,
  isHexColor,
} from './validators'

// Sanitizers
export {
  stripHtml,
  escapeHtml,
  unescapeHtml,
  trim,
  trimStart,
  trimEnd,
} from './sanitize'

// Extractors
export { words, lines, between, extract } from './extract'
