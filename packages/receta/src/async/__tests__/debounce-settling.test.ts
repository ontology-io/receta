import { describe, it, expect, vi } from 'bun:test'
import { debounce } from '../debounce'

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('debounce settles every call', () => {
  it('gives replaced calls the result of the run that replaced them', async () => {
    const fn = vi.fn(async (value: number) => value * 2)
    const debounced = debounce(fn, { delay: 5 })

    const results = await Promise.all([debounced(1), debounced(2), debounced(3)])

    expect(results).toEqual([6, 6, 6])
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('rejects replaced calls when that run fails', async () => {
    const fails = async (_value: number): Promise<number> => {
      throw new Error('run failed')
    }
    const debounced = debounce(fails, { delay: 5 })

    const outcomes = await Promise.allSettled([debounced(1), debounced(2)])

    expect(outcomes.map((outcome) => outcome.status)).toEqual(['rejected', 'rejected'])
  })

  it('hands replaced calls one shared promise, so handling any of them handles all', async () => {
    const debounced = debounce(async (value: number) => value, { delay: 5 })

    const first = debounced(1)
    const second = debounced(2)

    expect(first).toBe(second)
    expect(await second).toBe(2)
  })

  it('starts a new promise after a run', async () => {
    const debounced = debounce(async (value: number) => value, { delay: 5 })

    const first = debounced(1)
    await first

    expect(debounced(2)).not.toBe(first)
  })

  it('rejects when fn throws synchronously on the trailing edge', async () => {
    const throwsSynchronously = (): Promise<number> => {
      throw new Error('sync failure')
    }

    await expect(debounce(throwsSynchronously, { delay: 5 })()).rejects.toThrow('sync failure')
  })

  it('gives calls inside the window the leading result when there is no trailing run', async () => {
    const fn = vi.fn(async (value: number) => value * 2)
    const debounced = debounce(fn, { delay: 50, leading: true, trailing: false })

    expect(await Promise.all([debounced(1), debounced(2)])).toEqual([2, 2])
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('settles every call after a leading run with the trailing run', async () => {
    const fn = vi.fn(async (value: number) => value)
    const debounced = debounce(fn, { delay: 100, leading: true, trailing: true })

    const leading = debounced(1)
    await pause(5)
    const waiting = debounced(2)
    await pause(5)
    const trailing = debounced(3)

    expect(await Promise.all([leading, waiting, trailing])).toEqual([1, 3, 3])
  })

  it('starts a fresh window after each run', async () => {
    const fn = vi.fn(async (value: number) => value)
    const debounced = debounce(fn, { delay: 5 })

    expect(await debounced(1)).toBe(1)
    expect(await debounced(2)).toBe(2)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('rejects rather than hangs when nothing can ever run', async () => {
    const debounced = debounce(async () => 1, { delay: 5, leading: false, trailing: false })

    await expect(debounced()).rejects.toThrow('leading and trailing are both false')
  })
})
