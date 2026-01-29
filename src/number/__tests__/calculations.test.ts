import { describe, it, expect } from 'bun:test'
import { sum, average, round, roundTo, percentage, ratio } from '../index'
import * as R from 'remeda'
import { isSome, isNone, unwrapOr } from '../../option'

describe('Number Calculations', () => {
  describe('sum', () => {
    it('sums array of numbers', () => {
      expect(sum([1, 2, 3, 4])).toBe(10)
      expect(sum([10, 20, 30])).toBe(60)
    })

    it('returns 0 for empty array', () => {
      expect(sum([])).toBe(0)
    })

    it('handles single element', () => {
      expect(sum([42])).toBe(42)
    })

    it('handles negative numbers', () => {
      expect(sum([-1, 1])).toBe(0)
      expect(sum([-5, -10])).toBe(-15)
    })

    it('handles decimals', () => {
      expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6)
    })

    describe('real-world: shopping cart', () => {
      it('calculates cart total', () => {
        interface CartItem {
          price: number
          quantity: number
        }

        const items: CartItem[] = [
          { price: 10.99, quantity: 2 },
          { price: 5.49, quantity: 1 },
          { price: 3.99, quantity: 3 },
        ]

        const total = sum(items.map((item) => item.price * item.quantity))
        expect(total).toBeCloseTo(39.44)
      })
    })
  })

  describe('average', () => {
    it('calculates average of array', () => {
      const result = average([1, 2, 3, 4])
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(2.5)
      }
    })

    it('returns None for empty array', () => {
      const result = average([])
      expect(isNone(result)).toBe(true)
    })

    it('handles single element', () => {
      const result = average([42])
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('handles decimals', () => {
      const result = average([1.5, 2.5, 3.5])
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBeCloseTo(2.5)
      }
    })

    it('handles negative numbers', () => {
      const result = average([-10, 0, 10])
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(0)
      }
    })

    describe('with Option handling', () => {
      it('provides default with unwrapOr', () => {
        const result = R.pipe(average([]), unwrapOr(0))
        expect(result).toBe(0)
      })
    })

    describe('real-world: rating calculation', () => {
      it('calculates average rating', () => {
        const ratings = [5, 4, 5, 3, 4]
        const avgRating = R.pipe(
          average(ratings),
          unwrapOr(0),
          (r) => r.toFixed(1)
        )
        expect(avgRating).toBe('4.2')
      })
    })
  })

  describe('round', () => {
    describe('data-first', () => {
      it('rounds to nearest integer by default', () => {
        expect(round(1.4, 0)).toBe(1)
        expect(round(1.5, 0)).toBe(2)
        expect(round(1.6, 0)).toBe(2)
      })

      it('rounds to specified decimal places', () => {
        expect(round(1.2345, 2)).toBe(1.23)
        expect(round(1.2367, 2)).toBe(1.24)
        expect(round(1.2345, 3)).toBe(1.235)
      })

      it('rounds to tens/hundreds with negative decimals', () => {
        expect(round(1234, -1)).toBe(1230)
        expect(round(1234, -2)).toBe(1200)
        expect(round(1267, -2)).toBe(1300)
      })

      it('handles negative numbers', () => {
        expect(round(-1.5, 0)).toBe(-1)
        expect(round(-1.6, 0)).toBe(-2)
        expect(round(-1.234, 2)).toBe(-1.23)
      })

      it('handles zero', () => {
        expect(round(0, 0)).toBe(0)
        expect(round(0, 2)).toBe(0)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(1.2345, round(2))
        expect(result).toBe(1.23)
      })

      it('works in map', () => {
        const prices = [1.234, 5.678, 9.999]
        const rounded = R.map(prices, round(2))
        expect(rounded).toEqual([1.23, 5.68, 10])
      })
    })

    describe('real-world: price rounding', () => {
      it('rounds prices to 2 decimals', () => {
        const roundPrice = (price: number) => round(price, 2)
        expect(roundPrice(19.999)).toBe(20)
        expect(roundPrice(19.994)).toBe(19.99)
      })
    })
  })

  describe('roundTo', () => {
    describe('data-first', () => {
      it('rounds to nearest step value', () => {
        expect(roundTo(4.23, 0.25)).toBe(4.25)
        expect(roundTo(4.22, 0.25)).toBe(4.25)
        expect(roundTo(4.10, 0.25)).toBe(4.0)
        expect(roundTo(4.12, 0.25)).toBe(4.0)
        expect(roundTo(4.13, 0.25)).toBe(4.25)
      })

      it('rounds integers to step', () => {
        expect(roundTo(127, 5)).toBe(125)
        expect(roundTo(128, 5)).toBe(130)
        expect(roundTo(122, 5)).toBe(120)
        expect(roundTo(125, 5)).toBe(125)
      })

      it('rounds to decimal step', () => {
        expect(roundTo(1.234, 0.1)).toBeCloseTo(1.2)
        expect(roundTo(1.266, 0.1)).toBeCloseTo(1.3)
        expect(roundTo(1.25, 0.1)).toBeCloseTo(1.3)
      })

      it('handles step of 1', () => {
        expect(roundTo(4.4, 1)).toBe(4)
        expect(roundTo(4.5, 1)).toBe(5)
        expect(roundTo(4.6, 1)).toBe(5)
      })

      it('handles negative numbers', () => {
        expect(roundTo(-4.23, 0.25)).toBe(-4.25)
        expect(roundTo(-4.10, 0.25)).toBe(-4.0)
        expect(roundTo(-127, 5)).toBe(-125)
      })

      it('handles zero', () => {
        expect(roundTo(0, 0.25)).toBe(0)
        expect(roundTo(0, 5)).toBe(0)
      })

      it('throws error for negative or zero step', () => {
        expect(() => roundTo(5, 0)).toThrow('roundTo step must be greater than 0')
        expect(() => roundTo(5, -0.5)).toThrow('roundTo step must be greater than 0')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(4.23, roundTo(0.25))
        expect(result).toBe(4.25)
      })

      it('works in map', () => {
        const prices = [4.23, 4.10, 4.37]
        const rounded = R.map(prices, roundTo(0.25))
        expect(rounded).toEqual([4.25, 4.0, 4.25])
      })
    })

    describe('real-world: price quantization', () => {
      it('rounds prices to nearest quarter', () => {
        const roundToQuarter = (price: number) => roundTo(price, 0.25)
        expect(roundToQuarter(19.99)).toBe(20.0)
        expect(roundToQuarter(19.88)).toBe(20.0)
        expect(roundToQuarter(19.82)).toBe(19.75)
      })

      it('rounds stock prices to nearest cent', () => {
        const roundToCent = (price: number) => roundTo(price, 0.01)
        expect(roundToCent(123.456)).toBeCloseTo(123.46)
        expect(roundToCent(123.454)).toBeCloseTo(123.45)
      })
    })

    describe('real-world: slider step values', () => {
      it('quantizes slider values', () => {
        const sliderValues = [12.3, 17.8, 22.4, 27.9]
        const quantized = R.map(sliderValues, roundTo(5))
        expect(quantized).toEqual([10, 20, 20, 30])
      })
    })
  })

  describe('percentage', () => {
    describe('data-first', () => {
      it('calculates percentage as decimal', () => {
        expect(percentage(25, 100)).toBe(0.25)
        expect(percentage(1, 4)).toBe(0.25)
        expect(percentage(50, 100)).toBe(0.5)
      })

      it('returns 0 for division by zero', () => {
        expect(percentage(10, 0)).toBe(0)
      })

      it('handles values greater than total', () => {
        expect(percentage(150, 100)).toBe(1.5)
      })

      it('handles negative values', () => {
        expect(percentage(-25, 100)).toBe(-0.25)
        expect(percentage(25, -100)).toBe(-0.25)
      })

      it('handles decimals', () => {
        expect(percentage(1.5, 10)).toBeCloseTo(0.15)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(25, percentage(100))
        expect(result).toBe(0.25)
      })
    })

    describe('real-world: progress indicator', () => {
      it('calculates completion percentage', () => {
        const progress = (current: number, total: number) =>
          R.pipe(percentage(current, total), (p) => p * 100, Math.round)

        expect(progress(5, 20)).toBe(25)
        expect(progress(15, 20)).toBe(75)
        expect(progress(20, 20)).toBe(100)
      })
    })
  })

  describe('ratio', () => {
    describe('data-first', () => {
      it('calculates ratio', () => {
        expect(ratio(4, 2)).toBe(2)
        expect(ratio(3, 4)).toBe(0.75)
        expect(ratio(16, 9)).toBeCloseTo(1.778, 2)
      })

      it('returns 0 for division by zero', () => {
        expect(ratio(10, 0)).toBe(0)
      })

      it('handles negative numbers', () => {
        expect(ratio(-4, 2)).toBe(-2)
        expect(ratio(4, -2)).toBe(-2)
      })

      it('handles decimals', () => {
        expect(ratio(1.5, 0.5)).toBeCloseTo(3)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(16, ratio(9))
        expect(result).toBeCloseTo(1.778, 2)
      })
    })

    describe('real-world: aspect ratio', () => {
      it('calculates image aspect ratio', () => {
        const aspectRatio = (width: number, height: number) =>
          R.pipe(ratio(width, height), round(2))

        expect(aspectRatio(1920, 1080)).toBe(1.78) // 16:9
        expect(aspectRatio(1024, 768)).toBe(1.33) // 4:3
      })
    })
  })
})
