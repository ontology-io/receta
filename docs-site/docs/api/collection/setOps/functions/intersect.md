# Function: intersect()

## Call Signature

> **intersect**\<`T`\>(`items1`, `items2`, `isEqual?`): `T`[]

Defined in: [collection/setOps/index.ts:112](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/setOps/index.ts#L112)

Finds elements that exist in both collections using a custom comparator.

Similar to Set intersection but works with objects and custom equality.

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

Elements present in both collections

### Example

```typescript
// Data-first - with primitive values
intersect([1, 2, 3], [2, 3, 4])
// => [2, 3]

// With objects and custom comparator
const assigned = [{ taskId: 1 }, { taskId: 2 }]
const completed = [{ taskId: 2 }, { taskId: 3 }]

intersect(assigned, completed, (a, b) => a.taskId === b.taskId)
// => [{ taskId: 2 }] // tasks that are both assigned and completed

// Data-last (in pipe)
pipe(
  assigned,
  intersect(completed, (a, b) => a.taskId === b.taskId)
)
```

### See

 - union - for merging collections
 - diff - for finding all types of differences

## Call Signature

> **intersect**\<`T`\>(`items2`, `isEqual?`): (`items1`) => `T`[]

Defined in: [collection/setOps/index.ts:117](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/setOps/index.ts#L117)

Finds elements that exist in both collections using a custom comparator.

Similar to Set intersection but works with objects and custom equality.

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

Elements present in both collections

> (`items1`): `T`[]

#### Parameters

##### items1

readonly `T`[]

#### Returns

`T`[]

### Example

```typescript
// Data-first - with primitive values
intersect([1, 2, 3], [2, 3, 4])
// => [2, 3]

// With objects and custom comparator
const assigned = [{ taskId: 1 }, { taskId: 2 }]
const completed = [{ taskId: 2 }, { taskId: 3 }]

intersect(assigned, completed, (a, b) => a.taskId === b.taskId)
// => [{ taskId: 2 }] // tasks that are both assigned and completed

// Data-last (in pipe)
pipe(
  assigned,
  intersect(completed, (a, b) => a.taskId === b.taskId)
)
```

### See

 - union - for merging collections
 - diff - for finding all types of differences
