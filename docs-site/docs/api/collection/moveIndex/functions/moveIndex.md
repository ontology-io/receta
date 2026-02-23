# Function: moveIndex()

## Call Signature

> **moveIndex**\<`T`\>(`items`, `fromIndex`, `toIndex`): readonly `T`[]

Defined in: [collection/moveIndex/index.ts:66](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/moveIndex/index.ts#L66)

Moves an element from one index to another (immutably).

Creates a new array with the element at `fromIndex` moved to `toIndex`,
shifting other elements as needed. Useful for drag-and-drop reordering,
priority adjustments, or any scenario requiring index-based repositioning.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The array to modify

#### fromIndex

`number`

Index of element to move

#### toIndex

`number`

Destination index

### Returns

readonly `T`[]

New array with element moved

### Example

```typescript
// Data-first: Move element forward
moveIndex(['a', 'b', 'c', 'd', 'e'], 1, 3)
// => ['a', 'c', 'd', 'b', 'e']

// Move element backward
moveIndex(['a', 'b', 'c', 'd', 'e'], 3, 1)
// => ['a', 'd', 'b', 'c', 'e']

// Drag-and-drop reordering
interface Task {
  id: number
  title: string
  priority: number
}

const tasks: Task[] = [
  { id: 1, title: 'Task 1', priority: 1 },
  { id: 2, title: 'Task 2', priority: 2 },
  { id: 3, title: 'Task 3', priority: 3 },
]

// Move task from position 0 to position 2
moveIndex(tasks, 0, 2)
// => [
//   { id: 2, title: 'Task 2', priority: 2 },
//   { id: 3, title: 'Task 3', priority: 3 },
//   { id: 1, title: 'Task 1', priority: 1 },
// ]

// No-op if indices are same
moveIndex([1, 2, 3], 1, 1)
// => [1, 2, 3]

// Negative indices (from end)
moveIndex(['a', 'b', 'c', 'd'], -1, 0)
// => ['d', 'a', 'b', 'c']

// Data-last (in pipe)
pipe(
  ['a', 'b', 'c', 'd', 'e'],
  moveIndex(1, 3)
)
// => ['a', 'c', 'd', 'b', 'e']
```

### See

 - insertAt - for adding new elements
 - removeAtIndex - for removing elements
 - updateAt - for replacing elements

## Call Signature

> **moveIndex**(`fromIndex`, `toIndex`): \<`T`\>(`items`) => readonly `T`[]

Defined in: [collection/moveIndex/index.ts:71](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/moveIndex/index.ts#L71)

Moves an element from one index to another (immutably).

Creates a new array with the element at `fromIndex` moved to `toIndex`,
shifting other elements as needed. Useful for drag-and-drop reordering,
priority adjustments, or any scenario requiring index-based repositioning.

### Parameters

#### fromIndex

`number`

Index of element to move

#### toIndex

`number`

Destination index

### Returns

New array with element moved

> \<`T`\>(`items`): readonly `T`[]

#### Type Parameters

##### T

`T`

#### Parameters

##### items

readonly `T`[]

#### Returns

readonly `T`[]

### Example

```typescript
// Data-first: Move element forward
moveIndex(['a', 'b', 'c', 'd', 'e'], 1, 3)
// => ['a', 'c', 'd', 'b', 'e']

// Move element backward
moveIndex(['a', 'b', 'c', 'd', 'e'], 3, 1)
// => ['a', 'd', 'b', 'c', 'e']

// Drag-and-drop reordering
interface Task {
  id: number
  title: string
  priority: number
}

const tasks: Task[] = [
  { id: 1, title: 'Task 1', priority: 1 },
  { id: 2, title: 'Task 2', priority: 2 },
  { id: 3, title: 'Task 3', priority: 3 },
]

// Move task from position 0 to position 2
moveIndex(tasks, 0, 2)
// => [
//   { id: 2, title: 'Task 2', priority: 2 },
//   { id: 3, title: 'Task 3', priority: 3 },
//   { id: 1, title: 'Task 1', priority: 1 },
// ]

// No-op if indices are same
moveIndex([1, 2, 3], 1, 1)
// => [1, 2, 3]

// Negative indices (from end)
moveIndex(['a', 'b', 'c', 'd'], -1, 0)
// => ['d', 'a', 'b', 'c']

// Data-last (in pipe)
pipe(
  ['a', 'b', 'c', 'd', 'e'],
  moveIndex(1, 3)
)
// => ['a', 'c', 'd', 'b', 'e']
```

### See

 - insertAt - for adding new elements
 - removeAtIndex - for removing elements
 - updateAt - for replacing elements
