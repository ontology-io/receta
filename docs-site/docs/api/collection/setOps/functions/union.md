# Function: union()

## Call Signature

> **union**\<`T`\>(`items1`, `items2`, `isEqual?`): `T`[]

Defined in: [collection/setOps/index.ts:37](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/setOps/index.ts#L37)

Merges two collections, removing duplicates using a custom comparator.

Similar to Set union operation but works with objects and custom equality.

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

Union of both collections without duplicates

### Example

```typescript
// Data-first - with primitive values
union([1, 2, 3], [3, 4, 5])
// => [1, 2, 3, 4, 5]

// With objects and custom comparator
const users1 = [{ id: 1, name: 'Alice' }]
const users2 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

union(users1, users2, (a, b) => a.id === b.id)
// => [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

// Data-last (in pipe)
pipe(
  users1,
  union(users2, (a, b) => a.id === b.id)
)
```

### See

 - intersect - for finding common elements
 - symmetricDiff - for finding differences

## Call Signature

> **union**\<`T`\>(`items2`, `isEqual?`): (`items1`) => `T`[]

Defined in: [collection/setOps/index.ts:42](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/setOps/index.ts#L42)

Merges two collections, removing duplicates using a custom comparator.

Similar to Set union operation but works with objects and custom equality.

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

Union of both collections without duplicates

> (`items1`): `T`[]

#### Parameters

##### items1

readonly `T`[]

#### Returns

`T`[]

### Example

```typescript
// Data-first - with primitive values
union([1, 2, 3], [3, 4, 5])
// => [1, 2, 3, 4, 5]

// With objects and custom comparator
const users1 = [{ id: 1, name: 'Alice' }]
const users2 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

union(users1, users2, (a, b) => a.id === b.id)
// => [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

// Data-last (in pipe)
pipe(
  users1,
  union(users2, (a, b) => a.id === b.id)
)
```

### See

 - intersect - for finding common elements
 - symmetricDiff - for finding differences
