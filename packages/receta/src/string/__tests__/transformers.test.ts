import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { slugify } from '../slugify'
import { kebabCase, snakeCase, camelCase, pascalCase, capitalize, titleCase } from '../case'
import { truncate } from '../truncate'

describe('String.slugify', () => {
  it('converts to lowercase and replaces spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello World!')).toBe('hello-world')
    expect(slugify('TypeScript & JavaScript')).toBe('typescript-javascript')
  })

  it('handles consecutive spaces', () => {
    expect(slugify('Hello    World')).toBe('hello-world')
  })

  it('trims leading and trailing spaces', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })

  it('removes diacritics', () => {
    expect(slugify('Café Münster')).toBe('cafe-munster')
    expect(slugify('Mañana')).toBe('manana')
  })

  it('handles numbers', () => {
    expect(slugify('10 Tips for Better Code')).toBe('10-tips-for-better-code')
  })

  it('collapses consecutive hyphens', () => {
    expect(slugify('Hello--World')).toBe('hello-world')
  })

  it('handles underscores', () => {
    expect(slugify('hello_world')).toBe('hello-world')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })
})

describe('String.kebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(kebabCase('helloWorld')).toBe('hello-world')
    expect(kebabCase('userProfilePage')).toBe('user-profile-page')
  })

  it('converts PascalCase to kebab-case', () => {
    expect(kebabCase('UserProfilePage')).toBe('user-profile-page')
  })

  it('converts snake_case to kebab-case', () => {
    expect(kebabCase('user_profile_page')).toBe('user-profile-page')
  })

  it('converts SCREAMING_SNAKE_CASE to kebab-case', () => {
    expect(kebabCase('API_KEY_VALUE')).toBe('api-key-value')
  })

  it('handles consecutive capitals', () => {
    expect(kebabCase('XMLHttpRequest')).toBe('xml-http-request')
  })

  it('handles mixed formats', () => {
    expect(kebabCase('getHTTPSUrl')).toBe('get-https-url')
  })

  it('handles empty string', () => {
    expect(kebabCase('')).toBe('')
  })
})

describe('String.snakeCase', () => {
  it('converts camelCase to snake_case', () => {
    expect(snakeCase('helloWorld')).toBe('hello_world')
    expect(snakeCase('userProfilePage')).toBe('user_profile_page')
  })

  it('converts PascalCase to snake_case', () => {
    expect(snakeCase('UserProfilePage')).toBe('user_profile_page')
  })

  it('converts kebab-case to snake_case', () => {
    expect(snakeCase('user-profile-page')).toBe('user_profile_page')
  })

  it('handles consecutive capitals', () => {
    expect(snakeCase('XMLHttpRequest')).toBe('xml_http_request')
  })

  it('handles spaces', () => {
    expect(snakeCase('hello world')).toBe('hello_world')
  })

  it('handles empty string', () => {
    expect(snakeCase('')).toBe('')
  })
})

describe('String.camelCase', () => {
  it('converts kebab-case to camelCase', () => {
    expect(camelCase('hello-world')).toBe('helloWorld')
  })

  it('converts snake_case to camelCase', () => {
    expect(camelCase('user_profile_page')).toBe('userProfilePage')
  })

  it('converts spaces to camelCase', () => {
    expect(camelCase('hello world test')).toBe('helloWorldTest')
  })

  it('converts SCREAMING_SNAKE_CASE to camelCase', () => {
    expect(camelCase('API_KEY_VALUE')).toBe('apiKeyValue')
  })

  it('handles already camelCase', () => {
    expect(camelCase('alreadyCamelCase')).toBe('alreadycamelcase')
  })

  it('handles PascalCase', () => {
    expect(camelCase('PascalCase')).toBe('pascalcase')
  })

  it('handles empty string', () => {
    expect(camelCase('')).toBe('')
  })
})

describe('String.pascalCase', () => {
  it('converts kebab-case to PascalCase', () => {
    expect(pascalCase('hello-world')).toBe('HelloWorld')
  })

  it('converts snake_case to PascalCase', () => {
    expect(pascalCase('user_profile_page')).toBe('UserProfilePage')
  })

  it('converts spaces to PascalCase', () => {
    expect(pascalCase('hello world test')).toBe('HelloWorldTest')
  })

  it('converts camelCase to PascalCase', () => {
    expect(pascalCase('helloWorld')).toBe('Helloworld')
  })

  it('handles empty string', () => {
    expect(pascalCase('')).toBe('')
  })
})

describe('String.capitalize', () => {
  it('capitalizes first character', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('does not lowercase rest', () => {
    expect(capitalize('hELLO')).toBe('HELLO')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('handles empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })
})

describe('String.titleCase', () => {
  it('capitalizes each word', () => {
    expect(titleCase('hello world')).toBe('Hello World')
  })

  it('handles multiple words', () => {
    expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox')
  })

  it('only capitalizes after spaces', () => {
    expect(titleCase('hello-world')).toBe('Hello-World')
  })

  it('handles single word', () => {
    expect(titleCase('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(titleCase('')).toBe('')
  })
})

describe('String.truncate', () => {
  describe('data-first', () => {
    it('truncates string to length', () => {
      expect(truncate('Hello world', { length: 8 })).toBe('Hello...')
    })

    it('returns original if under limit', () => {
      expect(truncate('Short', { length: 10 })).toBe('Short')
    })

    it('uses custom ellipsis', () => {
      expect(truncate('Hello world', { length: 8, ellipsis: '…' })).toBe('Hello w…')
    })

    it('truncates at word boundary', () => {
      expect(truncate('The quick brown fox', { length: 15, words: true })).toBe('The quick...')
    })

    it('handles word boundary without spaces', () => {
      expect(truncate('Verylongwordhere', { length: 10, words: true })).toBe('Verylon...')
    })

    it('handles ellipsis longer than length', () => {
      expect(truncate('Hello', { length: 2, ellipsis: '......' })).toBe('..')
    })

    it('handles empty string', () => {
      expect(truncate('', { length: 10 })).toBe('')
    })

    it('accounts for ellipsis in length', () => {
      const result = truncate('Hello world', { length: 8 })
      expect(result.length).toBe(8)
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe('A very long string', truncate({ length: 10 }))
      expect(result).toBe('A very ...')
    })

    it('works with word boundary in pipe', () => {
      const result = R.pipe(
        'The quick brown fox',
        truncate({ length: 15, words: true })
      )
      expect(result).toBe('The quick...')
    })
  })
})
