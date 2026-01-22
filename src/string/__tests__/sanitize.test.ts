import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import {
  stripHtml,
  escapeHtml,
  unescapeHtml,
  trim,
  trimStart,
  trimEnd,
} from '../sanitize'

describe('String.stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello')
  })

  it('removes nested tags', () => {
    expect(stripHtml('<p>Hello <strong>world</strong>!</p>')).toBe('Hello world!')
  })

  it('removes self-closing tags', () => {
    expect(stripHtml('<br/>Text<img src="x"/>')).toBe('Text')
  })

  it('removes script tags', () => {
    expect(stripHtml('<script>alert("xss")</script>Safe')).toBe('Safe')
  })

  it('removes style tags', () => {
    expect(stripHtml('<style>body{}</style>Text')).toBe('Text')
  })

  it('handles multiple tags', () => {
    expect(stripHtml('<div><p>Para 1</p><p>Para 2</p></div>')).toBe('Para 1Para 2')
  })

  it('returns unchanged if no tags', () => {
    expect(stripHtml('No tags here')).toBe('No tags here')
  })

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('')
  })

  it('handles tags with attributes', () => {
    expect(stripHtml('<a href="url">Link</a>')).toBe('Link')
  })
})

describe('String.escapeHtml', () => {
  describe('data-first', () => {
    it('escapes ampersands', () => {
      expect(escapeHtml('A & B')).toBe('A &amp; B')
    })

    it('escapes less than', () => {
      expect(escapeHtml('5 < 10')).toBe('5 &lt; 10')
    })

    it('escapes greater than', () => {
      expect(escapeHtml('10 > 5')).toBe('10 &gt; 5')
    })

    it('escapes double quotes', () => {
      expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;')
    })

    it('does not escape single quotes by default', () => {
      expect(escapeHtml("It's a test")).toBe("It's a test")
    })


    it('escapes script tags', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
      )
    })

    it('escapes multiple special characters', () => {
      expect(escapeHtml('A & B < C > D "E"')).toBe('A &amp; B &lt; C &gt; D &quot;E&quot;')
    })

    it('handles empty string', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('returns unchanged if no special characters', () => {
      expect(escapeHtml('Normal text')).toBe('Normal text')
    })
  })

})

describe('String.unescapeHtml', () => {
  it('unescapes ampersands', () => {
    expect(unescapeHtml('A &amp; B')).toBe('A & B')
  })

  it('unescapes less than', () => {
    expect(unescapeHtml('5 &lt; 10')).toBe('5 < 10')
  })

  it('unescapes greater than', () => {
    expect(unescapeHtml('10 &gt; 5')).toBe('10 > 5')
  })

  it('unescapes double quotes', () => {
    expect(unescapeHtml('Say &quot;hello&quot;')).toBe('Say "hello"')
  })

  it('unescapes single quotes (&#x27;)', () => {
    expect(unescapeHtml('It&#x27;s a test')).toBe("It's a test")
  })

  it('unescapes single quotes (&#39;)', () => {
    expect(unescapeHtml('It&#39;s a test')).toBe("It's a test")
  })

  it('unescapes multiple entities', () => {
    expect(unescapeHtml('A &amp; B &lt; C &gt; D &quot;E&quot;')).toBe(
      'A & B < C > D "E"'
    )
  })

  it('unescapes script tags', () => {
    expect(unescapeHtml('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')).toBe(
      '<script>alert("XSS")</script>'
    )
  })

  it('handles empty string', () => {
    expect(unescapeHtml('')).toBe('')
  })

  it('returns unchanged if no entities', () => {
    expect(unescapeHtml('Normal text')).toBe('Normal text')
  })

  it('is inverse of escapeHtml', () => {
    const original = '<script>alert("XSS")</script>'
    const escaped = escapeHtml(original)
    const unescaped = unescapeHtml(escaped)
    expect(unescaped).toBe(original)
  })
})

describe('String.trim', () => {
  it('trims whitespace from both ends', () => {
    expect(trim('  hello  ')).toBe('hello')
  })

  it('trims tabs and newlines', () => {
    expect(trim('\n\t  test  \n\t')).toBe('test')
  })

  it('does not trim middle whitespace', () => {
    expect(trim('  hello world  ')).toBe('hello world')
  })

  it('handles already trimmed string', () => {
    expect(trim('hello')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(trim('')).toBe('')
  })

  it('handles whitespace-only string', () => {
    expect(trim('   ')).toBe('')
  })
})

describe('String.trimStart', () => {
  it('trims leading whitespace', () => {
    expect(trimStart('  hello  ')).toBe('hello  ')
  })

  it('trims leading tabs and newlines', () => {
    expect(trimStart('\n\t  test')).toBe('test')
  })

  it('does not trim trailing whitespace', () => {
    expect(trimStart('  hello  ')).toBe('hello  ')
  })

  it('handles already trimmed string', () => {
    expect(trimStart('hello')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(trimStart('')).toBe('')
  })
})

describe('String.trimEnd', () => {
  it('trims trailing whitespace', () => {
    expect(trimEnd('  hello  ')).toBe('  hello')
  })

  it('trims trailing tabs and newlines', () => {
    expect(trimEnd('test\n\t  ')).toBe('test')
  })

  it('does not trim leading whitespace', () => {
    expect(trimEnd('  hello  ')).toBe('  hello')
  })

  it('handles already trimmed string', () => {
    expect(trimEnd('hello')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(trimEnd('')).toBe('')
  })
})
