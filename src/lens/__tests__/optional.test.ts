import { describe, it, expect } from 'bun:test'
import { prop, optional, view, set, over } from '../index'
import { some, none, isSome, isNone } from '../../option'

describe('Optional Lenses', () => {
  interface User {
    name: string
    email?: string
    phone?: string
  }

  describe('optional', () => {
    it('wraps defined values in Some', () => {
      const emailLens = prop<User>('email')
      const optionalEmailLens = optional(emailLens)

      const user: User = { name: 'Alice', email: 'alice@example.com' }

      const result = view(optionalEmailLens, user)

      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('alice@example.com')
      }
    })

    it('wraps undefined values in None', () => {
      const phoneLens = prop<User>('phone')
      const optionalPhoneLens = optional(phoneLens)

      const user: User = { name: 'Bob' }

      const result = view(optionalPhoneLens, user)

      expect(isNone(result)).toBe(true)
    })

    it('sets Some value', () => {
      const emailLens = prop<User>('email')
      const optionalEmailLens = optional(emailLens)

      const user: User = { name: 'Alice' }

      const updated = set(optionalEmailLens, some('alice@example.com'), user)

      expect(updated.email).toBe('alice@example.com')
      expect(user.email).toBeUndefined() // Original unchanged
    })

    it('sets None to undefined', () => {
      const emailLens = prop<User>('email')
      const optionalEmailLens = optional(emailLens)

      const user: User = { name: 'Alice', email: 'alice@example.com' }

      const updated = set(optionalEmailLens, none, user)

      expect(updated.email).toBeUndefined()
      expect(user.email).toBe('alice@example.com') // Original unchanged
    })

    it('transforms optional values with over', () => {
      const emailLens = prop<User>('email')
      const optionalEmailLens = optional(emailLens)

      const user: User = { name: 'Alice', email: 'ALICE@EXAMPLE.COM' }

      const updated = over(
        optionalEmailLens,
        (opt) => {
          if (isSome(opt)) {
            return some(opt.value.toLowerCase())
          }
          return none
        },
        user
      )

      expect(updated.email).toBe('alice@example.com')
    })

    it('handles transformation when value is None', () => {
      const phoneLens = prop<User>('phone')
      const optionalPhoneLens = optional(phoneLens)

      const user: User = { name: 'Bob' }

      const updated = over(
        optionalPhoneLens,
        (opt) => {
          if (isSome(opt)) {
            return some(opt.value.toUpperCase())
          }
          return some('555-1234') // Provide default
        },
        user
      )

      expect(updated.phone).toBe('555-1234')
    })

    it('works with null values', () => {
      interface Data {
        value?: string | null
      }

      const valueLens = prop<Data>('value')
      const optionalValueLens = optional(valueLens)

      const data1: Data = { value: null }
      const data2: Data = { value: 'hello' }

      expect(isNone(view(optionalValueLens, data1))).toBe(true)
      expect(isSome(view(optionalValueLens, data2))).toBe(true)
    })
  })

  describe('integration with Option module', () => {
    it('can use Option.map with optional lens', () => {
      const Option = require('../../option')

      const emailLens = prop<User>('email')
      const optionalEmailLens = optional(emailLens)

      const user: User = { name: 'Alice', email: 'alice@example.com' }

      const updated = over(
        optionalEmailLens,
        (opt) => Option.map(opt, (email: string) => email.toUpperCase()),
        user
      )

      expect(updated.email).toBe('ALICE@EXAMPLE.COM')
    })

    it('can use Option.flatMap with optional lens', () => {
      const Option = require('../../option')

      const emailLens = prop<User>('email')
      const optionalEmailLens = optional(emailLens)

      const user: User = { name: 'Alice', email: 'alice@example.com' }

      const updated = over(
        optionalEmailLens,
        (opt) =>
          Option.flatMap(opt, (email: string) => {
            return email.includes('@') ? some(email) : none
          }),
        user
      )

      expect(updated.email).toBe('alice@example.com')
    })

    it('removes invalid emails using Option.filter', () => {
      const Option = require('../../option')

      const emailLens = prop<User>('email')
      const optionalEmailLens = optional(emailLens)

      const user: User = { name: 'Alice', email: 'invalid-email' }

      const updated = over(
        optionalEmailLens,
        (opt) => Option.filter(opt, (email: string) => email.includes('@')),
        user
      )

      expect(updated.email).toBeUndefined()
    })
  })

  describe('practical patterns', () => {
    it('safely updates optional configuration', () => {
      interface Config {
        apiKey?: string
        timeout?: number
      }

      const apiKeyLens = prop<Config>('apiKey')
      const optionalApiKeyLens = optional(apiKeyLens)

      const config1: Config = {}
      const config2: Config = { apiKey: 'abc123' }

      // Set API key if not present
      const updated1 = over(
        optionalApiKeyLens,
        (opt) => (isNone(opt) ? some('default-key') : opt),
        config1
      )

      expect(updated1.apiKey).toBe('default-key')

      // Keep existing API key
      const updated2 = over(
        optionalApiKeyLens,
        (opt) => (isNone(opt) ? some('default-key') : opt),
        config2
      )

      expect(updated2.apiKey).toBe('abc123')
    })

    it('validates and normalizes optional fields', () => {
      interface Form {
        username: string
        website?: string
      }

      const websiteLens = prop<Form>('website')
      const optionalWebsiteLens = optional(websiteLens)

      const form: Form = {
        username: 'alice',
        website: 'example.com',
      }

      // Normalize website URL
      const updated = over(
        optionalWebsiteLens,
        (opt) => {
          if (isSome(opt)) {
            const url = opt.value
            return some(
              url.startsWith('http') ? url : `https://${url}`
            )
          }
          return none
        },
        form
      )

      expect(updated.website).toBe('https://example.com')
    })
  })
})
