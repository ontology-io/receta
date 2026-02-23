# Function: insertAt()

## Call Signature

> **insertAt**\<`T`\>(`items`, `index`, `values`): readonly `T`[]

Defined in: [collection/insertAt/index.ts:67](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/insertAt/index.ts#L67)

Inserts one or more elements at a specific index (immutably).

Creates a new array with elements inserted at the specified index, shifting
existing elements as needed. More ergonomic than `splice` for insertion-only operations.
Built on top of Remeda's `splice` for consistency.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The array to modify

#### index

`number`

Position to insert at (0 = beginning, length = end)

#### values

Element(s) to insert

`T` | readonly `T`[]

### Returns

readonly `T`[]

New array with elements inserted

### Example

```typescript
// Data-first: Insert single element
insertAt(['a', 'b', 'd', 'e'], 2, 'c')
// => ['a', 'b', 'c', 'd', 'e']

// Insert multiple elements
insertAt([1, 2, 5, 6], 2, [3, 4])
// => [1, 2, 3, 4, 5, 6]

// Insert at beginning
insertAt(['b', 'c'], 0, 'a')
// => ['a', 'b', 'c']

// Insert at end
insertAt(['a', 'b'], 2, 'c')
// => ['a', 'b', 'c']

// Negative index (from end)
insertAt(['a', 'b', 'd'], -1, 'c')
// => ['a', 'b', 'c', 'd']

// Add item to todo list at specific position
interface Todo {
  id: number
  text: string
}

const todos: Todo[] = [
  { id: 1, text: 'Buy milk' },
  { id: 3, text: 'Walk dog' },
]

insertAt(todos, 1, { id: 2, text: 'Read book' })
// => [
//   { id: 1, text: 'Buy milk' },
//   { id: 2, text: 'Read book' },
//   { id: 3, text: 'Walk dog' },
// ]

// Data-last (in pipe)
pipe(
  ['a', 'b', 'd', 'e'],
  insertAt(2, 'c')
)
// => ['a', 'b', 'c', 'd', 'e']
```

### See

 - updateAt - for replacing elements
 - removeAtIndex - for removing elements
 - moveIndex - for moving elements

## Call Signature

> **insertAt**\<`T`\>(`index`, `values`): (`items`) => readonly `T`[]

Defined in: [collection/insertAt/index.ts:72](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/insertAt/index.ts#L72)

Inserts one or more elements at a specific index (immutably).

Creates a new array with elements inserted at the specified index, shifting
existing elements as needed. More ergonomic than `splice` for insertion-only operations.
Built on top of Remeda's `splice` for consistency.

### Type Parameters

#### T

`T`

### Parameters

#### index

`number`

Position to insert at (0 = beginning, length = end)

#### values

Element(s) to insert

`T` | readonly `T`[]

### Returns

New array with elements inserted

> (`items`): readonly `T`[]

#### Parameters

##### items

readonly `T`[]

#### Returns

readonly `T`[]

### Example

```typescript
// Data-first: Insert single element
insertAt(['a', 'b', 'd', 'e'], 2, 'c')
// => ['a', 'b', 'c', 'd', 'e']

// Insert multiple elements
insertAt([1, 2, 5, 6], 2, [3, 4])
// => [1, 2, 3, 4, 5, 6]

// Insert at beginning
insertAt(['b', 'c'], 0, 'a')
// => ['a', 'b', 'c']

// Insert at end
insertAt(['a', 'b'], 2, 'c')
// => ['a', 'b', 'c']

// Negative index (from end)
insertAt(['a', 'b', 'd'], -1, 'c')
// => ['a', 'b', 'c', 'd']

// Add item to todo list at specific position
interface Todo {
  id: number
  text: string
}

const todos: Todo[] = [
  { id: 1, text: 'Buy milk' },
  { id: 3, text: 'Walk dog' },
]

insertAt(todos, 1, { id: 2, text: 'Read book' })
// => [
//   { id: 1, text: 'Buy milk' },
//   { id: 2, text: 'Read book' },
//   { id: 3, text: 'Walk dog' },
// ]

// Data-last (in pipe)
pipe(
  ['a', 'b', 'd', 'e'],
  insertAt(2, 'c')
)
// => ['a', 'b', 'c', 'd', 'e']
```

### See

 - updateAt - for replacing elements
 - removeAtIndex - for removing elements
 - moveIndex - for moving elements
