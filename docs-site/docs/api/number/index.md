# number

Number module - Number formatting, validation, calculations, and conversions.

Provides practical utilities for working with numbers in real-world applications,
including currency formatting, percentage calculations, byte sizes, and more.

## Example

```typescript
import * as N from 'receta/number'

// Currency formatting
N.toCurrency(1234.56, { currency: 'USD' }) // => "$1,234.56"

// Percentage calculations
pipe(
  N.percentage(25, 100),
  N.toPercent(1)
) // => "25.0%"

// Byte size formatting
N.toBytes(1048576) // => "1.00 MB"

// Safe parsing
N.fromString("123.45") // => Ok(123.45)
```

## References

### average

Re-exports [average](average/functions/average.md)

***

### ByteOptions

Re-exports [ByteOptions](types/interfaces/ByteOptions.md)

***

### ByteUnit

Re-exports [ByteUnit](types/type-aliases/ByteUnit.md)

***

### clamp

Re-exports [clamp](clamp/functions/clamp.md)

***

### CompactOptions

Re-exports [CompactOptions](types/interfaces/CompactOptions.md)

***

### CurrencyOptions

Re-exports [CurrencyOptions](types/interfaces/CurrencyOptions.md)

***

### format

Re-exports [format](format/functions/format.md)

***

### FormatOptions

Re-exports [FormatOptions](types/interfaces/FormatOptions.md)

***

### fromBytes

Re-exports [fromBytes](fromBytes/functions/fromBytes.md)

***

### fromCurrency

Re-exports [fromCurrency](fromCurrency/functions/fromCurrency.md)

***

### fromString

Re-exports [fromString](fromString/functions/fromString.md)

***

### inRange

Re-exports [inRange](inRange/functions/inRange.md)

***

### interpolate

Re-exports [interpolate](interpolate/functions/interpolate.md)

***

### InvalidOperationError

Re-exports [InvalidOperationError](types/interfaces/InvalidOperationError.md)

***

### isFinite

Re-exports [isFinite](isFinite/functions/isFinite.md)

***

### isInteger

Re-exports [isInteger](isInteger/functions/isInteger.md)

***

### isNegative

Re-exports [isNegative](isNegative/functions/isNegative.md)

***

### isPositive

Re-exports [isPositive](isPositive/functions/isPositive.md)

***

### normalize

Re-exports [normalize](normalize/functions/normalize.md)

***

### ParseError

Re-exports [ParseError](types/interfaces/ParseError.md)

***

### parseFormattedNumber

Re-exports [parseFormattedNumber](parseFormattedNumber/functions/parseFormattedNumber.md)

***

### percentage

Re-exports [percentage](percentage/functions/percentage.md)

***

### random

Re-exports [random](random/functions/random.md)

***

### ratio

Re-exports [ratio](ratio/functions/ratio.md)

***

### round

Re-exports [round](round/functions/round.md)

***

### roundTo

Re-exports [roundTo](roundTo/functions/roundTo.md)

***

### step

Re-exports [step](step/functions/step.md)

***

### sum

Re-exports [sum](sum/functions/sum.md)

***

### toBytes

Re-exports [toBytes](toBytes/functions/toBytes.md)

***

### toCompact

Re-exports [toCompact](toCompact/functions/toCompact.md)

***

### toCurrency

Re-exports [toCurrency](toCurrency/functions/toCurrency.md)

***

### toOrdinal

Re-exports [toOrdinal](toOrdinal/functions/toOrdinal.md)

***

### toPercent

Re-exports [toPercent](toPercent/functions/toPercent.md)

***

### toPrecision

Re-exports [toPrecision](toPrecision/functions/toPrecision.md)
