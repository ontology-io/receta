# Function: removeAtIndex()

## Call Signature

> **removeAtIndex**\<`T`\>(`items`, `index`): readonly `T`[]

Defined in: [collection/removeAtIndex/index.ts:73](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/removeAtIndex/index.ts#L73)

Removes an element at a specific index (immutably).

Creates a new array with the element at the specified index removed. More ergonomic
than `splice` for single-element removal. Built on top of Remeda's `splice` for consistency.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The array to modify

#### index

`number`

Position to remove

### Returns

readonly `T`[]

New array with element removed, or original array if index is out of bounds

### Example

```typescript
// Data-first: Remove element
removeAtIndex(['a', 'b', 'c', 'd'], 2)
// => ['a', 'b', 'd']

// Remove at beginning
removeAtIndex([1, 2, 3], 0)
// => [2, 3]

// Remove at end
removeAtIndex([1, 2, 3], 2)
// => [1, 2]

// Negative index (from end)
removeAtIndex(['a', 'b', 'c', 'd'], -1)
// => ['a', 'b', 'c']

// Out of bounds returns original array
removeAtIndex([1, 2, 3], 10)
// => [1, 2, 3]

// Remove todo item
interface Todo {
  id: number
  text: string
}

const todos: Todo[] = [
  { id: 1, text: 'Buy milk' },
  { id: 2, text: 'Read book' },
  { id: 3, text: 'Walk dog' },
]

removeAtIndex(todos, 1)
// => [
//   { id: 1, text: 'Buy milk' },
//   { id: 3, text: 'Walk dog' },
// ]

// Data-last (in pipe)
pipe(
  ['a', 'b', 'c', 'd'],
  removeAtIndex(2)
)
// => ['a', 'b', 'd']

// Chain multiple removals
pipe(
  [1, 2, 3, 4, 5],
  removeAtIndex(0),  // [2, 3, 4, 5]
  removeAtIndex(-1)  // [2, 3, 4]
)
// => [2, 3, 4]
```

### See

 - insertAt - for adding elements
 - updateAt - for replacing elements
 - moveIndex - for moving elements

## Call Signature

> **removeAtIndex**(`index`): \<`T`\>(`items`) => readonly `T`[]

Defined in: [collection/removeAtIndex/index.ts:77](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/removeAtIndex/index.ts#L77)

Removes an element at a specific index (immutably).

Creates a new array with the element at the specified index removed. More ergonomic
than `splice` for single-element removal. Built on top of Remeda's `splice` for consistency.

### Parameters

#### index

`number`

Position to remove

### Returns

New array with element removed, or original array if index is out of bounds

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
// Data-first: Remove element
removeAtIndex(['a', 'b', 'c', 'd'], 2)
// => ['a', 'b', 'd']

// Remove at beginning
removeAtIndex([1, 2, 3], 0)
// => [2, 3]

// Remove at end
removeAtIndex([1, 2, 3], 2)
// => [1, 2]

// Negative index (from end)
removeAtIndex(['a', 'b', 'c', 'd'], -1)
// => ['a', 'b', 'c']

// Out of bounds returns original array
removeAtIndex([1, 2, 3], 10)
// => [1, 2, 3]

// Remove todo item
interface Todo {
  id: number
  text: string
}

const todos: Todo[] = [
  { id: 1, text: 'Buy milk' },
  { id: 2, text: 'Read book' },
  { id: 3, text: 'Walk dog' },
]

removeAtIndex(todos, 1)
// => [
//   { id: 1, text: 'Buy milk' },
//   { id: 3, text: 'Walk dog' },
// ]

// Data-last (in pipe)
pipe(
  ['a', 'b', 'c', 'd'],
  removeAtIndex(2)
)
// => ['a', 'b', 'd']

// Chain multiple removals
pipe(
  [1, 2, 3, 4, 5],
  removeAtIndex(0),  // [2, 3, 4, 5]
  removeAtIndex(-1)  // [2, 3, 4]
)
// => [2, 3, 4]
```

### See

 - insertAt - for adding elements
 - updateAt - for replacing elements
 - moveIndex - for moving elements
