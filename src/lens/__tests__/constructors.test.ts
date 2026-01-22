import { describe, it, expect } from 'bun:test'
import { lens, prop, path, index } from '../index'

describe('Lens Constructors', () => {
  describe('lens', () => {
    it('creates a lens from get and set functions', () => {
      interface User {
        name: string
        age: number
      }

      const nameLens = lens<User, string>(
        (user) => user.name,
        (name) => (user) => ({ ...user, name })
      )

      const user = { name: 'Alice', age: 30 }

      expect(nameLens.get(user)).toBe('Alice')
      expect(nameLens.set('Bob')(user)).toEqual({ name: 'Bob', age: 30 })
      expect(user).toEqual({ name: 'Alice', age: 30 }) // Original unchanged
    })

    it('works with nested structures', () => {
      interface State {
        counter: number
        settings: { theme: string }
      }

      const themeLens = lens<State, string>(
        (state) => state.settings.theme,
        (theme) => (state) => ({
          ...state,
          settings: { ...state.settings, theme },
        })
      )

      const state = { counter: 0, settings: { theme: 'dark' } }

      expect(themeLens.get(state)).toBe('dark')
      expect(themeLens.set('light')(state)).toEqual({
        counter: 0,
        settings: { theme: 'light' },
      })
    })
  })

  describe('prop', () => {
    interface User {
      name: string
      email: string
      age: number
    }

    const user: User = {
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
    }

    it('creates a lens for a simple property', () => {
      const nameLens = prop<User>('name')

      expect(nameLens.get(user)).toBe('Alice')
    })

    it('updates a property immutably', () => {
      const nameLens = prop<User>('name')
      const updated = nameLens.set('Bob')(user)

      expect(updated).toEqual({
        name: 'Bob',
        email: 'alice@example.com',
        age: 30,
      })
      expect(user.name).toBe('Alice') // Original unchanged
    })

    it('works with different property types', () => {
      const ageLens = prop<User>('age')
      const emailLens = prop<User>('email')

      expect(ageLens.get(user)).toBe(30)
      expect(emailLens.get(user)).toBe('alice@example.com')

      expect(ageLens.set(31)(user).age).toBe(31)
      expect(emailLens.set('newemail@example.com')(user).email).toBe(
        'newemail@example.com'
      )
    })
  })

  describe('path', () => {
    interface User {
      name: string
      address: {
        street: string
        city: string
        zip: string
        country: {
          name: string
          code: string
        }
      }
    }

    const user: User = {
      name: 'Alice',
      address: {
        street: '123 Main St',
        city: 'Boston',
        zip: '02101',
        country: {
          name: 'USA',
          code: 'US',
        },
      },
    }

    it('accesses nested properties', () => {
      const cityLens = path<User, string>('address.city')

      expect(cityLens.get(user)).toBe('Boston')
    })

    it('updates nested properties immutably', () => {
      const cityLens = path<User, string>('address.city')
      const updated = cityLens.set('NYC')(user)

      expect(updated.address.city).toBe('NYC')
      expect(updated.address.street).toBe('123 Main St')
      expect(updated.name).toBe('Alice')
      expect(user.address.city).toBe('Boston') // Original unchanged
    })

    it('works with deeply nested paths', () => {
      const countryCodeLens = path<User, string>('address.country.code')

      expect(countryCodeLens.get(user)).toBe('US')

      const updated = countryCodeLens.set('CA')(user)
      expect(updated.address.country.code).toBe('CA')
      expect(updated.address.country.name).toBe('USA') // Sibling unchanged
      expect(user.address.country.code).toBe('US') // Original unchanged
    })

    it('handles single-level paths', () => {
      const nameLens = path<User, string>('name')

      expect(nameLens.get(user)).toBe('Alice')
      expect(nameLens.set('Bob')(user).name).toBe('Bob')
    })

    it('returns undefined for non-existent paths', () => {
      const invalidLens = path<User, any>('nonexistent.property')

      expect(invalidLens.get(user)).toBeUndefined()
    })
  })

  describe('index', () => {
    it('creates a lens for array element', () => {
      const firstLens = index<number>(0)
      const thirdLens = index<number>(2)

      const numbers = [1, 2, 3, 4, 5]

      expect(firstLens.get(numbers)).toBe(1)
      expect(thirdLens.get(numbers)).toBe(3)
    })

    it('updates array element immutably', () => {
      const secondLens = index<number>(1)
      const numbers = [1, 2, 3, 4, 5]

      const updated = secondLens.set(20)(numbers)

      expect(updated).toEqual([1, 20, 3, 4, 5])
      expect(numbers).toEqual([1, 2, 3, 4, 5]) // Original unchanged
    })

    it('works with object arrays', () => {
      interface Todo {
        id: number
        text: string
        done: boolean
      }

      const todos: Todo[] = [
        { id: 1, text: 'Buy milk', done: false },
        { id: 2, text: 'Walk dog', done: true },
      ]

      const firstTodoLens = index<Todo>(0)
      const secondTodoLens = index<Todo>(1)

      expect(firstTodoLens.get(todos)).toEqual({
        id: 1,
        text: 'Buy milk',
        done: false,
      })

      const updated = secondTodoLens.set({
        id: 2,
        text: 'Walk dog',
        done: false,
      })(todos)

      expect(updated[1]?.done).toBe(false)
      expect(todos[1]?.done).toBe(true) // Original unchanged
    })

    it('returns undefined for out of bounds index', () => {
      const lens = index<number>(10)
      const numbers = [1, 2, 3]

      expect(lens.get(numbers)).toBeUndefined()
    })

    it('does not update for out of bounds index', () => {
      const lens = index<number>(10)
      const numbers = [1, 2, 3]

      const updated = lens.set(100)(numbers)
      expect(updated).toEqual([1, 2, 3])
    })

    it('does not update when setting undefined', () => {
      const lens = index<number | undefined>(1)
      const numbers = [1, 2, 3]

      const updated = lens.set(undefined)(numbers)
      expect(updated).toEqual([1, 2, 3])
    })
  })
})
