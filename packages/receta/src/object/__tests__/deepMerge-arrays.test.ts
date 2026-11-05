import { describe, it, expect } from 'bun:test'
import { deepMerge } from '../deepMerge'

const byIndex = { arrayStrategy: 'merge' } as const

describe("deepMerge with arrayStrategy 'merge'", () => {
  it('takes the source value for primitives', () => {
    expect(deepMerge([{ tags: ['a', 'b'] }, { tags: ['c', 'd'] }], byIndex)).toEqual({
      tags: ['c', 'd'],
    })
  })

  it('takes the source value for numbers and booleans', () => {
    expect(deepMerge([{ n: [1, true] }, { n: [2, false] }], byIndex)).toEqual({ n: [2, false] })
  })

  it('merges objects at the same index', () => {
    expect(deepMerge([{ rows: [{ a: 1 }] }, { rows: [{ b: 2 }] }], byIndex)).toEqual({
      rows: [{ a: 1, b: 2 }],
    })
  })

  it('takes the source when the kinds differ', () => {
    expect(deepMerge([{ rows: [{ a: 1 }, 'x'] }, { rows: ['y', { b: 2 }] }], byIndex)).toEqual({
      rows: ['y', { b: 2 }],
    })
  })

  it('merges nested arrays by index as well', () => {
    expect(deepMerge([{ grid: [[1, 2]] }, { grid: [[3]] }], byIndex)).toEqual({ grid: [[3]] })
  })

  it('stays as long as the source array', () => {
    expect(deepMerge([{ tags: ['a', 'b', 'c'] }, { tags: ['z'] }], byIndex)).toEqual({ tags: ['z'] })
    expect(deepMerge([{ tags: ['a'] }, { tags: ['x', 'y'] }], byIndex)).toEqual({ tags: ['x', 'y'] })
  })
})
