import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { words, lines, between, extract } from '../extract'
import { isSome, isNone } from '../../option'

describe('String.words', () => {
  describe('data-first', () => {
    it('splits string into words', () => {
      expect(words('hello world')).toEqual(['hello', 'world'])
    })

    it('splits on hyphens', () => {
      expect(words('user-profile-page')).toEqual(['user', 'profile', 'page'])
    })

    it('splits on underscores', () => {
      expect(words('user_profile_page')).toEqual(['user', 'profile', 'page'])
    })

    it('splits on mixed delimiters', () => {
      expect(words('hello, world! test')).toEqual(['hello', 'world', 'test'])
    })

    it('preserves camelCase as single word', () => {
      expect(words('oneTwo three_four')).toEqual(['oneTwo', 'three', 'four'])
    })

    it('filters empty strings', () => {
      expect(words('hello    world')).toEqual(['hello', 'world'])
    })

    it('handles single word', () => {
      expect(words('hello')).toEqual(['hello'])
    })

    it('handles empty string', () => {
      expect(words('')).toEqual([])
    })

  })

})

describe('String.lines', () => {
  it('splits on newlines', () => {
    expect(lines('hello\nworld')).toEqual(['hello', 'world'])
  })

  it('splits on CRLF', () => {
    expect(lines('line1\r\nline2\r\nline3')).toEqual(['line1', 'line2', 'line3'])
  })

  it('splits on CR', () => {
    expect(lines('line1\rline2')).toEqual(['line1', 'line2'])
  })

  it('handles single line', () => {
    expect(lines('single line')).toEqual(['single line'])
  })

  it('handles empty string', () => {
    expect(lines('')).toEqual([''])
  })

  it('preserves empty lines', () => {
    expect(lines('line1\n\nline3')).toEqual(['line1', '', 'line3'])
  })

  it('handles trailing newline', () => {
    expect(lines('line1\nline2\n')).toEqual(['line1', 'line2', ''])
  })
})

describe('String.between', () => {
  describe('data-first', () => {
    it('extracts text between delimiters', () => {
      const result = between('[', ']', 'Hello [world]!')
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('world')
      }
    })

    it('extracts text with different delimiters', () => {
      const result = between('$', '.', 'Price: $99.99')
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('99')
      }
    })

    it('returns first match for multiple occurrences', () => {
      const result = between('[', ']', '[first] and [second]')
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('first')
      }
    })

    it('returns None when start delimiter not found', () => {
      const result = between('[', ']', 'No delimiters')
      expect(isNone(result)).toBe(true)
    })

    it('returns None when end delimiter not found', () => {
      const result = between('[', ']', '[incomplete')
      expect(isNone(result)).toBe(true)
    })

    it('handles empty content between delimiters', () => {
      const result = between('[', ']', 'Empty []')
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('')
      }
    })

    it('handles multi-character delimiters', () => {
      const result = between('<<', '>>', '<<content>>')
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('content')
      }
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe('User ID: {12345}', between('{', '}'))
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('12345')
      }
    })
  })
})

describe('String.extract', () => {
  describe('data-first', () => {
    it('extracts all pattern matches', () => {
      const result = extract('Price: $10, Discount: $5', /\$\d+/g)
      expect(result).toEqual(['$10', '$5'])
    })

    it('extracts email addresses', () => {
      const result = extract('Contact user@example.com or admin@test.org', /\S+@\S+/g)
      expect(result).toEqual(['user@example.com', 'admin@test.org'])
    })

    it('extracts numbers', () => {
      const result = extract('There are 10 apples and 5 oranges', /\d+/g)
      expect(result).toEqual(['10', '5'])
    })

    it('extracts dates', () => {
      const result = extract('Dates: 2024-01-15 and 2024-02-20', /\d{4}-\d{2}-\d{2}/g)
      expect(result).toEqual(['2024-01-15', '2024-02-20'])
    })

    it('returns empty array for no matches', () => {
      const result = extract('No matches here', /\d+/g)
      expect(result).toEqual([])
    })

    it('handles empty string', () => {
      const result = extract('', /\d+/g)
      expect(result).toEqual([])
    })

    it('extracts words', () => {
      const result = extract('hello world test', /\w+/g)
      expect(result).toEqual(['hello', 'world', 'test'])
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe('Price: $10, Discount: $5', extract(/\$\d+/g))
      expect(result).toEqual(['$10', '$5'])
    })

    it('works with unique in pipe', () => {
      const result = R.pipe('2024-01-15 and 2024-01-15 and 2024-02-20', extract(/\d{4}-\d{2}-\d{2}/g), R.unique)
      expect(result).toEqual(['2024-01-15', '2024-02-20'])
    })
  })
})
