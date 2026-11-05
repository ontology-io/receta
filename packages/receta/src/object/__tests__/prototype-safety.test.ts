import { describe, it, expect, afterEach } from 'bun:test'
import * as R from 'remeda'
import { indexByUnique } from '../../collection/indexByUnique'
import { compact } from '../compact'
import { deepMerge } from '../deepMerge'
import { filterKeys } from '../filterKeys'
import { filterValues } from '../filterValues'
import { rename } from '../rename'
import { stripEmpty } from '../stripEmpty'
import { stripUndefined } from '../stripUndefined'
import { transformKeys } from '../transformKeys'
import { unflatten } from '../unflatten'

const fromJson = (text: string): Record<string, unknown> => JSON.parse(text)
const attack = () => fromJson('{"__proto__": {"isAdmin": true}, "name": "Ada"}')
const isAdmin = (value: unknown) => (value as { isAdmin?: boolean }).isAdmin

afterEach(() => {
  delete (Object.prototype as Record<string, unknown>)['isAdmin']
  delete (Object.prototype.toString as unknown as Record<string, unknown>)['isAdmin']
})

describe('unflatten can not reach shared prototypes', () => {
  it.each([
    ['__proto__', { '__proto__.isAdmin': true }],
    ['constructor.prototype', { 'constructor.prototype.isAdmin': true }],
    ['a nested __proto__', { 'a.__proto__.isAdmin': true }],
    ['a custom separator', { '__proto__/isAdmin': true }],
  ])('ignores a path through %s', (_name, flat) => {
    const options = { separator: Object.keys(flat)[0]?.includes('/') ? '/' : '.' }

    unflatten(fromJson(JSON.stringify(flat)), options)

    expect(isAdmin({})).toBeUndefined()
  })

  it('does not write onto inherited functions', () => {
    unflatten({ 'toString.isAdmin': true })

    expect(isAdmin(Object.prototype.toString)).toBeUndefined()
  })

  it('keeps the safe entries beside an unsafe one', () => {
    expect(unflatten(fromJson('{"__proto__.isAdmin": true, "user.name": "Ada"}'))).toEqual({
      user: { name: 'Ada' },
    })
  })

  it('treats an inherited name as an ordinary key', () => {
    expect(unflatten({ 'toString.x': 1 })).toEqual(fromJson('{"toString": {"x": 1}}'))
  })
})

describe('copying helpers keep __proto__ an ordinary key', () => {
  const always = () => true

  it.each([
    ['compact', () => compact(attack())],
    ['stripEmpty', () => stripEmpty(attack())],
    ['stripUndefined', () => stripUndefined(attack())],
    ['filterKeys', () => filterKeys(attack(), always)],
    ['filterValues', () => filterValues(attack(), always)],
    ['deepMerge', () => deepMerge([{}, attack()])],
    ['deepMerge with an existing key', () => deepMerge([{ name: 'x' }, attack(), attack()])],
    ['rename', () => rename(fromJson('{"evil": {"isAdmin": true}}'), { evil: '__proto__' })],
    ['transformKeys', () => transformKeys(attack(), (key: string) => key)],
  ])('%s does not change the prototype of its result', (_name, run) => {
    const result = run()

    expect(isAdmin(result)).toBeUndefined()
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
  })

  it('indexByUnique keeps an item keyed __proto__', () => {
    const rows = [{ id: '__proto__', isAdmin: true }]
    const index = R.pipe(rows, indexByUnique((row) => row.id))

    expect(index).toMatchObject({ _tag: 'Ok' })
    if (index._tag === 'Ok') {
      expect(isAdmin(index.value)).toBeUndefined()
      expect(Object.getPrototypeOf(index.value)).toBe(Object.prototype)
    }
  })
})
