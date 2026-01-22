import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { prop, path, index, view, set, over } from '../index'

describe('Lens Operations', () => {
  interface User {
    name: string
    email: string
    age: number
    address: {
      city: string
      zip: string
    }
  }

  const user: User = {
    name: 'Alice',
    email: 'alice@example.com',
    age: 30,
    address: {
      city: 'Boston',
      zip: '02101',
    },
  }

  describe('view', () => {
    describe('data-first', () => {
      it('reads value through prop lens', () => {
        const nameLens = prop<User>('name')
        expect(view(nameLens, user)).toBe('Alice')
      })

      it('reads value through path lens', () => {
        const cityLens = path<User, string>('address.city')
        expect(view(cityLens, user)).toBe('Boston')
      })

      it('reads value through index lens', () => {
        const firstLens = index<number>(0)
        const numbers = [10, 20, 30]
        expect(view(firstLens, numbers)).toBe(10)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const nameLens = prop<User>('name')

        const result = R.pipe(user, view(nameLens))

        expect(result).toBe('Alice')
      })

      it('works with multiple pipe stages', () => {
        const nameLens = prop<User>('name')

        const result = R.pipe(
          user,
          view(nameLens),
          (name) => name.toUpperCase()
        )

        expect(result).toBe('ALICE')
      })
    })
  })

  describe('set', () => {
    describe('data-first', () => {
      it('sets value through prop lens', () => {
        const nameLens = prop<User>('name')
        const updated = set(nameLens, 'Bob', user)

        expect(updated.name).toBe('Bob')
        expect(updated.email).toBe('alice@example.com')
        expect(user.name).toBe('Alice') // Original unchanged
      })

      it('sets value through path lens', () => {
        const cityLens = path<User, string>('address.city')
        const updated = set(cityLens, 'NYC', user)

        expect(updated.address.city).toBe('NYC')
        expect(updated.address.zip).toBe('02101')
        expect(user.address.city).toBe('Boston') // Original unchanged
      })

      it('sets value through index lens', () => {
        const secondLens = index<number>(1)
        const numbers = [1, 2, 3, 4, 5]
        const updated = set(secondLens, 20, numbers)

        expect(updated).toEqual([1, 20, 3, 4, 5])
        expect(numbers).toEqual([1, 2, 3, 4, 5]) // Original unchanged
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const nameLens = prop<User>('name')

        const updated = R.pipe(user, set(nameLens, 'Bob'))

        expect(updated.name).toBe('Bob')
        expect(user.name).toBe('Alice') // Original unchanged
      })

      it('chains multiple sets', () => {
        const nameLens = prop<User>('name')
        const ageLens = prop<User>('age')

        const updated = R.pipe(
          user,
          set(nameLens, 'Bob'),
          set(ageLens, 31)
        )

        expect(updated.name).toBe('Bob')
        expect(updated.age).toBe(31)
        expect(user.name).toBe('Alice')
        expect(user.age).toBe(30)
      })
    })

    it('maintains immutability', () => {
      const nameLens = prop<User>('name')
      const original = { ...user }

      set(nameLens, 'Charlie', user)

      expect(user).toEqual(original)
    })
  })

  describe('over', () => {
    describe('data-first', () => {
      it('transforms value through prop lens', () => {
        const ageLens = prop<User>('age')
        const updated = over(ageLens, (age) => age + 1, user)

        expect(updated.age).toBe(31)
        expect(user.age).toBe(30) // Original unchanged
      })

      it('transforms string values', () => {
        const nameLens = prop<User>('name')
        const updated = over(
          nameLens,
          (name) => name.toUpperCase(),
          user
        )

        expect(updated.name).toBe('ALICE')
        expect(user.name).toBe('Alice')
      })

      it('transforms nested values', () => {
        const cityLens = path<User, string>('address.city')
        const updated = over(
          cityLens,
          (city) => city.toUpperCase(),
          user
        )

        expect(updated.address.city).toBe('BOSTON')
        expect(user.address.city).toBe('Boston')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const ageLens = prop<User>('age')

        const updated = R.pipe(
          user,
          over(ageLens, (age) => age + 1)
        )

        expect(updated.age).toBe(31)
      })

      it('chains multiple transformations', () => {
        const nameLens = prop<User>('name')
        const ageLens = prop<User>('age')

        const updated = R.pipe(
          user,
          over(nameLens, (name) => name.toUpperCase()),
          over(ageLens, (age) => age + 1)
        )

        expect(updated.name).toBe('ALICE')
        expect(updated.age).toBe(31)
        expect(user.name).toBe('Alice')
        expect(user.age).toBe(30)
      })
    })

    it('works with complex transformations', () => {
      interface State {
        todos: Array<{ id: number; text: string; done: boolean }>
      }

      const state: State = {
        todos: [
          { id: 1, text: 'Buy milk', done: false },
          { id: 2, text: 'Walk dog', done: true },
        ],
      }

      const todosLens = prop<State>('todos')

      const updated = over(
        todosLens,
        (todos) =>
          todos.map((todo) =>
            todo.id === 1 ? { ...todo, done: true } : todo
          ),
        state
      )

      expect(updated.todos[0]?.done).toBe(true)
      expect(state.todos[0]?.done).toBe(false)
    })

    it('maintains immutability across nested structures', () => {
      const cityLens = path<User, string>('address.city')
      const original = { ...user, address: { ...user.address } }

      over(cityLens, (city) => city.toUpperCase(), user)

      expect(user).toEqual(original)
    })
  })

  describe('combining operations', () => {
    it('combines view and set', () => {
      const ageLens = prop<User>('age')

      const currentAge = view(ageLens, user)
      const updated = set(ageLens, currentAge + 1, user)

      expect(updated.age).toBe(31)
    })

    it('uses view, transform, and set pattern', () => {
      const nameLens = prop<User>('name')

      const name = view(nameLens, user)
      const upperName = name.toUpperCase()
      const updated = set(nameLens, upperName, user)

      expect(updated.name).toBe('ALICE')
    })

    it('equivalence: over = view + transform + set', () => {
      const ageLens = prop<User>('age')
      const transform = (age: number) => age * 2

      const manualUpdate = set(ageLens, transform(view(ageLens, user)), user)
      const overUpdate = over(ageLens, transform, user)

      expect(manualUpdate).toEqual(overUpdate)
    })
  })
})
