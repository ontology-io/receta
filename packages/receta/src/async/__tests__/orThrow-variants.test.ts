import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { filterAsyncOrThrow, mapAsyncOrThrow } from '../index'

const failOn = (bad: number) => async (value: number) => {
  if (value === bad) throw new Error(`bad ${value}`)
  return value * 2
}

describe('mapAsyncOrThrow', () => {
  it('returns the values data-first', async () => {
    expect(await mapAsyncOrThrow([1, 2], failOn(9))).toEqual([2, 4])
  })

  it('returns the values data-last', async () => {
    expect(await mapAsyncOrThrow(failOn(9))([1, 2])).toEqual([2, 4])
  })

  it('works in a pipe with options', async () => {
    const doubled = await R.pipe([1, 2, 3], mapAsyncOrThrow(failOn(9), { concurrency: 1 }))
    expect(doubled).toEqual([2, 4, 6])
  })

  it('rejects with the MapAsyncError both ways', async () => {
    const expected = { type: 'map_async_error', error: new Error('bad 2') }
    await expect(mapAsyncOrThrow([1, 2], failOn(2))).rejects.toMatchObject(expected)
    await expect(mapAsyncOrThrow(failOn(2))([1, 2])).rejects.toMatchObject(expected)
  })
})

describe('filterAsyncOrThrow', () => {
  const isEven = async (value: number) => value % 2 === 0
  const broken = async (): Promise<boolean> => {
    throw new Error('broken')
  }

  it('returns the kept items data-first', async () => {
    expect(await filterAsyncOrThrow([1, 2, 3, 4], isEven)).toEqual([2, 4])
  })

  it('returns the kept items data-last', async () => {
    expect(await filterAsyncOrThrow(isEven)([1, 2, 3, 4])).toEqual([2, 4])
  })

  it('rejects with the FilterAsyncError both ways', async () => {
    const expected = { type: 'filter_async_error' }
    await expect(filterAsyncOrThrow([1], broken)).rejects.toMatchObject(expected)
    await expect(filterAsyncOrThrow(broken)([1])).rejects.toMatchObject(expected)
  })
})
