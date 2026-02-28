import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { paginate, paginateCursor } from '../paginate'

describe('Collection.paginate', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))

  describe('offset-based pagination', () => {
    describe('data-first', () => {
      it('returns first page', () => {
        const result = paginate(items, { page: 1, pageSize: 10 })

        expect(result.items.length).toBe(10)
        expect(result.items[0]?.id).toBe(1)
        expect(result.items[9]?.id).toBe(10)
        expect(result.page).toBe(1)
        expect(result.pageSize).toBe(10)
        expect(result.total).toBe(100)
        expect(result.hasNext).toBe(true)
        expect(result.hasPrevious).toBe(false)
      })

      it('returns middle page', () => {
        const result = paginate(items, { page: 5, pageSize: 10 })

        expect(result.items.length).toBe(10)
        expect(result.items[0]?.id).toBe(41)
        expect(result.items[9]?.id).toBe(50)
        expect(result.hasNext).toBe(true)
        expect(result.hasPrevious).toBe(true)
      })

      it('returns last page', () => {
        const result = paginate(items, { page: 10, pageSize: 10 })

        expect(result.items.length).toBe(10)
        expect(result.items[0]?.id).toBe(91)
        expect(result.items[9]?.id).toBe(100)
        expect(result.hasNext).toBe(false)
        expect(result.hasPrevious).toBe(true)
      })

      it('returns partial last page', () => {
        const result = paginate(items, { page: 11, pageSize: 10 })

        expect(result.items.length).toBe(0)
        expect(result.hasNext).toBe(false)
        expect(result.hasPrevious).toBe(true)
      })

      it('handles page size larger than total', () => {
        const result = paginate(items, { page: 1, pageSize: 200 })

        expect(result.items.length).toBe(100)
        expect(result.hasNext).toBe(false)
        expect(result.hasPrevious).toBe(false)
      })

      it('handles empty array', () => {
        const result = paginate([], { page: 1, pageSize: 10 })

        expect(result.items).toEqual([])
        expect(result.total).toBe(0)
        expect(result.hasNext).toBe(false)
        expect(result.hasPrevious).toBe(false)
      })

      it('handles single item', () => {
        const result = paginate([{ id: 1 }], { page: 1, pageSize: 10 })

        expect(result.items.length).toBe(1)
        expect(result.total).toBe(1)
        expect(result.hasNext).toBe(false)
        expect(result.hasPrevious).toBe(false)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(items, paginate({ page: 2, pageSize: 20 }))

        expect(result.items.length).toBe(20)
        expect(result.items[0]?.id).toBe(21)
        expect(result.page).toBe(2)
      })
    })
  })

  describe('cursor-based pagination', () => {
    describe('data-first', () => {
      it('returns first page without cursor', () => {
        const result = paginateCursor(items, (item) => item.id, { limit: 10 })

        expect(result.items.length).toBe(10)
        expect(result.items[0]?.id).toBe(1)
        expect(result.items[9]?.id).toBe(10)
        expect(result.nextCursor).toBe(10)
        expect(result.hasMore).toBe(true)
      })

      it('continues from cursor', () => {
        const result = paginateCursor(items, (item) => item.id, { cursor: 10, limit: 10 })

        expect(result.items.length).toBe(10)
        expect(result.items[0]?.id).toBe(11) // Starts after cursor
        expect(result.items[9]?.id).toBe(20)
        expect(result.nextCursor).toBe(20)
        expect(result.hasMore).toBe(true)
      })

      it('handles last page', () => {
        const result = paginateCursor(items, (item) => item.id, { cursor: 90, limit: 20 })

        expect(result.items.length).toBe(10) // Only 10 items left
        expect(result.items[0]?.id).toBe(91)
        expect(result.items[9]?.id).toBe(100)
        expect(result.nextCursor).toBeUndefined()
        expect(result.hasMore).toBe(false)
      })

      it('handles invalid cursor', () => {
        const result = paginateCursor(items, (item) => item.id, { cursor: 999, limit: 10 })

        expect(result.items.length).toBe(10)
        expect(result.items[0]?.id).toBe(1) // Falls back to beginning
      })

      it('handles empty array', () => {
        const result = paginateCursor([], (item: { id: number }) => item.id, { limit: 10 })

        expect(result.items).toEqual([])
        expect(result.nextCursor).toBeUndefined()
        expect(result.hasMore).toBe(false)
      })

      it('works with string cursors', () => {
        const messages = [
          { id: 'msg_1', text: 'A' },
          { id: 'msg_2', text: 'B' },
          { id: 'msg_3', text: 'C' },
          { id: 'msg_4', text: 'D' },
        ]

        const result = paginateCursor(messages, (m) => m.id, { cursor: 'msg_1', limit: 2 })

        expect(result.items.length).toBe(2)
        expect(result.items[0]?.id).toBe('msg_2')
        expect(result.items[1]?.id).toBe('msg_3')
        expect(result.nextCursor).toBe('msg_3')
        expect(result.hasMore).toBe(true) // msg_4 is still there
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(
          items,
          paginateCursor((item) => item.id, { limit: 5 })
        )

        expect(result.items.length).toBe(5)
        expect(result.items[0]?.id).toBe(1)
        expect(result.nextCursor).toBe(5)
      })
    })
  })

  describe('real-world scenarios', () => {
    it('simulates API pagination flow', () => {
      // First page
      const page1 = paginate(items, { page: 1, pageSize: 25 })
      expect(page1.items.length).toBe(25)
      expect(page1.hasNext).toBe(true)

      // Next page
      const page2 = paginate(items, { page: 2, pageSize: 25 })
      expect(page2.items.length).toBe(25)
      expect(page2.items[0]?.id).toBe(26)

      // No overlap
      const page1Ids = page1.items.map((i) => i.id)
      const page2Ids = page2.items.map((i) => i.id)
      expect(page1Ids.some((id) => page2Ids.includes(id))).toBe(false)
    })

    it('simulates cursor-based infinite scroll', () => {
      let cursor: number | undefined = undefined
      const pages: number[][] = []

      // Load 3 pages
      for (let i = 0; i < 3; i++) {
        const result = paginateCursor(items, (item) => item.id, { cursor, limit: 10 })
        pages.push(result.items.map((item) => item.id))
        cursor = result.nextCursor
        if (!result.hasMore) break
      }

      expect(pages.length).toBe(3)
      expect(pages[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(pages[1]).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
      expect(pages[2]).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30])
    })
  })
})
