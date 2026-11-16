import { describe, it, expect } from 'bun:test'
import { batch } from '../batch'
import { isErr, isOk } from '../../result'

describe('Async.batch', () => {
  const failOn =
    (poison: number, seen: number[][] = []) =>
    async (items: readonly number[]): Promise<number> => {
      seen.push([...items])
      if (items.includes(poison)) {
        throw new Error(`cannot process ${poison}`)
      }
      return items.length
    }

  describe('with a delay between batches', () => {
    it('returns one result per batch, in order', async () => {
      const result = await batch([1, 2, 3, 4, 5], failOn(99), { batchSize: 2, delayBetweenBatches: 1 })

      expect(result).toEqual({ _tag: 'Ok', value: [2, 2, 1] })
    })

    it('reports which batch failed', async () => {
      const result = await batch([1, 2, 3, 4, 5], failOn(3), { batchSize: 2, delayBetweenBatches: 1 })

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('batch_error')
        expect(result.error.batchIndex).toBe(1)
        expect(result.error.itemsInBatch).toBe(2)
      }
    })

    it('reports the real size of a short last batch', async () => {
      const result = await batch([1, 2, 3, 4, 5], failOn(5), { batchSize: 2, delayBetweenBatches: 1 })

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.batchIndex).toBe(2)
        expect(result.error.itemsInBatch).toBe(1)
      }
    })

    it('keeps the thrown error as the underlying error', async () => {
      const result = await batch([1, 2, 3], failOn(1), { batchSize: 2, delayBetweenBatches: 1 })

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.underlyingError).toBeInstanceOf(Error)
        expect((result.error.underlyingError as Error).message).toBe('cannot process 1')
      }
    })

    it('does not start the batches after the one that failed', async () => {
      const seen: number[][] = []
      await batch([1, 2, 3, 4, 5, 6], failOn(3, seen), { batchSize: 2, delayBetweenBatches: 1 })

      expect(seen).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it('waits between batches but not after the last one', async () => {
      const startedAt: number[] = []
      const started = Date.now()

      const result = await batch(
        [1, 2, 3],
        async (items) => {
          startedAt.push(Date.now() - started)
          return items.length
        },
        { batchSize: 1, delayBetweenBatches: 30 }
      )
      const total = Date.now() - started

      expect(isOk(result)).toBe(true)
      expect(startedAt[1]!).toBeGreaterThanOrEqual(25)
      expect(startedAt[2]!).toBeGreaterThanOrEqual(55)
      expect(total).toBeLessThan(85)
    })
  })

  describe('without a delay', () => {
    it('reports which batch failed', async () => {
      const result = await batch([1, 2, 3, 4, 5], failOn(5), { batchSize: 2 })

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.batchIndex).toBe(2)
        expect(result.error.itemsInBatch).toBe(1)
        expect(result.error.underlyingError).toMatchObject({ type: 'map_async_error', index: 2 })
      }
    })
  })
})
