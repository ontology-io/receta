import { describe, it, expect } from 'bun:test'
import {
  isEmpty,
  isBlank,
  isEmail,
  isUrl,
  isAlphanumeric,
  isNumeric,
  isHexColor,
} from '../validators'
import { isSome, isNone } from '../../option'

describe('String.isEmpty', () => {
  it('returns true for empty string', () => {
    expect(isEmpty('')).toBe(true)
  })

  it('returns true for whitespace-only string', () => {
    expect(isEmpty('   ')).toBe(true)
    expect(isEmpty('\t\n')).toBe(true)
  })

  it('returns false for non-empty string', () => {
    expect(isEmpty('hello')).toBe(false)
  })

  it('returns false for string with content and whitespace', () => {
    expect(isEmpty('  hello  ')).toBe(false)
  })
})

describe('String.isBlank', () => {
  it('is alias for isEmpty', () => {
    expect(isBlank('')).toBe(true)
    expect(isBlank('   ')).toBe(true)
    expect(isBlank('hello')).toBe(false)
  })
})

describe('String.isEmail', () => {
  it('returns Some for valid email', () => {
    const result = isEmail('user@example.com')
    expect(isSome(result)).toBe(true)
    if (isSome(result)) {
      expect(result.value).toBe('user@example.com')
    }
  })

  it('returns Some for email with subdomain', () => {
    const result = isEmail('user@mail.example.com')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for email with plus sign', () => {
    const result = isEmail('user+tag@example.com')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for email with dots', () => {
    const result = isEmail('first.last@example.com')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for email with numbers', () => {
    const result = isEmail('user123@example.com')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for email with hyphen in domain', () => {
    const result = isEmail('user@my-domain.com')
    expect(isSome(result)).toBe(true)
  })

  it('returns None for invalid email without @', () => {
    expect(isNone(isEmail('userexample.com'))).toBe(true)
  })

  it('returns None for invalid email without domain', () => {
    expect(isNone(isEmail('user@'))).toBe(true)
  })

  it('returns None for invalid email without local part', () => {
    expect(isNone(isEmail('@example.com'))).toBe(true)
  })

  it('returns None for invalid email with spaces', () => {
    expect(isNone(isEmail('user @example.com'))).toBe(true)
  })

  it('returns None for empty string', () => {
    expect(isNone(isEmail(''))).toBe(true)
  })

  it('returns None for invalid email without TLD', () => {
    expect(isNone(isEmail('user@domain'))).toBe(true)
  })
})

describe('String.isUrl', () => {
  it('returns Some for valid HTTP URL', () => {
    const result = isUrl('http://example.com')
    expect(isSome(result)).toBe(true)
    if (isSome(result)) {
      expect(result.value).toBe('http://example.com')
    }
  })

  it('returns Some for valid HTTPS URL', () => {
    const result = isUrl('https://example.com')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for URL with path', () => {
    const result = isUrl('https://example.com/path/to/page')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for URL with query params', () => {
    const result = isUrl('https://example.com?key=value&foo=bar')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for URL with port', () => {
    const result = isUrl('http://localhost:3000')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for URL with hash', () => {
    const result = isUrl('https://example.com#section')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for URL with subdomain', () => {
    const result = isUrl('https://api.example.com')
    expect(isSome(result)).toBe(true)
  })

  it('returns None for invalid URL', () => {
    expect(isNone(isUrl('not a url'))).toBe(true)
  })

  it('returns None for URL without protocol', () => {
    expect(isNone(isUrl('example.com'))).toBe(true)
  })

  it('returns None for empty string', () => {
    expect(isNone(isUrl(''))).toBe(true)
  })
})

describe('String.isAlphanumeric', () => {
  it('returns true for alphanumeric string', () => {
    expect(isAlphanumeric('hello123')).toBe(true)
  })

  it('returns true for letters only', () => {
    expect(isAlphanumeric('hello')).toBe(true)
  })

  it('returns true for numbers only', () => {
    expect(isAlphanumeric('12345')).toBe(true)
  })

  it('returns true for mixed case', () => {
    expect(isAlphanumeric('HelloWorld123')).toBe(true)
  })

  it('returns false for string with spaces', () => {
    expect(isAlphanumeric('hello world')).toBe(false)
  })

  it('returns false for string with special characters', () => {
    expect(isAlphanumeric('hello-world')).toBe(false)
    expect(isAlphanumeric('hello_world')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isAlphanumeric('')).toBe(false)
  })
})

describe('String.isNumeric', () => {
  it('returns true for numeric string', () => {
    expect(isNumeric('12345')).toBe(true)
  })

  it('returns true for zero', () => {
    expect(isNumeric('0')).toBe(true)
  })

  it('returns false for decimal number', () => {
    expect(isNumeric('123.45')).toBe(false)
  })

  it('returns false for negative number', () => {
    expect(isNumeric('-123')).toBe(false)
  })

  it('returns false for string with letters', () => {
    expect(isNumeric('123abc')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isNumeric('')).toBe(false)
  })
})

describe('String.isHexColor', () => {
  it('returns Some for 6-character hex with #', () => {
    const result = isHexColor('#ff0000')
    expect(isSome(result)).toBe(true)
    if (isSome(result)) {
      expect(result.value).toBe('#ff0000')
    }
  })

  it('returns Some for 3-character hex with #', () => {
    const result = isHexColor('#fff')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for 8-character hex with # (with alpha)', () => {
    const result = isHexColor('#ff00ff80')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for 6-character hex without #', () => {
    const result = isHexColor('ff0000')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for 3-character hex without #', () => {
    const result = isHexColor('fff')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for uppercase hex', () => {
    const result = isHexColor('#FF0000')
    expect(isSome(result)).toBe(true)
  })

  it('returns Some for mixed case hex', () => {
    const result = isHexColor('#Ff00Aa')
    expect(isSome(result)).toBe(true)
  })

  it('returns None for invalid hex color', () => {
    expect(isNone(isHexColor('not-a-color'))).toBe(true)
  })

  it('returns None for hex with wrong length', () => {
    expect(isNone(isHexColor('#ff'))).toBe(true)
    expect(isNone(isHexColor('#ffff'))).toBe(true)
  })

  it('returns None for hex with invalid characters', () => {
    expect(isNone(isHexColor('#gggggg'))).toBe(true)
  })

  it('returns None for empty string', () => {
    expect(isNone(isHexColor(''))).toBe(true)
  })
})
