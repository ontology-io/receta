import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import {
  pluralize,
  truncateWords,
  escapeRegex,
  normalizeWhitespace,
  initials,
  highlight,
} from '../index'

describe('String Module Enhancements', () => {
  describe('pluralize', () => {
    describe('data-first', () => {
      it('keeps singular for count of 1', () => {
        expect(pluralize('item', 1)).toBe('1 item')
        expect(pluralize('person', 1)).toBe('1 person')
      })

      it('pluralizes regular words (add -s)', () => {
        expect(pluralize('item', 2)).toBe('2 items')
        expect(pluralize('user', 5)).toBe('5 users')
        expect(pluralize('cat', 0)).toBe('0 cats')
      })

      it('handles words ending in s, ss, sh, ch, x, z (add -es)', () => {
        expect(pluralize('box', 3)).toBe('3 boxes')
        expect(pluralize('class', 2)).toBe('2 classes')
        expect(pluralize('wish', 4)).toBe('4 wishes')
        expect(pluralize('watch', 2)).toBe('2 watches')
        expect(pluralize('buzz', 3)).toBe('3 buzzes')
      })

      it('handles words ending in consonant + y (replace with -ies)', () => {
        expect(pluralize('story', 2)).toBe('2 stories')
        expect(pluralize('city', 5)).toBe('5 cities')
        expect(pluralize('baby', 3)).toBe('3 babies')
      })

      it('handles words ending in vowel + y (add -s)', () => {
        expect(pluralize('key', 2)).toBe('2 keys')
        expect(pluralize('day', 7)).toBe('7 days')
      })

      it('handles words ending in f/fe (replace with -ves)', () => {
        expect(pluralize('knife', 4)).toBe('4 knives')
        expect(pluralize('leaf', 10)).toBe('10 leaves')
        expect(pluralize('life', 2)).toBe('2 lives')
        expect(pluralize('wolf', 3)).toBe('3 wolves')
      })

      it('handles words ending in consonant + o (add -es)', () => {
        expect(pluralize('hero', 3)).toBe('3 heroes')
        expect(pluralize('potato', 5)).toBe('5 potatoes')
      })

      it('handles words ending in vowel + o (add -s)', () => {
        expect(pluralize('zoo', 2)).toBe('2 zoos')
        expect(pluralize('radio', 3)).toBe('3 radios')
      })

      it('supports custom plural forms', () => {
        expect(pluralize('person', 3, { plural: 'people' })).toBe('3 people')
        expect(pluralize('child', 2, { plural: 'children' })).toBe('2 children')
        expect(pluralize('mouse', 5, { plural: 'mice' })).toBe('5 mice')
      })

      it('supports wordOnly option', () => {
        expect(pluralize('item', 5, { wordOnly: true })).toBe('items')
        expect(pluralize('person', 3, { plural: 'people', wordOnly: true })).toBe('people')
        expect(pluralize('cat', 1, { wordOnly: true })).toBe('cat')
      })

      it('handles edge cases', () => {
        expect(pluralize('', 2)).toBe('2 ')
        expect(pluralize('a', 2)).toBe('2 as')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe([1, 2, 3, 4, 5], (arr) => pluralize('item', arr.length))
        expect(result).toBe('5 items')
      })
    })
  })

  describe('truncateWords', () => {
    describe('data-first', () => {
      it('truncates to exact word count', () => {
        expect(truncateWords('The quick brown fox jumps', 3)).toBe('The quick brown...')
        expect(truncateWords('One two three four five', 2)).toBe('One two...')
      })

      it('keeps string unchanged if under limit', () => {
        expect(truncateWords('Hello world', 5)).toBe('Hello world')
        expect(truncateWords('Short', 10)).toBe('Short')
      })

      it('supports custom suffix', () => {
        expect(truncateWords('One two three four', 2, { suffix: ' […]' })).toBe('One two […]')
        expect(truncateWords('Hello world test', 1, { suffix: '…' })).toBe('Hello…')
      })

      it('handles edge cases', () => {
        expect(truncateWords('', 5)).toBe('')
        expect(truncateWords('   ', 5)).toBe('')
        expect(truncateWords('Word', 0)).toBe('...')
        expect(truncateWords('Multiple   spaces   between', 2)).toBe('Multiple spaces...')
      })

      it('does not add suffix if not truncated', () => {
        expect(truncateWords('One two', 3)).toBe('One two')
        expect(truncateWords('Single', 3)).toBe('Single')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(
          'A long article preview with many words in it',
          truncateWords(5)
        )
        expect(result).toBe('A long article preview with...')
      })
    })
  })

  describe('escapeRegex', () => {
    it('escapes dot', () => {
      expect(escapeRegex('example.com')).toBe('example\\.com')
    })

    it('escapes asterisk and plus', () => {
      expect(escapeRegex('a*b+c')).toBe('a\\*b\\+c')
    })

    it('escapes question mark', () => {
      expect(escapeRegex('what?')).toBe('what\\?')
    })

    it('escapes caret and dollar', () => {
      expect(escapeRegex('^start$')).toBe('\\^start\\$')
    })

    it('escapes braces', () => {
      expect(escapeRegex('a{1,3}')).toBe('a\\{1,3\\}')
    })

    it('escapes parentheses', () => {
      expect(escapeRegex('(test)')).toBe('\\(test\\)')
    })

    it('escapes pipe', () => {
      expect(escapeRegex('a|b')).toBe('a\\|b')
    })

    it('escapes brackets', () => {
      expect(escapeRegex('[a-z]')).toBe('\\[a-z\\]')
    })

    it('escapes backslash', () => {
      expect(escapeRegex('a\\b')).toBe('a\\\\b')
    })

    it('escapes complex regex patterns', () => {
      expect(escapeRegex('[a-z]+.*?')).toBe('\\[a-z\\]\\+\\.\\*\\?')
      expect(escapeRegex('$100 (USD)')).toBe('\\$100 \\(USD\\)')
    })

    it('handles strings without special characters', () => {
      expect(escapeRegex('hello')).toBe('hello')
      expect(escapeRegex('hello world')).toBe('hello world')
    })

    it('handles empty string', () => {
      expect(escapeRegex('')).toBe('')
    })

    it('works with RegExp constructor', () => {
      const userInput = 'example.com'
      const pattern = new RegExp(escapeRegex(userInput))
      expect(pattern.test('example.com')).toBe(true)
      expect(pattern.test('exampleXcom')).toBe(false) // . is literal, not wildcard
    })
  })

  describe('normalizeWhitespace', () => {
    it('replaces multiple spaces with single space', () => {
      expect(normalizeWhitespace('Hello    world')).toBe('Hello world')
      expect(normalizeWhitespace('a  b   c    d')).toBe('a b c d')
    })

    it('replaces tabs with single space', () => {
      expect(normalizeWhitespace('foo\t\tbar')).toBe('foo bar')
      expect(normalizeWhitespace('a\tb\tc')).toBe('a b c')
    })

    it('replaces newlines with single space', () => {
      expect(normalizeWhitespace('line1\nline2')).toBe('line1 line2')
      expect(normalizeWhitespace('a\n\n\nb')).toBe('a b')
    })

    it('handles mixed whitespace', () => {
      expect(normalizeWhitespace('mixed   \t\n  whitespace')).toBe('mixed whitespace')
      expect(normalizeWhitespace('  foo \n\t bar  ')).toBe('foo bar')
    })

    it('trims leading and trailing whitespace', () => {
      expect(normalizeWhitespace('  hello  ')).toBe('hello')
      expect(normalizeWhitespace('\n\ttest\n\t')).toBe('test')
    })

    it('handles empty string', () => {
      expect(normalizeWhitespace('')).toBe('')
    })

    it('handles whitespace-only string', () => {
      expect(normalizeWhitespace('   ')).toBe('')
      expect(normalizeWhitespace('\n\t  \n')).toBe('')
    })

    it('handles strings without extra whitespace', () => {
      expect(normalizeWhitespace('hello world')).toBe('hello world')
      expect(normalizeWhitespace('already normal')).toBe('already normal')
    })
  })

  describe('initials', () => {
    describe('data-first', () => {
      it('extracts initials from two-word names', () => {
        expect(initials('John Doe')).toBe('JD')
        expect(initials('Jane Smith')).toBe('JS')
      })

      it('extracts initials from multi-word names', () => {
        expect(initials('Mary Jane Watson')).toBe('MJW')
        expect(initials('Robert Downey Jr')).toBe('RDJ')
      })

      it('limits initials with maxInitials', () => {
        expect(initials('Mary Jane Watson', { maxInitials: 2 })).toBe('MJ')
        expect(initials('Robert Downey Jr', { maxInitials: 1 })).toBe('R')
      })

      it('handles uppercase option', () => {
        expect(initials('john doe', { uppercase: true })).toBe('JD')
        expect(initials('john doe', { uppercase: false })).toBe('jd')
        expect(initials('John Doe', { uppercase: false })).toBe('jd')
      })

      it('handles single word', () => {
        expect(initials('John')).toBe('J')
        expect(initials('Test')).toBe('T')
      })

      it('handles multiple spaces', () => {
        expect(initials('  Multiple   Spaces  ')).toBe('MS')
        expect(initials('a    b    c')).toBe('ABC')
      })

      it('handles empty string', () => {
        expect(initials('')).toBe('')
        expect(initials('   ')).toBe('')
      })

      it('preserves case when uppercase is false', () => {
        expect(initials('iPhone MacBook', { uppercase: false })).toBe('im')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe('Robert Downey Jr.', initials({ maxInitials: 2 }))
        expect(result).toBe('RD')
      })
    })
  })

  describe('highlight', () => {
    describe('data-first', () => {
      it('highlights single match', () => {
        expect(highlight('Hello world', 'world')).toBe('Hello <mark>world</mark>')
      })

      it('highlights multiple matches', () => {
        expect(highlight('JavaScript and TypeScript', 'script')).toBe(
          'Java<mark>Script</mark> and Type<mark>Script</mark>'
        )
      })

      it('is case-insensitive by default', () => {
        expect(highlight('Hello WORLD', 'world')).toBe('Hello <mark>WORLD</mark>')
        expect(highlight('TEST test TeSt', 'test')).toBe(
          '<mark>TEST</mark> <mark>test</mark> <mark>TeSt</mark>'
        )
      })

      it('supports case-sensitive matching', () => {
        expect(highlight('Hello World', 'world', { caseInsensitive: false })).toBe('Hello World')
        expect(highlight('Hello world', 'world', { caseInsensitive: false })).toBe(
          'Hello <mark>world</mark>'
        )
      })

      it('supports custom tag', () => {
        expect(highlight('Search term here', 'term', { tag: 'span' })).toBe(
          'Search <span>term</span> here'
        )
      })

      it('supports custom className', () => {
        expect(highlight('Search term here', 'term', { className: 'highlight' })).toBe(
          'Search <mark class="highlight">term</mark> here'
        )
      })

      it('supports both custom tag and className', () => {
        expect(highlight('Test query', 'query', { tag: 'em', className: 'search-hit' })).toBe(
          'Test <em class="search-hit">query</em>'
        )
      })

      it('returns original text for empty query', () => {
        expect(highlight('Hello world', '')).toBe('Hello world')
        expect(highlight('Test', '   ')).toBe('Test')
      })

      it('handles no matches', () => {
        expect(highlight('Hello world', 'xyz')).toBe('Hello world')
      })

      it('escapes HTML by default', () => {
        expect(highlight('<script>alert("xss")</script>', 'script')).toBe(
          '&lt;<mark>script</mark>&gt;alert(&quot;xss&quot;)&lt;/<mark>script</mark>&gt;'
        )
      })

      it('can disable HTML escaping', () => {
        expect(highlight('<b>bold</b>', 'bold', { escapeHtml: false })).toBe(
          '<b><mark>bold</mark></b>'
        )
      })

      it('handles regex special characters in query', () => {
        expect(highlight('Price $100', '$100')).toBe('Price <mark>$100</mark>')
        expect(highlight('example.com website', 'example.com')).toBe(
          '<mark>example.com</mark> website'
        )
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const results = ['JavaScript tutorial', 'TypeScript guide', 'Python basics']
        const highlighted = R.pipe(
          results,
          R.map(highlight('script', { className: 'search-highlight' }))
        )

        expect(highlighted).toEqual([
          'Java<mark class="search-highlight">Script</mark> tutorial',
          'Type<mark class="search-highlight">Script</mark> guide',
          'Python basics',
        ])
      })
    })

    describe('XSS prevention', () => {
      it('prevents XSS in text', () => {
        const malicious = '<img src=x onerror="alert(1)">'
        const result = highlight(malicious, 'img')
        expect(result).not.toContain('<img')
        expect(result).toContain('&lt;<mark>img</mark>')
      })

      it('prevents XSS in query when used in className', () => {
        // Even though query goes through escapeRegex, className is controlled by options
        const result = highlight('test', 'test', {
          className: 'normal-class', // Safe class name
        })
        expect(result).toBe('<mark class="normal-class">test</mark>')
      })
    })
  })
})
