import { describe, it, expect, vi } from 'bun:test'
import { poll } from '../poll'

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('poll with a timeout', () => {
  it('stops calling fn once the timeout fires', async () => {
    const fn = vi.fn(async (): Promise<string | null> => null)

    const result = await poll(fn, { interval: 5, maxAttempts: 1000, timeout: 20 })
    expect(result).toEqual({ _tag: 'Err', error: { type: 'timeout', elapsed: 20 } })

    const callsAtTimeout = fn.mock.calls.length
    await pause(40)
    expect(fn.mock.calls.length).toBe(callsAtTimeout)
  })

  it('stops calling onPoll too', async () => {
    const onPoll = vi.fn()

    await poll(async () => null, { interval: 5, maxAttempts: 1000, timeout: 20, onPoll })

    const pollsAtTimeout = onPoll.mock.calls.length
    await pause(40)
    expect(onPoll.mock.calls.length).toBe(pollsAtTimeout)
  })

  it('still returns a value found before the timeout', async () => {
    let calls = 0
    const fn = async () => ((calls += 1), calls === 2 ? 'ready' : null)

    const result = await poll(fn, { interval: 2, timeout: 200 })

    expect(result).toEqual({ _tag: 'Ok', value: 'ready' })
  })
})
