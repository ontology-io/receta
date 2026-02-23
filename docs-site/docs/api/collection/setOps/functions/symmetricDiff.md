# Function: symmetricDiff()

## Call Signature

> **symmetricDiff**\<`T`\>(`items1`, `items2`, `isEqual?`): `T`[]

Defined in: [collection/setOps/index.ts:187](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/setOps/index.ts#L187)

Finds elements that exist in either collection but not both (symmetric difference).

Similar to XOR operation on sets.

### Type Parameters

#### T

`T`

### Parameters

#### items1

readonly `T`[]

First collection

#### items2

readonly `T`[]

Second collection

#### isEqual?

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Custom equality function (defaults to reference equality)

### Returns

`T`[]

Elements that are in either collection, but not both

### Example

```typescript
// Data-first - with primitive values
symmetricDiff([1, 2, 3], [2, 3, 4])
// => [1, 4] // 1 only in first, 4 only in second

// With objects
const planned = [{ id: 1 }, { id: 2 }]
const actual = [{ id: 2 }, { id: 3 }]

symmetricDiff(planned, actual, (a, b) => a.id === b.id)
// => [{ id: 1 }, { id: 3 }] // id 1 not executed, id 3 not planned

// Data-last (in pipe)
pipe(
  planned,
  symmetricDiff(actual, (a, b) => a.id === b.id)
)
```

### See

 - diff - for categorized differences (added/removed/updated)
 - union - for combining collections

## Call Signature

> **symmetricDiff**\<`T`\>(`items2`, `isEqual?`): (`items1`) => `T`[]

Defined in: [collection/setOps/index.ts:192](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/setOps/index.ts#L192)

Finds elements that exist in either collection but not both (symmetric difference).

Similar to XOR operation on sets.

### Type Parameters

#### T

`T`

### Parameters

#### items2

readonly `T`[]

Second collection

#### isEqual?

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Custom equality function (defaults to reference equality)

### Returns

Elements that are in either collection, but not both

> (`items1`): `T`[]

#### Parameters

##### items1

readonly `T`[]

#### Returns

`T`[]

### Example

```typescript
// Data-first - with primitive values
symmetricDiff([1, 2, 3], [2, 3, 4])
// => [1, 4] // 1 only in first, 4 only in second

// With objects
const planned = [{ id: 1 }, { id: 2 }]
const actual = [{ id: 2 }, { id: 3 }]

symmetricDiff(planned, actual, (a, b) => a.id === b.id)
// => [{ id: 1 }, { id: 3 }] // id 1 not executed, id 3 not planned

// Data-last (in pipe)
pipe(
  planned,
  symmetricDiff(actual, (a, b) => a.id === b.id)
)
```

### See

 - diff - for categorized differences (added/removed/updated)
 - union - for combining collections
