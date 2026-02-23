# Function: endsWith()

> **endsWith**(`suffix`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`string`\>

Defined in: [predicate/comparison/index.ts:227](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L227)

Creates a predicate that tests if a string ends with a suffix.

Case-sensitive.

## Parameters

### suffix

`string`

The suffix to test for

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`string`\>

A predicate that returns true if value ends with suffix

## Example

```typescript
import * as R from 'remeda'

const files = ['app.ts', 'app.js', 'config.json', 'test.spec.ts']
R.filter(files, endsWith('.ts')) // => ['app.ts', 'test.spec.ts']
```

## See

 - startsWith - for prefix testing
 - includes - for substring testing
