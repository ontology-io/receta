import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { union } from '../setOps'

describe('union removes duplicates from both lists', () => {
  it('removes them from the first list', () => {
    expect(union([1, 1, 2], [2, 3])).toEqual([1, 2, 3])
  })

  it('removes them from the second list', () => {
    expect(union([1], [2, 2, 3])).toEqual([1, 2, 3])
  })

  it('uses the comparator and keeps the first occurrence', () => {
    const rows = [
      { id: 1, from: 'a' },
      { id: 1, from: 'b' },
    ]
    const sameId = (left: { id: number }, right: { id: number }) => left.id === right.id

    expect(union(rows, [{ id: 1, from: 'c' }], sameId)).toEqual([{ id: 1, from: 'a' }])
  })

  it('works data-last', () => {
    expect(R.pipe([1, 1], union([2]))).toEqual([1, 2])
  })
})
