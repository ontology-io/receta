# Function: windowSliding()

## Call Signature

> **windowSliding**\<`T`\>(`items`, `config`): readonly readonly `T`[][]

Defined in: [collection/windowSliding/index.ts:59](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/windowSliding/index.ts#L59)

Creates a sliding window over an array with configurable size and step.

A sliding window creates overlapping sub-arrays by moving a fixed-size window
across the array. Useful for moving averages, n-gram analysis, pattern detection,
and time-series analysis.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The array to window over

#### config

[`WindowSlidingConfig`](../../types/interfaces/WindowSlidingConfig.md)

Window size and optional step configuration

### Returns

readonly readonly `T`[][]

Array of windows (sub-arrays)

### Example

```typescript
// Data-first: Simple sliding window (step=1)
windowSliding([1, 2, 3, 4, 5], { size: 3 })
// => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]

// Sliding window with step
windowSliding([1, 2, 3, 4, 5, 6], { size: 3, step: 2 })
// => [[1, 2, 3], [3, 4, 5]]

// Moving average calculation
const prices = [100, 102, 101, 105, 103, 107]
pipe(
  prices,
  windowSliding({ size: 3 }),
  R.map(window => window.reduce((a, b) => a + b, 0) / window.length)
)
// => [101, 102.67, 103, 105]

// N-gram analysis
const words = ['the', 'quick', 'brown', 'fox', 'jumps']
windowSliding(words, { size: 2 })
// => [['the', 'quick'], ['quick', 'brown'], ['brown', 'fox'], ['fox', 'jumps']]

// Pattern detection (3-item sequences)
const sequence = [1, 2, 3, 2, 3, 4, 3, 4, 5]
pipe(
  sequence,
  windowSliding({ size: 3 }),
  R.filter(window => window[0]! < window[1]! && window[1]! < window[2]!)
)
// => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]

// Data-last (in pipe)
pipe(
  [1, 2, 3, 4, 5],
  windowSliding({ size: 3 })
)
// => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
```

### See

 - chunk - for non-overlapping fixed-size batches
 - batchBy - for grouping consecutive items by predicate

## Call Signature

> **windowSliding**\<`T`\>(`config`): (`items`) => readonly readonly `T`[][]

Defined in: [collection/windowSliding/index.ts:63](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/windowSliding/index.ts#L63)

Creates a sliding window over an array with configurable size and step.

A sliding window creates overlapping sub-arrays by moving a fixed-size window
across the array. Useful for moving averages, n-gram analysis, pattern detection,
and time-series analysis.

### Type Parameters

#### T

`T`

### Parameters

#### config

[`WindowSlidingConfig`](../../types/interfaces/WindowSlidingConfig.md)

Window size and optional step configuration

### Returns

Array of windows (sub-arrays)

> (`items`): readonly readonly `T`[][]

#### Parameters

##### items

readonly `T`[]

#### Returns

readonly readonly `T`[][]

### Example

```typescript
// Data-first: Simple sliding window (step=1)
windowSliding([1, 2, 3, 4, 5], { size: 3 })
// => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]

// Sliding window with step
windowSliding([1, 2, 3, 4, 5, 6], { size: 3, step: 2 })
// => [[1, 2, 3], [3, 4, 5]]

// Moving average calculation
const prices = [100, 102, 101, 105, 103, 107]
pipe(
  prices,
  windowSliding({ size: 3 }),
  R.map(window => window.reduce((a, b) => a + b, 0) / window.length)
)
// => [101, 102.67, 103, 105]

// N-gram analysis
const words = ['the', 'quick', 'brown', 'fox', 'jumps']
windowSliding(words, { size: 2 })
// => [['the', 'quick'], ['quick', 'brown'], ['brown', 'fox'], ['fox', 'jumps']]

// Pattern detection (3-item sequences)
const sequence = [1, 2, 3, 2, 3, 4, 3, 4, 5]
pipe(
  sequence,
  windowSliding({ size: 3 }),
  R.filter(window => window[0]! < window[1]! && window[1]! < window[2]!)
)
// => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]

// Data-last (in pipe)
pipe(
  [1, 2, 3, 4, 5],
  windowSliding({ size: 3 })
)
// => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
```

### See

 - chunk - for non-overlapping fixed-size batches
 - batchBy - for grouping consecutive items by predicate
