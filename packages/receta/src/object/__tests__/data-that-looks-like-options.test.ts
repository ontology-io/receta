import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { flatten } from '../flatten'
import { stripEmpty } from '../stripEmpty'
import { unflatten } from '../unflatten'

describe('data that shares a key with the options', () => {
  it('flatten keeps data with other keys as data', () => {
    expect(flatten({ separator: '-', nested: { a: 1 } })).toEqual({ separator: '-', 'nested.a': 1 })
  })

  it('flatten keeps data whose value has the wrong type for the option', () => {
    expect(flatten({ maxDepth: { a: 1 } })).toEqual({ 'maxDepth.a': 1 })
  })

  it('stripEmpty keeps data with other keys as data', () => {
    expect(stripEmpty({ deep: '', name: 'Ada' })).toEqual({ name: 'Ada' })
  })

  it('stripEmpty keeps data whose value has the wrong type for the option', () => {
    expect(stripEmpty({ deep: 'water' })).toEqual({ deep: 'water' })
  })

  it('unflatten keeps data with other keys as data', () => {
    expect(unflatten({ separator: '-', count: 1 })).toEqual({ separator: '-', count: 1 })
  })

  it('treats a second argument as proof the first is data', () => {
    expect(flatten({ separator: '-' }, {})).toEqual({ separator: '-' })
    expect(unflatten({ separator: '-' }, {})).toEqual({ separator: '-' })
    expect(stripEmpty({ deep: true }, {})).toEqual({ deep: true })
  })

  it('keeps the data-last forms working', () => {
    expect(R.pipe({ a: { b: 1 } }, flatten({ separator: '_', maxDepth: 5 }))).toEqual({ a_b: 1 })
    expect(R.pipe({ a: '' }, stripEmpty({ deep: false, stripEmptyStrings: false }))).toEqual({ a: '' })
  })
})
