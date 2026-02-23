# Function: mapValues()

## Call Signature

> **mapValues**\<`T`, `U`\>(`obj`, `fn`): `Record`\<keyof `T`, `U`\>

Defined in: [object/mapValues/index.ts:45](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/mapValues/index.ts#L45)

Transforms all values in an object using a mapping function.

Creates a new object with all values transformed by the provided function.
This is a re-export of Remeda's mapValues for consistency and to enable
integration with Result/Option patterns.

### Type Parameters

#### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### U

`U`

### Parameters

#### obj

`T`

The object whose values to transform

#### fn

(`value`, `key`) => `U`

Function that transforms each value (receives value and key)

### Returns

`Record`\<keyof `T`, `U`\>

A new object with transformed values

### Example

```typescript
// Data-first
const prices = { apple: 1.5, banana: 0.5, orange: 2.0 }
mapValues(prices, (price) => price * 1.1) // 10% increase
// => { apple: 1.65, banana: 0.55, orange: 2.2 }

// Type conversion
mapValues({ a: 1, b: 2, c: 3 }, (n) => String(n))
// => { a: '1', b: '2', c: '3' }

// With key and value
mapValues(obj, (value, key) => `${key}: ${value}`)

// Data-last (in pipe)
pipe(
  config,
  mapValues((v) => normalizeValue(v))
)
```

### See

 - mapKeys - for transforming keys instead of values
 - Remeda.mapValues - original implementation

## Call Signature

> **mapValues**\<`U`\>(`fn`): \<`T`\>(`obj`) => `Record`\<keyof `T`, `U`\>

Defined in: [object/mapValues/index.ts:49](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/mapValues/index.ts#L49)

Transforms all values in an object using a mapping function.

Creates a new object with all values transformed by the provided function.
This is a re-export of Remeda's mapValues for consistency and to enable
integration with Result/Option patterns.

### Type Parameters

#### U

`U`

### Parameters

#### fn

(`value`, `key`) => `U`

Function that transforms each value (receives value and key)

### Returns

A new object with transformed values

> \<`T`\>(`obj`): `Record`\<keyof `T`, `U`\>

#### Type Parameters

##### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### obj

`T`

#### Returns

`Record`\<keyof `T`, `U`\>

### Example

```typescript
// Data-first
const prices = { apple: 1.5, banana: 0.5, orange: 2.0 }
mapValues(prices, (price) => price * 1.1) // 10% increase
// => { apple: 1.65, banana: 0.55, orange: 2.2 }

// Type conversion
mapValues({ a: 1, b: 2, c: 3 }, (n) => String(n))
// => { a: '1', b: '2', c: '3' }

// With key and value
mapValues(obj, (value, key) => `${key}: ${value}`)

// Data-last (in pipe)
pipe(
  config,
  mapValues((v) => normalizeValue(v))
)
```

### See

 - mapKeys - for transforming keys instead of values
 - Remeda.mapValues - original implementation
