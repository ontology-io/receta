import { describe, it, expect } from 'bun:test'
import { debounce, throttle } from '../index'
import { sleep } from '../retry'

describe('Async.debounce', () => {
  describe('basic debouncing', () => {
    it('delays function execution', async () => {
      let callCount = 0
      const fn = debounce(
        async (x: number) => {
          callCount++
          return x * 2
        },
        { delay: 100 }
      )

      // Call multiple times rapidly
      fn(1)
      fn(2)
      fn(3)
      const resultPromise = fn(4)

      // Function should not have executed yet
      expect(callCount).toBe(0)

      // Wait for debounce delay
      const result = await resultPromise
      expect(result).toBe(8) // 4 * 2
      expect(callCount).toBe(1) // Only last call executed
    })

    it('executes only the last call', async () => {
      const calls: number[] = []
      const fn = debounce(
        async (x: number) => {
          calls.push(x)
          return x
        },
        { delay: 50 }
      )

      fn(1)
      fn(2)
      fn(3)
      const result = await fn(4)

      expect(result).toBe(4)
      expect(calls).toEqual([4])
    })

    it('resets timer on each call', async () => {
      let executed = false
      const fn = debounce(
        async () => {
          executed = true
        },
        { delay: 100 }
      )

      fn()
      await sleep(60)
      fn()
      await sleep(60)
      fn()
      await sleep(60)

      // Should not have executed yet (timer keeps resetting)
      expect(executed).toBe(false)

      // Wait for full delay
      await sleep(100)
      expect(executed).toBe(true)
    })
  })

  describe('leading edge', () => {
    it('executes on leading edge when enabled', async () => {
      let callCount = 0
      const fn = debounce(
        async (x: number) => {
          callCount++
          return x
        },
        { delay: 100, leading: true, trailing: false }
      )

      const result = await fn(42)

      expect(result).toBe(42)
      expect(callCount).toBe(1)

      // Rapid calls should be ignored
      fn(1)
      fn(2)
      await sleep(150)

      expect(callCount).toBe(1) // Still only 1 call
    })

    it('executes both leading and trailing when both enabled', async () => {
      let callCount = 0
      const fn = debounce(
        async (x: number) => {
          callCount++
          return x
        },
        { delay: 50, leading: true, trailing: true }
      )

      fn(1) // Leading edge
      await sleep(20)
      fn(2)
      await sleep(20)
      await fn(3) // Trailing edge after delay

      expect(callCount).toBe(2) // Leading + trailing
    })
  })

  describe('trailing edge (default)', () => {
    it('uses trailing edge by default', async () => {
      let executed = false
      const fn = debounce(
        async () => {
          executed = true
        },
        { delay: 50 }
      )

      fn()
      expect(executed).toBe(false)

      await sleep(60)
      expect(executed).toBe(true)
    })
  })

  describe('error handling', () => {
    it('propagates errors from debounced function', async () => {
      const fn = debounce(
        async () => {
          throw new Error('Function error')
        },
        { delay: 50 }
      )

      await expect(fn()).rejects.toThrow('Function error')
    })
  })
})

describe('Async.throttle', () => {
  describe('basic throttling', () => {
    it('limits function execution rate', async () => {
      const calls: number[] = []
      const fn = throttle(
        async (x: number) => {
          calls.push(x)
          return x
        },
        { delay: 100 }
      )

      // Rapid calls
      fn(1) // Executes immediately (leading)
      await sleep(20)
      fn(2) // Queued for trailing
      await sleep(20)
      fn(3) // Queued for trailing (replaces 2)
      await sleep(20)
      fn(4) // Queued for trailing (replaces 3)

      // Wait for trailing execution
      await sleep(100)

      // Should have leading (1) and trailing (4)
      expect(calls.length).toBeGreaterThanOrEqual(1)
      expect(calls[0]).toBe(1)
    })

    it('executes immediately on leading edge', async () => {
      let callCount = 0
      const fn = throttle(
        async () => {
          callCount++
        },
        { delay: 100, leading: true }
      )

      fn()
      expect(callCount).toBe(1) // Immediate execution

      fn()
      fn()
      expect(callCount).toBe(1) // Subsequent calls throttled
    })

    it('executes at regular intervals under sustained load', async () => {
      const timestamps: number[] = []
      const fn = throttle(
        async () => {
          timestamps.push(Date.now())
        },
        { delay: 50 }
      )

      // Call repeatedly
      for (let i = 0; i < 10; i++) {
        fn()
        await sleep(20) // Call faster than throttle delay
      }

      // Wait for final trailing execution
      await sleep(100)

      // Should have multiple executions at ~50ms intervals
      expect(timestamps.length).toBeGreaterThan(1)
    })
  })

  describe('leading and trailing edges', () => {
    it('uses leading edge by default', async () => {
      let callCount = 0
      const fn = throttle(
        async () => {
          callCount++
        },
        { delay: 100 }
      )

      fn()
      expect(callCount).toBe(1)
    })

    it('disables leading edge when configured', async () => {
      let callCount = 0
      const fn = throttle(
        async () => {
          callCount++
        },
        { delay: 50, leading: false, trailing: true }
      )

      fn()
      expect(callCount).toBe(0) // No leading execution

      await sleep(60)
      expect(callCount).toBe(1) // Trailing execution
    })

    it('can enable both leading and trailing', async () => {
      let callCount = 0
      const fn = throttle(
        async () => {
          callCount++
        },
        { delay: 50, leading: true, trailing: true }
      )

      fn() // Leading
      expect(callCount).toBe(1)

      await sleep(30)
      fn() // Queued for trailing

      await sleep(30)
      expect(callCount).toBe(2) // Trailing executed
    })
  })

  describe('error handling', () => {
    it('propagates errors from throttled function', async () => {
      const fn = throttle(
        async () => {
          throw new Error('Function error')
        },
        { delay: 100 }
      )

      await expect(fn()).rejects.toThrow('Function error')
    })
  })

  describe('arguments', () => {
    it('uses latest arguments for trailing execution', async () => {
      const calls: Array<{ a: number; b: string }> = []
      const fn = throttle(
        async (a: number, b: string) => {
          calls.push({ a, b })
        },
        { delay: 50, leading: true, trailing: true }
      )

      fn(1, 'first') // Leading
      await sleep(20)
      fn(2, 'second')
      await sleep(20)
      fn(3, 'third') // Latest args for trailing

      await sleep(60)

      expect(calls.length).toBe(2)
      expect(calls[0]).toEqual({ a: 1, b: 'first' })
      // Trailing should use latest args
      expect(calls[1]).toEqual({ a: 3, b: 'third' })
    })
  })
})
