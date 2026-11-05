import { describe, it, expect } from 'bun:test'
import { over, path, set, view } from '../index'

type Cart = { items: { n: number; tag?: string }[]; owner: string }

const cart: Cart = { items: [{ n: 1, tag: 'a' }, { n: 2 }], owner: 'Ada' }
const firstCount = path<Cart, number>('items.0.n')

describe('path through arrays', () => {
  it('keeps the array an array', () => {
    const updated = set(firstCount, 9, cart)
    expect(Array.isArray(updated.items)).toBe(true)
    expect(updated).toEqual({ items: [{ n: 9, tag: 'a' }, { n: 2 }], owner: 'Ada' })
  })

  it('replaces an element when the path ends at an index', () => {
    const second = path<Cart, { n: number }>('items.1')
    expect(set(second, { n: 5 }, cart).items).toEqual([{ n: 1, tag: 'a' }, { n: 5 }])
  })

  it('keeps arrays at every level', () => {
    const grid = { rows: [[1, 2], [3, 4]] }
    const cell = path<typeof grid, number>('rows.1.0')
    expect(set(cell, 9, grid)).toEqual({ rows: [[1, 2], [9, 4]] })
  })

  it('keeps an array at the top', () => {
    const rows = [{ n: 1 }, { n: 2 }]
    const updated = set(path<typeof rows, number>('1.n'), 9, rows)
    expect(updated).toEqual([{ n: 1 }, { n: 9 }])
  })

  it('leaves the source alone and shares what did not change', () => {
    const updated = set(firstCount, 9, cart)
    expect(cart.items[0]?.n).toBe(1)
    expect(updated.items).not.toBe(cart.items)
    expect(updated.items[1]).toBe(cart.items[1])
  })

  it('works with over', () => {
    expect(over(firstCount, (n) => n + 1, cart).items[0]?.n).toBe(2)
  })

  it('reads back what it set, past the end too', () => {
    const past = path<Cart, number>('items.4.n')
    expect(view(past, set(past, 7, cart))).toBe(7)
    expect(view(firstCount, set(firstCount, 7, cart))).toBe(7)
  })

  it('still creates objects for missing parents', () => {
    const deep = path<Record<string, unknown>, number>('a.b.c')
    expect(set(deep, 1, {})).toEqual({ a: { b: { c: 1 } } })
  })

  it('keeps the own fields of a class instance', () => {
    class Point {
      constructor(
        readonly x: number,
        readonly y: number,
      ) {}
    }
    expect(set(path<Point, number>('x'), 5, new Point(1, 2))).toEqual({ x: 5, y: 2 } as Point)
  })
})
