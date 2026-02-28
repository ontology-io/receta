import { describe, it, expect } from 'bun:test'
import { random, step, interpolate, normalize } from '../index'
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

  describe('normalize', () => {
    describe('data-first', () => {
      it('normalizes to 0-1 range', () => {
        expect(normalize(75, 0, 100)).toBe(0.75)
        expect(normalize(50, 0, 100)).toBe(0.5)
        expect(normalize(25, 0, 100)).toBe(0.25)
        expect(normalize(0, 0, 100)).toBe(0)
        expect(normalize(100, 0, 100)).toBe(1)
      })

      it('works with different ranges', () => {
        expect(normalize(5, 0, 10)).toBe(0.5)
        expect(normalize(7.5, 5, 10)).toBe(0.5)
        expect(normalize(15, 10, 20)).toBe(0.5)
      })

      it('works with negative ranges', () => {
        expect(normalize(0, -10, 10)).toBe(0.5)
        expect(normalize(-5, -10, 10)).toBe(0.25)
        expect(normalize(5, -10, 10)).toBe(0.75)
      })

      it('works with decimal values', () => {
        expect(normalize(0.5, 0, 1)).toBe(0.5)
        expect(normalize(0.25, 0, 1)).toBe(0.25)
        expect(normalize(0.75, 0, 1)).toBe(0.75)
      })

      it('handles min value', () => {
        expect(normalize(0, 0, 100)).toBe(0)
        expect(normalize(-10, -10, 10)).toBe(0)
      })

      it('handles max value', () => {
        expect(normalize(100, 0, 100)).toBe(1)
        expect(normalize(10, -10, 10)).toBe(1)
      })

      it('handles values outside range (extrapolation)', () => {
        expect(normalize(150, 0, 100)).toBe(1.5)
        expect(normalize(-50, 0, 100)).toBe(-0.5)
      })

      it('handles min === max edge case', () => {
        expect(normalize(5, 5, 5)).toBe(0)
        expect(normalize(10, 10, 10)).toBe(0)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(75, normalize(0, 100))
        expect(result).toBe(0.75)
      })

      it('works in map', () => {
        const values = [0, 25, 50, 75, 100]
        const normalized = R.map(values, normalize(0, 100))
        expect(normalized).toEqual([0, 0.25, 0.5, 0.75, 1])
      })
    })

    describe('real-world: progress calculation', () => {
      it('calculates progress percentage', () => {
        const progress = (current: number, total: number) =>
          R.pipe(current, normalize(0, total), (n) => n * 100)

        expect(progress(0, 100)).toBe(0)
        expect(progress(25, 100)).toBe(25)
        expect(progress(50, 100)).toBe(50)
        expect(progress(100, 100)).toBe(100)
      })

      it('calculates download progress', () => {
        const bytesDownloaded = 7500000
        const totalBytes = 10000000
        const progressPercent = normalize(bytesDownloaded, 0, totalBytes) * 100
        expect(progressPercent).toBe(75)
      })
    })

    describe('real-world: data visualization', () => {
      it('scales data points for chart', () => {
        const data = [0, 50, 100, 150, 200]
        const min = 0
        const max = 200
        const scaledData = R.map(data, normalize(min, max))
        expect(scaledData).toEqual([0, 0.25, 0.5, 0.75, 1])
      })

      it('normalizes temperature readings', () => {
        const temps = [20, 25, 30, 35, 40]
        const scaled = R.map(temps, normalize(20, 40))
        expect(scaled).toEqual([0, 0.25, 0.5, 0.75, 1])
      })
    })

    describe('real-world: ML feature scaling', () => {
      it('scales features to 0-1', () => {
        const ages = [25, 35, 45, 55]
        const min = Math.min(...ages)
        const max = Math.max(...ages)
        const scaled = R.map(ages, normalize(min, max))
        expect(scaled).toEqual([0, 1 / 3, 2 / 3, 1])
      })
    })

    describe('normalize and interpolate are inverses', () => {
      it('normalize -> interpolate returns original', () => {
        const value = 75
        const min = 0
        const max = 100
        const normalized = normalize(value, min, max)
        const interpolated = interpolate(min, max, normalized)
        expect(interpolated).toBe(value)
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
