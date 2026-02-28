import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { transformKeys } from '../transformKeys'
import { stripEmpty } from '../stripEmpty'

describe('Object.transformKeys', () => {
  describe('camelCase transformation', () => {
    it('converts snake_case to camelCase', () => {
      const input = {
        first_name: 'Alice',
        last_name: 'Smith',
        email_address: 'alice@example.com',
      }
      const result = transformKeys(input, 'camelCase')
      expect(result).toEqual({
        firstName: 'Alice',
        lastName: 'Smith',
        emailAddress: 'alice@example.com',
      })
    })

    it('converts kebab-case to camelCase', () => {
      const input = {
        'first-name': 'Alice',
        'last-name': 'Smith',
      }
      const result = transformKeys(input, 'camelCase')
      expect(result).toEqual({
        firstName: 'Alice',
        lastName: 'Smith',
      })
    })

    it('converts PascalCase to camelCase', () => {
      const input = {
        FirstName: 'Alice',
        LastName: 'Smith',
      }
      const result = transformKeys(input, 'camelCase')
      expect(result).toEqual({
        firstName: 'Alice',
        lastName: 'Smith',
      })
    })

    it('handles nested objects deeply', () => {
      const input = {
        user_id: 123,
        user_profile: {
          first_name: 'Alice',
          contact_info: {
            email_address: 'alice@example.com',
          },
        },
      }
      const result = transformKeys(input, 'camelCase')
      expect(result).toEqual({
        userId: 123,
        userProfile: {
          firstName: 'Alice',
          contactInfo: {
            emailAddress: 'alice@example.com',
          },
        },
      })
    })

    it('transforms keys in arrays of objects', () => {
      const input = {
        user_list: [
          { first_name: 'Alice', user_id: 1 },
          { first_name: 'Bob', user_id: 2 },
        ],
      }
      const result = transformKeys(input, 'camelCase')
      expect(result).toEqual({
        userList: [
          { firstName: 'Alice', userId: 1 },
          { firstName: 'Bob', userId: 2 },
        ],
      })
    })
  })

  describe('snakeCase transformation', () => {
    it('converts camelCase to snake_case', () => {
      const input = {
        firstName: 'Alice',
        lastName: 'Smith',
        emailAddress: 'alice@example.com',
      }
      const result = transformKeys(input, 'snakeCase')
      expect(result).toEqual({
        first_name: 'Alice',
        last_name: 'Smith',
        email_address: 'alice@example.com',
      })
    })

    it('converts PascalCase to snake_case', () => {
      const input = {
        FirstName: 'Alice',
        LastName: 'Smith',
      }
      const result = transformKeys(input, 'snakeCase')
      expect(result).toEqual({
        first_name: 'Alice',
        last_name: 'Smith',
      })
    })

    it('handles nested objects', () => {
      const input = {
        userId: 123,
        userProfile: {
          firstName: 'Alice',
          contactInfo: {
            emailAddress: 'alice@example.com',
          },
        },
      }
      const result = transformKeys(input, 'snakeCase')
      expect(result).toEqual({
        user_id: 123,
        user_profile: {
          first_name: 'Alice',
          contact_info: {
            email_address: 'alice@example.com',
          },
        },
      })
    })
  })

  describe('kebabCase transformation', () => {
    it('converts camelCase to kebab-case', () => {
      const input = {
        firstName: 'Alice',
        emailAddress: 'alice@example.com',
      }
      const result = transformKeys(input, 'kebabCase')
      expect(result).toEqual({
        'first-name': 'Alice',
        'email-address': 'alice@example.com',
      })
    })

    it('converts snake_case to kebab-case', () => {
      const input = {
        first_name: 'Alice',
        email_address: 'alice@example.com',
      }
      const result = transformKeys(input, 'kebabCase')
      expect(result).toEqual({
        'first-name': 'Alice',
        'email-address': 'alice@example.com',
      })
    })
  })

  describe('pascalCase transformation', () => {
    it('converts camelCase to PascalCase', () => {
      const input = {
        firstName: 'Alice',
        lastName: 'Smith',
      }
      const result = transformKeys(input, 'pascalCase')
      expect(result).toEqual({
        FirstName: 'Alice',
        LastName: 'Smith',
      })
    })

    it('converts snake_case to PascalCase', () => {
      const input = {
        first_name: 'Alice',
        last_name: 'Smith',
      }
      const result = transformKeys(input, 'pascalCase')
      expect(result).toEqual({
        FirstName: 'Alice',
        LastName: 'Smith',
      })
    })
  })

  describe('custom transformation function', () => {
    it('applies custom function to keys', () => {
      const input = { hello: 'world', foo: 'bar' }
      const result = transformKeys(input, (key) => key.toUpperCase())
      expect(result).toEqual({ HELLO: 'world', FOO: 'bar' })
    })

    it('can add prefixes', () => {
      const input = { id: 1, name: 'Alice' }
      const result = transformKeys(input, (key) => `user_${key}`)
      expect(result).toEqual({ user_id: 1, user_name: 'Alice' })
    })
  })

  describe('options', () => {
    it('shallow transformation (not recursive)', () => {
      const input = {
        user_name: 'Alice',
        user_meta: {
          created_at: '2024-01-01',
        },
      }
      const result = transformKeys(input, 'camelCase', { deep: false })
      expect(result).toEqual({
        userName: 'Alice',
        userMeta: {
          created_at: '2024-01-01',
        },
      })
    })

    it('skips array transformation when disabled', () => {
      const input = {
        user_list: [{ first_name: 'Alice' }],
      }
      const result = transformKeys(input, 'camelCase', { transformArrays: false })
      expect(result).toEqual({
        userList: [{ first_name: 'Alice' }],
      })
    })
  })

  describe('edge cases', () => {
    it('handles empty objects', () => {
      expect(transformKeys({}, 'camelCase')).toEqual({})
    })

    it('preserves primitive values', () => {
      const input = {
        str_val: 'hello',
        num_val: 42,
        bool_val: true,
        null_val: null,
      }
      const result = transformKeys(input, 'camelCase')
      expect(result).toEqual({
        strVal: 'hello',
        numVal: 42,
        boolVal: true,
        nullVal: null,
      })
    })

    it('preserves Date objects', () => {
      const date = new Date('2024-01-01')
      const input = { created_at: date }
      const result = transformKeys(input, 'camelCase')
      expect(result).toEqual({ createdAt: date })
      expect(result.createdAt).toBe(date)
    })

    it('preserves arrays of primitives', () => {
      const input = {
        tag_list: ['js', 'ts', 'node'],
      }
      const result = transformKeys(input, 'camelCase')
      expect(result).toEqual({
        tagList: ['js', 'ts', 'node'],
      })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const input = { user_name: 'Alice' }
      const result = R.pipe(input, transformKeys('camelCase'))
      expect(result).toEqual({ userName: 'Alice' })
    })
  })
})

