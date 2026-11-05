import { describe, it, expect, afterEach } from 'bun:test'
import * as R from 'remeda'
import { diff } from '../../collection/diff'
import { indexByUnique } from '../../collection/indexByUnique'
import { path, set } from '../../lens'
import { compact } from '../compact'
import { deepMerge } from '../deepMerge'
import { filterKeys } from '../filterKeys'
import { filterValues } from '../filterValues'
import { flatten } from '../flatten'
import { rename } from '../rename'
import { setPath } from '../setPath'
import { stripEmpty } from '../stripEmpty'
import { stripUndefined } from '../stripUndefined'
import { transformKeys } from '../transformKeys'
import { unflatten } from '../unflatten'
import { updatePath } from '../updatePath'

const fromJson = (text: string): Record<string, unknown> => JSON.parse(text)
const fromJsonList = (text: string): Record<string, unknown>[] => JSON.parse(text)
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
  ])('leaves shared prototypes alone for a path through %s', (_name, flat) => {
    const options = { separator: Object.keys(flat)[0]?.includes('/') ? '/' : '.' }

    const result = unflatten(fromJson(JSON.stringify(flat)), options)

    expect(isAdmin({})).toBeUndefined()
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
  })

  it('does not write onto inherited functions', () => {
    unflatten({ 'toString.isAdmin': true })

    expect(isAdmin(Object.prototype.toString)).toBeUndefined()
  })

  it('keeps a __proto__ path as an own key, so nothing is inherited', () => {
    const result = unflatten(fromJson('{"__proto__.isAdmin": true, "user.name": "Ada"}'))

    expect(isAdmin(result)).toBeUndefined()
    expect(Object.keys(result).sort()).toEqual(['__proto__', 'user'])
  })

  it('keeps real data that uses these names', () => {
    expect(unflatten({ 'team.constructor': 'Ferrari' })).toEqual({ team: { constructor: 'Ferrari' } })
    expect(unflatten({ 'stage.prototype': true })).toEqual({ stage: { prototype: true } })
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

describe('keys that only become __proto__ when coerced', () => {
  it('indexByUnique treats an array id as its string', () => {
    const rows = fromJsonList('[{"id": ["__proto__"], "isAdmin": true}]')
    const index = indexByUnique(rows, (row) => row['id'] as string)

    expect(index._tag).toBe('Ok')
    if (index._tag === 'Ok') {
      expect(isAdmin(index.value)).toBeUndefined()
      expect(Object.getPrototypeOf(index.value)).toBe(Object.prototype)
    }
  })

  it('rename treats an array target as its string', () => {
    const mapping = JSON.parse('{"a": ["__proto__"]}')
    const result = rename({ a: { isAdmin: true } }, mapping)

    expect(isAdmin(result)).toBeUndefined()
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
  })
})

describe('rename only reads its own mapping', () => {
  it('keeps the key when the mapping value is empty', () => {
    const aliases: { first?: string; last?: string | undefined } = { first: 'given', last: undefined }

    expect(rename({ first: 'a', last: 'b' }, aliases as Record<string, string>)).toEqual({
      given: 'a',
      last: 'b',
    })
  })

  it('leaves keys that exist on Object.prototype alone', () => {
    expect(Object.keys(rename(fromJson('{"constructor": 1, "toString": 2}'), {}))).toEqual([
      'constructor',
      'toString',
    ])
  })
})

describe('flatten keeps __proto__ an ordinary key', () => {
  it.each([
    ['with a depth limit', () => flatten(attack(), { maxDepth: 0 })],
    ['with an array value', () => flatten(fromJson('{"__proto__": ["x"]}'))],
    ['with an empty object', () => flatten(fromJson('{"__proto__": {}}'))],
    ['with a null value', () => flatten(fromJson('{"__proto__": null}'))],
    ['with a primitive', () => flatten(fromJson('{"__proto__": 1}'))],
  ])('%s', (_name, run) => {
    const result = run()

    expect(isAdmin(result)).toBeUndefined()
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
  })
})

describe('array copies keep their prototype', () => {
  const payload = { isAdmin: true }

  it('setPath', () => {
    const result = setPath(['a', '__proto__'], payload, { a: [1] }) as { a: number[] }

    expect(isAdmin(result.a)).toBeUndefined()
    expect(result.a.map((n) => n)).toEqual([1])
  })

  it('updatePath', () => {
    const result = updatePath(['a', '__proto__'], () => payload, { a: [1] }) as { a: number[] }

    expect(isAdmin(result.a)).toBeUndefined()
  })

  it('lens path', () => {
    const lens = path<{ a: number[] }, unknown>('a.__proto__')
    const result = set(lens, payload, { a: [1] })

    expect(isAdmin(result.a)).toBeUndefined()
    expect(result.a.map((n) => n)).toEqual([1])
  })

  it('setPath still sets real indexes and length', () => {
    expect(setPath(['a', 1], 9, { a: [1, 2] })).toEqual({ a: [1, 9] })
    expect(set(path<{ a: number[] }, number>('a.length'), 1, { a: [1, 2] }).a).toEqual([1])
  })
})

describe('diff compares own keys only', () => {
  const getId = (row: { id: string }) => row.id

  it.each(['__proto__', 'constructor', 'toString'])('treats an id of %s as new', (id) => {
    const changes = diff([], [{ id }], getId)

    expect(changes.added).toEqual([{ id }])
    expect(changes.updated).toEqual([])
  })

  it('matches an existing item with that id', () => {
    const changes = diff([{ id: '__proto__' }], [{ id: '__proto__' }], getId)

    expect(changes.added).toEqual([])
    expect(changes.removed).toEqual([])
  })
})
