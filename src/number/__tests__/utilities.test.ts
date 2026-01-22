import { describe, it, expect } from 'bun:test'
import { random, step, interpolate } from '../index'
import * as R from 'remeda'

describe('Number Utilities', () => {
  describe('random', () => {
    it('generates random number between 0 and max', () => {
      const result = random(10)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(10)
    })

    it('generates random number between min and max', () => {
      const result = random(5, 10)
      expect(result).toBeGreaterThanOrEqual(5)
      expect(result).toBeLessThan(10)
    })

    it('generates different values', () => {
      const results = Array.from({ length: 100 }, () => random(100))
      const unique = new Set(results)
      // Should have many unique values (not guaranteed but very likely)
      expect(unique.size).toBeGreaterThan(50)
    })

    it('handles decimal ranges', () => {
      const result = random(0, 1)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(1)
    })

    it('handles negative ranges', () => {
      const result = random(-10, -5)
      expect(result).toBeGreaterThanOrEqual(-10)
      expect(result).toBeLessThan(-5)
    })

    describe('real-world: retry backoff jitter', () => {
      it('adds random jitter to backoff', () => {
        const jitter = () => random(0, 1000)
        const backoffWithJitter = (attempt: number) =>
          Math.pow(2, attempt) * 1000 + jitter()

        const backoff1 = backoffWithJitter(0) // ~1s + jitter
        const backoff2 = backoffWithJitter(1) // ~2s + jitter
        const backoff3 = backoffWithJitter(2) // ~4s + jitter

        expect(backoff1).toBeGreaterThanOrEqual(1000)
        expect(backoff1).toBeLessThan(2000)

        expect(backoff2).toBeGreaterThanOrEqual(2000)
        expect(backoff2).toBeLessThan(3000)

        expect(backoff3).toBeGreaterThanOrEqual(4000)
        expect(backoff3).toBeLessThan(5000)
      })
    })
  })

  describe('step', () => {
    describe('data-first', () => {
      it('rounds to nearest step', () => {
        expect(step(7, 5)).toBe(5)
        expect(step(8, 5)).toBe(10)
        expect(step(12, 5)).toBe(10)
        expect(step(13, 5)).toBe(15)
      })

      it('works with decimal steps', () => {
        expect(step(1.22, 0.25)).toBe(1.25)
        expect(step(1.23, 0.25)).toBe(1.25)
        expect(step(1.38, 0.25)).toBe(1.5)
      })

      it('works with step of 1', () => {
        expect(step(1.4, 1)).toBe(1)
        expect(step(1.5, 1)).toBe(2)
        expect(step(1.6, 1)).toBe(2)
      })

      it('handles negative numbers', () => {
        expect(step(-7, 5)).toBe(-5)
        expect(step(-8, 5)).toBe(-10)
      })

      it('handles zero', () => {
        expect(step(0, 5)).toBe(0)
      })

      it('handles values exactly on step', () => {
        expect(step(10, 5)).toBe(10)
        expect(step(1.5, 0.5)).toBe(1.5)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(7, step(5))
        expect(result).toBe(5)
      })

      it('works in map', () => {
        const values = [3, 7, 12, 18]
        const stepped = R.map(values, step(5))
        expect(stepped).toEqual([5, 5, 10, 20])
      })
    })

    describe('real-world: pricing', () => {
      it('rounds to $5 increments', () => {
        const roundToFiveDollars = (price: number) => step(price, 5)
        expect(roundToFiveDollars(7.99)).toBe(10)
        expect(roundToFiveDollars(12.49)).toBe(10)
        expect(roundToFiveDollars(13)).toBe(15)
      })

      it('rounds to quarter dollars', () => {
        const roundToQuarter = (price: number) => step(price, 0.25)
        expect(roundToQuarter(1.22)).toBe(1.25)
        expect(roundToQuarter(1.37)).toBe(1.25)
        expect(roundToQuarter(1.38)).toBe(1.5)
      })
    })

    describe('real-world: UI slider', () => {
      it('snaps slider to increments', () => {
        const snapSlider = (value: number) => step(value, 10)
        expect(snapSlider(23)).toBe(20)
        expect(snapSlider(27)).toBe(30)
      })
    })
  })

  describe('interpolate', () => {
    describe('data-first', () => {
      it('interpolates at 0% (start)', () => {
        expect(interpolate(0, 100, 0)).toBe(0)
      })

      it('interpolates at 100% (end)', () => {
        expect(interpolate(0, 100, 1)).toBe(100)
      })

      it('interpolates at 50%', () => {
        expect(interpolate(0, 100, 0.5)).toBe(50)
      })

      it('interpolates at 25%', () => {
        expect(interpolate(10, 20, 0.25)).toBe(12.5)
      })

      it('interpolates at 75%', () => {
        expect(interpolate(0, 100, 0.75)).toBe(75)
      })

      it('works with negative ranges', () => {
        expect(interpolate(-10, 10, 0.5)).toBe(0)
        expect(interpolate(-10, 10, 0.25)).toBe(-5)
        expect(interpolate(-10, 10, 0.75)).toBe(5)
      })

      it('works with decimal ranges', () => {
        expect(interpolate(0, 1, 0.5)).toBe(0.5)
        expect(interpolate(0.5, 1.5, 0.5)).toBe(1)
      })

      it('allows progress > 1 (extrapolation)', () => {
        expect(interpolate(0, 100, 1.5)).toBe(150)
        expect(interpolate(0, 100, 2)).toBe(200)
      })

      it('allows progress < 0 (extrapolation)', () => {
        expect(interpolate(0, 100, -0.5)).toBe(-50)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(0.5, interpolate(0, 100))
        expect(result).toBe(50)
      })

      it('works in map', () => {
        const progress = [0, 0.25, 0.5, 0.75, 1]
        const values = R.map(progress, interpolate(0, 100))
        expect(values).toEqual([0, 25, 50, 75, 100])
      })
    })

    describe('real-world: animation', () => {
      it('calculates animation frames', () => {
        const startValue = 0
        const endValue = 100
        const duration = 1000

        // Simulate animation at 25%, 50%, 75%
        expect(interpolate(startValue, endValue, 0.25)).toBe(25)
        expect(interpolate(startValue, endValue, 0.5)).toBe(50)
        expect(interpolate(startValue, endValue, 0.75)).toBe(75)
      })

      it('interpolates color values', () => {
        // Interpolate RGB channel from 0 to 255
        const red = (progress: number) =>
          Math.round(interpolate(0, 255, progress))

        expect(red(0)).toBe(0)
        expect(red(0.5)).toBe(128)
        expect(red(1)).toBe(255)
      })
    })

    describe('real-world: progress bar', () => {
      it('calculates progress bar width', () => {
        const maxWidth = 400
        const calculateWidth = (progress: number) =>
          interpolate(0, maxWidth, progress)

        expect(calculateWidth(0)).toBe(0)
        expect(calculateWidth(0.25)).toBe(100)
        expect(calculateWidth(0.5)).toBe(200)
        expect(calculateWidth(1)).toBe(400)
      })
    })
  })
})
