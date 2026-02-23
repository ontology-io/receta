# Function: isDefined()

> **isDefined**\<`T`\>(`value`): `value is NonNullable<T>`

Defined in: [predicate/guards/index.ts:227](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L227)

Type guard that checks if a value is not null or undefined.

Narrows out `null` and `undefined` from the type.

## Type Parameters

### T

`T`

## Parameters

### value

`T`

The value to check

## Returns

`value is NonNullable<T>`

True if value is not null or undefined

## Example

```typescript
import * as R from 'remeda'
import { isDefined } from 'receta/predicate'

const values: Array<string | null | undefined> = ['hello', null, 'world', undefined]
const defined = R.filter(values, isDefined) // type: string[]
// => ['hello', 'world']
```

## See

isNullish - for the inverse
