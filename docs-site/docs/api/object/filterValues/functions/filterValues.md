# Function: filterValues()

## Call Signature

> **filterValues**\<`T`\>(`obj`, `predicate`): `Partial`\<`T`\>

Defined in: [object/filterValues/index.ts:50](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/filterValues/index.ts#L50)

Filters an object by keeping only entries whose values match a predicate.

Creates a new object containing only entries whose values satisfy the predicate.
Useful for removing empty values, filtering by type, or keeping only specific
value ranges.

### Type Parameters

#### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

### Parameters

#### obj

`T`

The object to filter

#### predicate

(`value`, `key`) => `boolean`

Function that tests each value (receives value and key)

### Returns

`Partial`\<`T`\>

A new object with filtered entries

### Example

```typescript
// Data-first
const scores = { alice: 85, bob: 60, charlie: 92, diana: 55 }
filterValues(scores, (score) => score >= 70)
// => { alice: 85, charlie: 92 }

// Remove empty strings
filterValues({ a: 'hello', b: '', c: 'world' }, (v) => v !== '')
// => { a: 'hello', c: 'world' }

// Type filtering
const mixed = { a: 1, b: 'two', c: 3, d: 'four' }
filterValues(mixed, (v) => typeof v === 'number')
// => { a: 1, c: 3 }

// With key and value
filterValues(obj, (value, key) => value > threshold[key])

// Data-last (in pipe)
pipe(
  data,
  filterValues((v) => v != null)
)
```

### See

 - filterKeys - for filtering by keys instead of values
 - compact - for removing nullish values specifically

## Call Signature

> **filterValues**(`predicate`): \<`T`\>(`obj`) => `Partial`\<`T`\>

Defined in: [object/filterValues/index.ts:54](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/filterValues/index.ts#L54)

Filters an object by keeping only entries whose values match a predicate.

Creates a new object containing only entries whose values satisfy the predicate.
Useful for removing empty values, filtering by type, or keeping only specific
value ranges.

### Parameters

#### predicate

(`value`, `key`) => `boolean`

Function that tests each value (receives value and key)

### Returns

A new object with filtered entries

> \<`T`\>(`obj`): `Partial`\<`T`\>

#### Type Parameters

##### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### obj

`T`

#### Returns

`Partial`\<`T`\>

### Example

```typescript
// Data-first
const scores = { alice: 85, bob: 60, charlie: 92, diana: 55 }
filterValues(scores, (score) => score >= 70)
// => { alice: 85, charlie: 92 }

// Remove empty strings
filterValues({ a: 'hello', b: '', c: 'world' }, (v) => v !== '')
// => { a: 'hello', c: 'world' }

// Type filtering
const mixed = { a: 1, b: 'two', c: 3, d: 'four' }
filterValues(mixed, (v) => typeof v === 'number')
// => { a: 1, c: 3 }

// With key and value
filterValues(obj, (value, key) => value > threshold[key])

// Data-last (in pipe)
pipe(
  data,
  filterValues((v) => v != null)
)
```

### See

 - filterKeys - for filtering by keys instead of values
 - compact - for removing nullish values specifically
