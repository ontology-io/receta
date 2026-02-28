import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { prop, path, index, compose, view, set, over } from '../index'

describe('Lens Composition', () => {
  interface Address {
    street: string
    city: string
    zip: string
  }

  interface User {
    name: string
    address: Address
  }

  interface State {
    user: User
    counter: number
  }

  const state: State = {
    user: {
      name: 'Alice',
      address: {
        street: '123 Main St',
        city: 'Boston',
        zip: '02101',
      },
    },
    counter: 0,
  }

  describe('compose', () => {
    it('composes two prop lenses', () => {
      const userLens = prop<State>('user')
      const addressLens = prop<User>('address')
      const userAddressLens = compose(userLens, addressLens)

      const address = view(userAddressLens, state)

      expect(address).toEqual({
        street: '123 Main St',
        city: 'Boston',
        zip: '02101',
      })
    })

    it('sets through composed lenses', () => {
      const userLens = prop<State>('user')
      const addressLens = prop<User>('address')
      const userAddressLens = compose(userLens, addressLens)

      const newAddress: Address = {
        street: '456 Oak Ave',
        city: 'NYC',
        zip: '10001',
      }

      const updated = set(userAddressLens, newAddress, state)

      expect(updated.user.address).toEqual(newAddress)
      expect(updated.counter).toBe(0) // Unchanged
      expect(state.user.address.city).toBe('Boston') // Original unchanged
    })

    it('composes three lenses', () => {
      const userLens = prop<State>('user')
      const addressLens = prop<User>('address')
      const cityLens = prop<Address>('city')

      const stateCityLens = compose(compose(userLens, addressLens), cityLens)

      expect(view(stateCityLens, state)).toBe('Boston')

      const updated = set(stateCityLens, 'NYC', state)
      expect(updated.user.address.city).toBe('NYC')
      expect(updated.user.address.street).toBe('123 Main St')
      expect(state.user.address.city).toBe('Boston')
    })

    it('over through composed lenses', () => {
      const userLens = prop<State>('user')
      const nameLens = prop<User>('name')
      const userNameLens = compose(userLens, nameLens)

      const updated = over(
        userNameLens,
        (name) => name.toUpperCase(),
        state
      )

      expect(updated.user.name).toBe('ALICE')
      expect(state.user.name).toBe('Alice')
    })

    it('works with array index composition', () => {
      interface TodoList {
        todos: Array<{ text: string; done: boolean }>
      }

      const todoList: TodoList = {
        todos: [
          { text: 'Buy milk', done: false },
          { text: 'Walk dog', done: true },
        ],
      }

      const todosLens = prop<TodoList>('todos')
      const firstTodoLens = index<{ text: string; done: boolean }>(0)
      const firstTodoTextLens = compose(
        compose(todosLens, firstTodoLens),
        prop<{ text: string; done: boolean }>('text')
      )

      // TypeScript inference may need help with undefined handling
      expect(view(firstTodoTextLens, todoList)).toBe('Buy milk')
    })
  })

  describe('composition vs path', () => {
    it('composed lenses equivalent to path', () => {
      const userLens = prop<State>('user')
      const addressLens = prop<User>('address')
      const cityLens = prop<Address>('city')

      const composedLens = compose(compose(userLens, addressLens), cityLens)
      const pathLens = path<State, string>('user.address.city')

      expect(view(composedLens, state)).toBe(view(pathLens, state))

      const updated1 = set(composedLens, 'NYC', state)
      const updated2 = set(pathLens, 'NYC', state)

      expect(updated1).toEqual(updated2)
    })

    it('composition provides better type safety', () => {
      // With composition, each step is type-checked
      const userLens = prop<State>('user')
      const addressLens = prop<User>('address')
      const cityLens = prop<Address>('city')

      const typedLens = compose(compose(userLens, addressLens), cityLens)

      // This is fully type-safe
      const city: string = view(typedLens, state)
      expect(typeof city).toBe('string')
    })
  })

  describe('composition laws', () => {
    it('satisfies associativity', () => {
      const l1 = prop<State>('user')
      const l2 = prop<User>('address')
      const l3 = prop<Address>('city')

      // (l1 . l2) . l3 = l1 . (l2 . l3)
      const leftAssoc = compose(compose(l1, l2), l3)
      const rightAssoc = compose(l1, compose(l2, l3))

      expect(view(leftAssoc, state)).toBe(view(rightAssoc, state))

      const updated1 = set(leftAssoc, 'NYC', state)
      const updated2 = set(rightAssoc, 'NYC', state)

      expect(updated1).toEqual(updated2)
    })
  })

  describe('composing in pipes', () => {
    it('builds complex updates with composition', () => {
      const userLens = prop<State>('user')
      const addressLens = prop<User>('address')
      const cityLens = prop<Address>('city')
      const streetLens = prop<Address>('street')

      const userCityLens = compose(compose(userLens, addressLens), cityLens)
      const userStreetLens = compose(
        compose(userLens, addressLens),
        streetLens
      )

      const updated = R.pipe(
        state,
        set(userCityLens, 'NYC'),
        set(userStreetLens, '456 Park Ave')
      )

      expect(updated.user.address.city).toBe('NYC')
      expect(updated.user.address.street).toBe('456 Park Ave')
      expect(updated.user.address.zip).toBe('02101') // Unchanged
    })
  })
})
