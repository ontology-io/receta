import { describe, it, expect } from 'bun:test'
import {
  format,
  toCurrency,
  toPercent,
  toCompact,
  toPrecision,
  toOrdinal,
} from '../index'
import * as R from 'remeda'

describe('Number Formatting', () => {
  describe('format', () => {
    describe('data-first', () => {
      it('formats with default options', () => {
        expect(format(1234.5678)).toBe('1,234.57')
      })

      it('formats with custom decimals', () => {
        expect(format(1234.5678, { decimals: 0 })).toBe('1,235')
        expect(format(1234.5678, { decimals: 3 })).toBe('1,234.568')
      })

      it('formats without grouping', () => {
        expect(format(1234.5678, { useGrouping: false })).toBe('1234.57')
      })

      it('formats with different locales', () => {
        // Note: Locale formatting may vary by system
        const germanFormat = format(1234.56, { locale: 'de-DE' })
        expect(germanFormat).toMatch(/1[.\s]234,56/)
      })

      it('handles zero', () => {
        expect(format(0)).toBe('0.00')
      })

      it('handles negative numbers', () => {
        expect(format(-1234.56)).toBe('-1,234.56')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(1234.5678, format({ decimals: 2 }))
        expect(result).toBe('1,234.57')
      })
    })
  })

  describe('toCurrency', () => {
    describe('data-first', () => {
      it('formats USD by default', () => {
        const result = toCurrency(1234.56, { currency: 'USD' })
        expect(result).toBe('$1,234.56')
      })

      it('formats different currencies', () => {
        expect(toCurrency(1234.56, { currency: 'EUR', locale: 'en-US' })).toMatch(
          /€1,234.56/
        )
        expect(toCurrency(1234.56, { currency: 'GBP', locale: 'en-US' })).toMatch(
          /£1,234.56/
        )
      })

      it('formats with locale-specific formatting', () => {
        // German locale
        const germanEuro = toCurrency(1234.56, {
          currency: 'EUR',
          locale: 'de-DE',
        })
        expect(germanEuro).toMatch(/1[.\s]234,56/)
      })

      it('handles zero-decimal currencies', () => {
        // JPY typically has no decimal places
        const result = toCurrency(1234, { currency: 'JPY', locale: 'en-US' })
        expect(result).toMatch(/¥1,234/)
      })

      it('formats negative amounts', () => {
        const result = toCurrency(-1234.56, { currency: 'USD' })
        expect(result).toMatch(/-?\$1,234.56/)
      })

      it('supports custom decimals', () => {
        expect(
          toCurrency(1234.5, { currency: 'USD', decimals: 3 })
        ).toBe('$1,234.500')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(1234.56, toCurrency({ currency: 'USD' }))
        expect(result).toBe('$1,234.56')
      })
    })

    describe('real-world: Stripe pricing', () => {
      it('converts cents to dollars', () => {
        const displayPrice = (amountInCents: number) =>
          R.pipe(amountInCents / 100, toCurrency({ currency: 'USD' }))

        expect(displayPrice(99900)).toBe('$999.00')
      })
    })
  })

  describe('toPercent', () => {
    describe('data-first', () => {
      it('formats as percentage with default decimals', () => {
        expect(toPercent(0.25, 0)).toBe('25%')
        expect(toPercent(0.5, 0)).toBe('50%')
        expect(toPercent(1, 0)).toBe('100%')
      })

      it('formats with custom decimals', () => {
        expect(toPercent(0.1234, 2)).toBe('12.34%')
        expect(toPercent(0.333333, 1)).toBe('33.3%')
        expect(toPercent(0.666666, 2)).toBe('66.67%')
      })

      it('handles values over 100%', () => {
        expect(toPercent(1.5, 0)).toBe('150%')
        expect(toPercent(2.25, 1)).toBe('225.0%')
      })

      it('handles negative percentages', () => {
        expect(toPercent(-0.25, 0)).toBe('-25%')
        expect(toPercent(-0.05, 1)).toBe('-5.0%')
      })

      it('handles zero', () => {
        expect(toPercent(0, 0)).toBe('0%')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(0.25, toPercent(1))
        expect(result).toBe('25.0%')
      })
    })
  })

  describe('toCompact', () => {
    describe('data-first', () => {
      it('formats thousands', () => {
        expect(toCompact(1000)).toBe('1K')
        expect(toCompact(1500)).toBe('1.5K')
        expect(toCompact(10000)).toBe('10K')
      })

      it('formats millions', () => {
        expect(toCompact(1000000)).toBe('1M')
        expect(toCompact(1500000)).toBe('1.5M')
      })

      it('formats billions', () => {
        expect(toCompact(1000000000)).toBe('1B')
        expect(toCompact(1500000000)).toBe('1.5B')
      })

      it('formats with custom digits', () => {
        expect(toCompact(1234567, { digits: 2 })).toBe('1.23M')
        expect(toCompact(1567890, { digits: 2 })).toBe('1.57M')
      })

      it('formats with long notation', () => {
        const result = toCompact(1000, { notation: 'long' })
        expect(result).toMatch(/thousand/)
      })

      it('does not compact small numbers', () => {
        expect(toCompact(999)).toBe('999')
        expect(toCompact(100)).toBe('100')
      })

      it('handles negative numbers', () => {
        expect(toCompact(-1000)).toBe('-1K')
        expect(toCompact(-1000000)).toBe('-1M')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(1000000, toCompact({ digits: 1 }))
        expect(result).toBe('1M')
      })
    })

    describe('real-world: social media metrics', () => {
      it('displays follower counts', () => {
        const displayCount = (count: number) =>
          count < 10000 ? count.toString() : toCompact(count)

        expect(displayCount(500)).toBe('500')
        expect(displayCount(15000)).toBe('15K')
        expect(displayCount(1200000)).toBe('1.2M')
      })
    })
  })

  describe('toPrecision', () => {
    describe('data-first', () => {
      it('formats with specified precision', () => {
        expect(toPrecision(123.456, 4)).toBe('123.5')
        expect(toPrecision(123.456, 2)).toBe('1.2e+2')
      })

      it('handles small numbers', () => {
        expect(toPrecision(0.0012345, 3)).toBe('0.00123')
      })

      it('handles large numbers', () => {
        expect(toPrecision(1234567, 3)).toBe('1.23e+6')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(123.456, toPrecision(3))
        expect(result).toBe('123')
      })
    })
  })

  describe('toOrdinal', () => {
    describe('data-first', () => {
      it('formats 1st, 2nd, 3rd', () => {
        expect(toOrdinal(1)).toBe('1st')
        expect(toOrdinal(2)).toBe('2nd')
        expect(toOrdinal(3)).toBe('3rd')
      })

      it('formats 4th and above', () => {
        expect(toOrdinal(4)).toBe('4th')
        expect(toOrdinal(5)).toBe('5th')
        expect(toOrdinal(10)).toBe('10th')
      })

      it('handles teen exceptions', () => {
        expect(toOrdinal(11)).toBe('11th')
        expect(toOrdinal(12)).toBe('12th')
        expect(toOrdinal(13)).toBe('13th')
      })

      it('formats 21st, 22nd, 23rd', () => {
        expect(toOrdinal(21)).toBe('21st')
        expect(toOrdinal(22)).toBe('22nd')
        expect(toOrdinal(23)).toBe('23rd')
      })

      it('formats larger numbers correctly', () => {
        expect(toOrdinal(101)).toBe('101st')
        expect(toOrdinal(111)).toBe('111th')
        expect(toOrdinal(121)).toBe('121st')
      })

      it('handles decimals by flooring', () => {
        expect(toOrdinal(1.9)).toBe('1st')
        expect(toOrdinal(2.1)).toBe('2nd')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(42, toOrdinal)
        expect(result).toBe('42nd')
      })
    })

    describe('real-world: leaderboard', () => {
      it('displays rankings', () => {
        const displayRank = (rank: number, total: number) =>
          `You placed ${toOrdinal(rank)} out of ${total}`

        expect(displayRank(1, 100)).toBe('You placed 1st out of 100')
        expect(displayRank(42, 100)).toBe('You placed 42nd out of 100')
      })
    })
  })
})
