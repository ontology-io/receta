import { describe, it, expect } from 'vitest'
import { tracedPipeAsync } from '../tracedPipeAsync'
import { traced } from '../traced'

describe('tracedPipeAsync', () => {
  it('pipes async functions left-to-right', async () => {
    const { result, trace } = await tracedPipeAsync(
      5,
      async (x: number) => x * 2,
      async (x: number) => x + 1,
    )

    expect(result).toBe(11)
    expect(trace.rootSpan.children).toHaveLength(2)
  })

  it('mixes sync and async functions', async () => {
    const { result } = await tracedPipeAsync(
      'hello',
      (s: string) => s.toUpperCase(),
      async (s: string) => `${s}!`,
    )

    expect(result).toBe('HELLO!')
  })

  it('preserves traced() names', async () => {
    const fetchUser = traced('fetchUser', async (id: string) => ({ id, name: 'Alice' }))
    const getEmail = traced('getEmail', (user: { id: string; name: string }) => `${user.name.toLowerCase()}@example.com`)

    const { result, trace } = await tracedPipeAsync(
      '123',
      fetchUser,
      getEmail,
    )

    expect(result).toBe('alice@example.com')
    expect(trace.rootSpan.children[0]!.name).toBe('fetchUser')
    expect(trace.rootSpan.children[1]!.name).toBe('getEmail')
  })

  it('records inputs and outputs', async () => {
    const { trace } = await tracedPipeAsync(
      10,
      traced('double', async (x: number) => x * 2),
      traced('toString', (x: number) => String(x)),
    )

    const step1 = trace.rootSpan.children[0]!
    expect(step1.input).toBe(10)
    expect(step1.output).toBe(20)

    const step2 = trace.rootSpan.children[1]!
    expect(step2.input).toBe(20)
    expect(step2.output).toBe('20')
  })

  it('handles errors in async pipeline', async () => {
    await expect(
      tracedPipeAsync(
        5,
        async (x: number) => x * 2,
        async () => { throw new Error('async pipe error') },
      ),
    ).rejects.toThrow('async pipe error')
  })

  it('accepts TracerOptions', async () => {
    const { trace } = await tracedPipeAsync(
      5,
      traced('fn1', async (x: number) => x * 2),
      traced('fn2', async (x: number) => x + 1),
      { captureOutputs: false },
    )

    expect(trace.rootSpan.children[0]!.output).toBeUndefined()
    expect(trace.rootSpan.children[1]!.output).toBeUndefined()
  })

  it('auto-names anonymous async functions', async () => {
    const { trace } = await tracedPipeAsync(
      5,
      async (x: number) => x * 2,
      async (x: number) => x + 1,
    )

    expect(trace.rootSpan.children[0]!.name).toBe('step-0')
    expect(trace.rootSpan.children[1]!.name).toBe('step-1')
  })
})
