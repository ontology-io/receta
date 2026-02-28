import { describe, it, expect } from 'bun:test'
import { lens, prop, path, view, set, over, compose } from '../index'

/**
 * Property-based tests verifying lens laws.
 *
 * Lenses must satisfy three fundamental laws:
 * 1. Get-Set: If you get a value and set it back, nothing changes
 * 2. Set-Get: If you set a value, getting it returns that value
 * 3. Set-Set: Setting twice is the same as setting once (last write wins)
 */
describe('Lens Laws', () => {
  interface User {
    name: string
    age: number
    address: {
      city: string
      zip: string
    }
  }

  const user: User = {
    name: 'Alice',
    age: 30,
    address: {
      city: 'Boston',
      zip: '02101',
    },
  }

  describe('Get-Set Law (view then set is identity)', () => {
    it('holds for prop lens', () => {
      const nameLens = prop<User>('name')

      const value = view(nameLens, user)
      const updated = set(nameLens, value, user)

      expect(updated).toEqual(user)
    })

    it('holds for path lens', () => {
      const cityLens = path<User, string>('address.city')

      const value = view(cityLens, user)
      const updated = set(cityLens, value, user)

      expect(updated).toEqual(user)
    })

    it('holds for custom lens', () => {
      const ageLens = lens<User, number>(
        (u) => u.age,
        (age) => (u) => ({ ...u, age })
      )

      const value = view(ageLens, user)
      const updated = set(ageLens, value, user)

      expect(updated).toEqual(user)
    })

    it('holds for composed lenses', () => {
      const addressLens = prop<User>('address')
      const cityLens = prop<User['address']>('city')
      const composedLens = compose(addressLens, cityLens)

      const value = view(composedLens, user)
      const updated = set(composedLens, value, user)

      expect(updated).toEqual(user)
    })
  })

  describe('Set-Get Law (set then view returns set value)', () => {
    it('holds for prop lens', () => {
      const nameLens = prop<User>('name')
      const newName = 'Bob'

      const updated = set(nameLens, newName, user)
      const retrieved = view(nameLens, updated)

      expect(retrieved).toBe(newName)
    })

    it('holds for path lens', () => {
      const cityLens = path<User, string>('address.city')
      const newCity = 'NYC'

      const updated = set(cityLens, newCity, user)
      const retrieved = view(cityLens, updated)

      expect(retrieved).toBe(newCity)
    })

    it('holds for custom lens', () => {
      const ageLens = lens<User, number>(
        (u) => u.age,
        (age) => (u) => ({ ...u, age })
      )
      const newAge = 40

      const updated = set(ageLens, newAge, user)
      const retrieved = view(ageLens, updated)

      expect(retrieved).toBe(newAge)
    })

    it('holds for composed lenses', () => {
      const addressLens = prop<User>('address')
      const cityLens = prop<User['address']>('city')
      const composedLens = compose(addressLens, cityLens)
      const newCity = 'SF'

      const updated = set(composedLens, newCity, user)
      const retrieved = view(composedLens, updated)

      expect(retrieved).toBe(newCity)
    })
  })

  describe('Set-Set Law (second set wins)', () => {
    it('holds for prop lens', () => {
      const nameLens = prop<User>('name')

      const updated1 = set(nameLens, 'Bob', user)
      const updated2 = set(nameLens, 'Charlie', updated1)
      const direct = set(nameLens, 'Charlie', user)

      expect(updated2).toEqual(direct)
    })

    it('holds for path lens', () => {
      const cityLens = path<User, string>('address.city')

      const updated1 = set(cityLens, 'NYC', user)
      const updated2 = set(cityLens, 'SF', updated1)
      const direct = set(cityLens, 'SF', user)

      expect(updated2).toEqual(direct)
    })

    it('holds for custom lens', () => {
      const ageLens = lens<User, number>(
        (u) => u.age,
        (age) => (u) => ({ ...u, age })
      )

      const updated1 = set(ageLens, 35, user)
      const updated2 = set(ageLens, 40, updated1)
      const direct = set(ageLens, 40, user)

      expect(updated2).toEqual(direct)
    })

    it('holds for composed lenses', () => {
      const addressLens = prop<User>('address')
      const cityLens = prop<User['address']>('city')
      const composedLens = compose(addressLens, cityLens)

      const updated1 = set(composedLens, 'NYC', user)
      const updated2 = set(composedLens, 'LA', updated1)
      const direct = set(composedLens, 'LA', user)

      expect(updated2).toEqual(direct)
    })
  })

  describe('Over laws', () => {
    it('over with identity is identity', () => {
      const nameLens = prop<User>('name')
      const identity = <T>(x: T) => x

      const updated = over(nameLens, identity, user)

      expect(updated).toEqual(user)
    })

    it('over with composition equals composed overs', () => {
      const nameLens = prop<User>('name')
      const f = (s: string) => s.toUpperCase()
      const g = (s: string) => s + '!'

      const composed = over(nameLens, (s) => g(f(s)), user)
      const sequential = over(nameLens, g, over(nameLens, f, user))

      expect(composed).toEqual(sequential)
    })

    it('over is equivalent to view + transform + set', () => {
      const ageLens = prop<User>('age')
      const transform = (n: number) => n + 10

      const viaOver = over(ageLens, transform, user)
      const viaViewSet = set(
        ageLens,
        transform(view(ageLens, user)),
        user
      )

      expect(viaOver).toEqual(viaViewSet)
    })
  })

  describe('Composition laws', () => {
    it('composition is associative', () => {
      const l1 = prop<User>('address')
      const l2 = prop<User['address']>('city')

      // Identity lens for testing
      const id = lens<string, string>(
        (s) => s,
        (s) => () => s
      )

      const leftAssoc = compose(compose(l1, l2), id)
      const rightAssoc = compose(l1, compose(l2, id))

      expect(view(leftAssoc, user)).toBe(view(rightAssoc, user))

      const updated1 = set(leftAssoc, 'NYC', user)
      const updated2 = set(rightAssoc, 'NYC', user)

      expect(updated1).toEqual(updated2)
    })
  })

  describe('Immutability invariant', () => {
    it('set never mutates original', () => {
      const nameLens = prop<User>('name')
      const original = { ...user }

      set(nameLens, 'Bob', user)

      expect(user).toEqual(original)
    })

    it('over never mutates original', () => {
      const ageLens = prop<User>('age')
      const original = { ...user }

      over(ageLens, (age) => age + 1, user)

      expect(user).toEqual(original)
    })

    it('nested updates never mutate original', () => {
      const cityLens = path<User, string>('address.city')
      const original = JSON.parse(JSON.stringify(user))

      set(cityLens, 'NYC', user)

      expect(user).toEqual(original)
    })
  })
})
