import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { deepMerge } from '../deepMerge'
import { flatten } from '../flatten'
import { stripEmpty } from '../stripEmpty'
import { unflatten } from '../unflatten'

describe('no-argument data-last forms', () => {
  it('flatten() returns a function for a pipe', () => {
    expect(R.pipe({ user: { name: 'Ada' } }, flatten())).toEqual({ 'user.name': 'Ada' })
  })

  it('unflatten() returns a function for a pipe', () => {
    expect(R.pipe({ 'user.name': 'Ada' }, unflatten())).toEqual({ user: { name: 'Ada' } })
  })

  it('stripEmpty() returns a function for a pipe', () => {
    expect(R.pipe({ name: 'Ada', nick: '' }, stripEmpty())).toEqual({ name: 'Ada' })
  })

  it('deepMerge() returns a function for a pipe', () => {
    const merged = R.pipe([{ a: { x: 1 } }, { a: { y: 2 } }], deepMerge())
    expect(merged).toEqual({ a: { x: 1, y: 2 } })
  })

  it('deepMerge({}) is data-last too, because only an array is data', () => {
    expect(deepMerge({})([{ a: 1 }, { b: 2 }])).toEqual({ a: 1, b: 2 })
  })

  it('treats an empty object as data', () => {
    expect(flatten({})).toEqual({})
    expect(unflatten({})).toEqual({})
    expect(stripEmpty({})).toEqual({})
  })

  it('treats an empty list as data', () => {
    expect(deepMerge([])).toEqual({})
  })

  it('keeps the data-last forms that take options', () => {
    expect(R.pipe({ a: { b: 1 } }, flatten({ separator: '_' }))).toEqual({ a_b: 1 })
    expect(R.pipe({ a_b: 1 }, unflatten({ separator: '_' }))).toEqual({ a: { b: 1 } })
    expect(R.pipe({ a: '' }, stripEmpty({ stripEmptyStrings: false }))).toEqual({ a: '' })
  })
})