describe('Object.stripEmpty', () => {
  describe('default behavior', () => {
    it('removes null and undefined', () => {
      const input = {
        name: 'Alice',
        age: null,
        email: undefined,
      }
      const result = stripEmpty(input)
      expect(result).toEqual({ name: 'Alice' })
    })

    it('removes empty strings', () => {
      const input = {
        name: 'Alice',
        bio: '',
        email: 'alice@example.com',
      }
      const result = stripEmpty(input)
      expect(result).toEqual({
        name: 'Alice',
        email: 'alice@example.com',
      })
    })

    it('removes empty arrays', () => {
      const input = {
        name: 'Alice',
        tags: [],
        roles: ['admin'],
      }
      const result = stripEmpty(input)
      expect(result).toEqual({
        name: 'Alice',
        roles: ['admin'],
      })
    })

    it('removes empty objects', () => {
      const input = {
        name: 'Alice',
        metadata: {},
        settings: { theme: 'dark' },
      }
      const result = stripEmpty(input)
      expect(result).toEqual({
        name: 'Alice',
        settings: { theme: 'dark' },
      })
    })

    it('keeps falsy non-empty values (0, false)', () => {
      const input = {
        count: 0,
        active: false,
        name: '',
      }
      const result = stripEmpty(input)
      expect(result).toEqual({
        count: 0,
        active: false,
      })
    })
  })

  describe('deep stripping', () => {
    it('strips empty values from nested objects', () => {
      const input = {
        user: {
          name: 'Alice',
          bio: '',
          settings: {
            theme: null,
            notifications: [],
          },
        },
        metadata: {},
      }
      const result = stripEmpty(input)
      // settings becomes {} after stripping inner values, then is kept as {}
      // metadata is already empty object, gets removed
      expect(result).toEqual({
        user: {
          name: 'Alice',
        },
      })
    })

    it('removes nested objects that become empty after stripping', () => {
      const input = {
        user: {
          name: 'Alice',
          meta: {
            bio: '',
            tags: [],
          },
        },
      }
      const result = stripEmpty(input)
      // meta becomes {} after stripping, which is then removed
      expect(result).toEqual({
        user: {
          name: 'Alice',
        },
      })
    })
  })

  describe('options', () => {
    it('keeps empty strings when stripEmptyStrings: false', () => {
      const input = { name: '', tags: [] }
      const result = stripEmpty(input, { stripEmptyStrings: false })
      expect(result).toEqual({ name: '' })
    })

    it('keeps empty arrays when stripEmptyArrays: false', () => {
      const input = { name: '', tags: [] }
      const result = stripEmpty(input, { stripEmptyArrays: false })
      expect(result).toEqual({ tags: [] })
    })

    it('keeps empty objects when stripEmptyObjects: false', () => {
      const input = { name: '', metadata: {} }
      const result = stripEmpty(input, { stripEmptyObjects: false })
      expect(result).toEqual({ metadata: {} })
    })

    it('shallow stripping (not recursive)', () => {
      const input = {
        name: 'Alice',
        nested: {
          bio: '',
          age: null,
        },
      }
      const result = stripEmpty(input, { deep: false })
      expect(result).toEqual({
        name: 'Alice',
        nested: {
          bio: '',
          age: null,
        },
      })
    })

    it('combines multiple options', () => {
      const input = {
        name: '',
        tags: [],
        metadata: {},
        count: 0,
      }
      const result = stripEmpty(input, {
        stripEmptyStrings: false,
        stripEmptyArrays: false,
        stripEmptyObjects: true,
      })
      expect(result).toEqual({
        name: '',
        tags: [],
        count: 0,
      })
    })
  })

  describe('real-world use cases', () => {
    it('cleans API request payload', () => {
      const formData = {
        title: 'New Post',
        body: 'Content here',
        tags: [],
        draft: false,
        publishedAt: null,
        metadata: {},
      }
      const result = stripEmpty(formData)
      expect(result).toEqual({
        title: 'New Post',
        body: 'Content here',
        draft: false,
      })
    })

    it('prepares search filters', () => {
      const filters = {
        query: 'javascript',
        category: '',
        tags: [],
        minPrice: 0,
        maxPrice: null,
      }
      const result = stripEmpty(filters)
      expect(result).toEqual({
        query: 'javascript',
        minPrice: 0,
      })
    })
  })

  describe('edge cases', () => {
    it('handles empty objects', () => {
      expect(stripEmpty({})).toEqual({})
    })

    it('handles objects with all empty values', () => {
      const input = {
        a: null,
        b: undefined,
        c: '',
        d: [],
        e: {},
      }
      expect(stripEmpty(input)).toEqual({})
    })

    it('handles deeply nested structures', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
              empty: '',
            },
          },
        },
      }
      const result = stripEmpty(input)
      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const input = { name: 'Alice', bio: '', tags: [] }
      const result = R.pipe(
        input,
        (obj) => stripEmpty(obj)
      )
      expect(result).toEqual({ name: 'Alice' })
    })

    it('works in pipe with options', () => {
      const input = { name: '', tags: [] }
      const result = R.pipe(input, stripEmpty({ stripEmptyStrings: false }))
      expect(result).toEqual({ name: '' })
    })
  })
})
