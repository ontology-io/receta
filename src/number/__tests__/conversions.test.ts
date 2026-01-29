import { describe, it, expect } from 'bun:test'
import { fromString, fromCurrency, toBytes, fromBytes, parseFormattedNumber } from '../index'
import * as R from 'remeda'
import { isOk, isErr, unwrap, unwrapOr } from '../../result'

describe('Number Conversions', () => {
  describe('fromString', () => {
    it('parses valid number strings', () => {
      const result1 = fromString('123')
      expect(isOk(result1)).toBe(true)
      if (isOk(result1)) {
        expect(result1.value).toBe(123)
      }

      const result2 = fromString('123.45')
      expect(isOk(result2)).toBe(true)
      if (isOk(result2)) {
        expect(result2.value).toBe(123.45)
      }
    })

    it('parses negative numbers', () => {
      const result = fromString('-42')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(-42)
      }
    })

    it('parses scientific notation', () => {
      const result = fromString('1.23e4')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(12300)
      }
    })

    it('trims whitespace', () => {
      const result = fromString('  123  ')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(123)
      }
    })

    it('returns error for invalid strings', () => {
      expect(isErr(fromString('abc'))).toBe(true)
      expect(isErr(fromString('12abc'))).toBe(true)
      expect(isErr(fromString(''))).toBe(true)
      expect(isErr(fromString('   '))).toBe(true)
    })

    it('includes input in error', () => {
      const result = fromString('invalid')
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.input).toBe('invalid')
        expect(result.error.code).toBe('PARSE_ERROR')
      }
    })

    describe('real-world: form validation', () => {
      it('validates price input', () => {
        const validatePrice = (input: string) =>
          R.pipe(
            fromString(input),
            (result) => (isOk(result) && result.value > 0 ? result : result)
          )

        const valid = validatePrice('19.99')
        expect(isOk(valid)).toBe(true)

        const invalid = validatePrice('abc')
        expect(isErr(invalid)).toBe(true)
      })
    })
  })

  describe('parseFormattedNumber', () => {
    describe('basic formatted numbers', () => {
      it('parses US format with commas', () => {
        const result = parseFormattedNumber('1,234.56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234.56)
        }
      })

      it('parses numbers with space separators', () => {
        const result = parseFormattedNumber('1 234.56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234.56)
        }
      })

      it('parses European format', () => {
        const result = parseFormattedNumber('1.234,56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBeCloseTo(1234.56)
        }
      })

      it('parses large numbers', () => {
        const result = parseFormattedNumber('1,234,567,890.12')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234567890.12)
        }
      })

      it('parses numbers without separators', () => {
        const result = parseFormattedNumber('1234.56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234.56)
        }
      })
    })

    describe('currency symbols', () => {
      it('parses USD with dollar sign', () => {
        const result = parseFormattedNumber('$1,234.56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234.56)
        }
      })

      it('parses GBP with pound sign', () => {
        const result = parseFormattedNumber('£1,234.56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234.56)
        }
      })

      it('parses EUR with euro sign', () => {
        const result = parseFormattedNumber('€1.234,56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBeCloseTo(1234.56)
        }
      })

      it('parses with currency code suffix', () => {
        const result = parseFormattedNumber('1,234.56 USD')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234.56)
        }
      })

      it('parses with currency code prefix', () => {
        const result = parseFormattedNumber('USD 1,234.56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234.56)
        }
      })
    })

    describe('negative numbers', () => {
      it('parses negative with minus sign', () => {
        const result = parseFormattedNumber('-1,234.56')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(-1234.56)
        }
      })

      it('parses accounting format with parentheses', () => {
        const result = parseFormattedNumber('(1,234.56)')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(-1234.56)
        }
      })

      it('parses accounting format with currency', () => {
        const result = parseFormattedNumber('($1,234.56)')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(-1234.56)
        }
      })
    })

    describe('whitespace handling', () => {
      it('trims leading and trailing whitespace', () => {
        const result = parseFormattedNumber('  1,234.56  ')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(1234.56)
        }
      })
    })

    describe('error cases', () => {
      it('returns error for empty string', () => {
        expect(isErr(parseFormattedNumber(''))).toBe(true)
      })

      it('returns error for invalid characters', () => {
        expect(isErr(parseFormattedNumber('abc'))).toBe(true)
        expect(isErr(parseFormattedNumber('12abc34'))).toBe(true)
      })

      it('includes input in error', () => {
        const result = parseFormattedNumber('invalid')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error.input).toBe('invalid')
          expect(result.error.code).toBe('PARSE_ERROR')
        }
      })
    })

    describe('real-world: parsing user input', () => {
      it('parses various user inputs', () => {
        const inputs = [
          ['$1,234.56', 1234.56],
          ['1234.56', 1234.56],
          ['1,234', 1234],
          ['€1.234,56', 1234.56],
          ['(500)', -500],
        ] as const

        inputs.forEach(([input, expected]) => {
          const result = parseFormattedNumber(input)
          expect(isOk(result)).toBe(true)
          if (isOk(result)) {
            expect(result.value).toBeCloseTo(expected)
          }
        })
      })
    })

    describe('real-world: financial reports', () => {
      it('parses revenue from report', () => {
        const revenues = [
          '$1,234,567.89',
          '€2.345.678,90',
          '£987,654.32',
          '1,000,000.00 USD',
        ]

        revenues.forEach((revenue) => {
          const result = parseFormattedNumber(revenue)
          expect(isOk(result)).toBe(true)
        })
      })

      it('parses negative values (losses)', () => {
        const losses = [
          '($50,000.00)',
          '(€25,000.00)',
          '-100,000',
        ]

        losses.forEach((loss) => {
          const result = parseFormattedNumber(loss)
          expect(isOk(result)).toBe(true)
          if (isOk(result)) {
            expect(result.value).toBeLessThan(0)
          }
        })
      })
    })
  })

  describe('fromCurrency', () => {
    it('parses USD format', () => {
      const result = fromCurrency('$1,234.56')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(1234.56)
      }
    })

    it('parses EUR format', () => {
      const result = fromCurrency('€1.234,56')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBeCloseTo(1234.56)
      }
    })

    it('parses GBP format', () => {
      const result = fromCurrency('£1,234')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(1234)
      }
    })

    it('parses negative amounts', () => {
      const result = fromCurrency('-$50.00')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(-50)
      }
    })

    it('handles various currency symbols', () => {
      expect(isOk(fromCurrency('¥1234'))).toBe(true)
      expect(isOk(fromCurrency('₹1,234'))).toBe(true)
    })

    it('strips whitespace', () => {
      const result = fromCurrency('  $ 1,234.56  ')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(1234.56)
      }
    })

    it('returns error for invalid strings', () => {
      expect(isErr(fromCurrency('invalid'))).toBe(true)
      expect(isErr(fromCurrency(''))).toBe(true)
    })

    describe('real-world: Stripe amount', () => {
      it('parses and converts to cents', () => {
        const parseStripeAmount = (amountStr: string) =>
          R.pipe(
            fromCurrency(amountStr),
            (result) => (isOk(result) ? Math.round(result.value * 100) : 0)
          )

        expect(parseStripeAmount('$19.99')).toBe(1999)
        expect(parseStripeAmount('$100.00')).toBe(10000)
      })
    })
  })

  describe('toBytes', () => {
    describe('data-first', () => {
      it('formats bytes', () => {
        expect(toBytes(0)).toBe('0 B')
        expect(toBytes(100)).toBe('100 B')
        expect(toBytes(999)).toBe('999 B')
      })

      it('formats kilobytes (binary)', () => {
        expect(toBytes(1024)).toBe('1.00 KB')
        expect(toBytes(1536)).toBe('1.50 KB')
      })

      it('formats megabytes', () => {
        expect(toBytes(1048576)).toBe('1.00 MB')
        expect(toBytes(1572864)).toBe('1.50 MB')
      })

      it('formats gigabytes', () => {
        expect(toBytes(1073741824)).toBe('1.00 GB')
      })

      it('formats terabytes', () => {
        expect(toBytes(1099511627776)).toBe('1.00 TB')
      })

      it('formats with custom decimals', () => {
        expect(toBytes(1536, { decimals: 0 })).toBe('2 KB')
        expect(toBytes(1536, { decimals: 1 })).toBe('1.5 KB')
      })

      it('formats with decimal base', () => {
        expect(toBytes(1000, { base: 'decimal' })).toBe('1.00 KB')
        expect(toBytes(1000000, { base: 'decimal' })).toBe('1.00 MB')
      })

      it('handles negative values', () => {
        expect(toBytes(-1024)).toBe('-1.00 KB')
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(1048576, toBytes({ decimals: 1 }))
        expect(result).toBe('1.0 MB')
      })
    })

    describe('real-world: file size display', () => {
      it('displays file sizes appropriately', () => {
        const displayFileSize = (bytes: number) =>
          bytes < 1024 ? `${bytes} B` : toBytes(bytes, { decimals: 1 })

        expect(displayFileSize(500)).toBe('500 B')
        expect(displayFileSize(2048)).toBe('2.0 KB')
        expect(displayFileSize(5242880)).toBe('5.0 MB')
      })
    })
  })

  describe('fromBytes', () => {
    it('parses bytes', () => {
      const result = fromBytes('100 B')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(100)
      }
    })

    it('parses kilobytes (binary)', () => {
      const result = fromBytes('1KB')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(1024)
      }
    })

    it('parses with spaces', () => {
      const result = fromBytes('1.5 MB')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(1572864)
      }
    })

    it('parses gigabytes', () => {
      const result = fromBytes('2GB')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(2147483648)
      }
    })

    it('parses terabytes', () => {
      const result = fromBytes('1TB')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(1099511627776)
      }
    })

    it('is case-insensitive', () => {
      expect(isOk(fromBytes('1kb'))).toBe(true)
      expect(isOk(fromBytes('1Kb'))).toBe(true)
      expect(isOk(fromBytes('1KB'))).toBe(true)
    })

    it('parses with decimal base', () => {
      const result = fromBytes('1KB', 'decimal')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(1000)
      }
    })

    it('handles negative values', () => {
      const result = fromBytes('-1KB')
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(-1024)
      }
    })

    it('returns error for invalid format', () => {
      expect(isErr(fromBytes('invalid'))).toBe(true)
      expect(isErr(fromBytes('1.5'))).toBe(true)
      expect(isErr(fromBytes(''))).toBe(true)
    })

    it('returns error for unknown unit', () => {
      expect(isErr(fromBytes('1ZB'))).toBe(true)
    })

    describe('roundtrip', () => {
      it('converts to bytes and back', () => {
        const original = 1572864
        const formatted = toBytes(original)
        const parsed = fromBytes(formatted)

        expect(isOk(parsed)).toBe(true)
        if (isOk(parsed)) {
          expect(parsed.value).toBe(original)
        }
      })
    })

    describe('real-world: file size validation', () => {
      it('validates file size limits', () => {
        const isUnderLimit = (sizeStr: string, maxStr: string) => {
          const size = fromBytes(sizeStr)
          const max = fromBytes(maxStr)

          if (isOk(size) && isOk(max)) {
            return size.value <= max.value
          }
          return false
        }

        expect(isUnderLimit('5MB', '10MB')).toBe(true)
        expect(isUnderLimit('15MB', '10MB')).toBe(false)
      })
    })
  })
})
