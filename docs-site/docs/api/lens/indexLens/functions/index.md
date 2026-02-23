# Function: index()

> **index**\<`A`\>(`idx`): [`Lens`](../../types/interfaces/Lens.md)\<readonly `A`[], `A` \| `undefined`\>

Defined in: [lens/indexLens/index.ts:49](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/lens/indexLens/index.ts#L49)

Creates a Lens focusing on a specific index in an array.

Allows immutable updates to array elements at a specific position.
If the index is out of bounds, `get` returns undefined and `set` has no effect.

## Type Parameters

### A

`A`

## Parameters

### idx

`number`

The array index to focus on

## Returns

[`Lens`](../../types/interfaces/Lens.md)\<readonly `A`[], `A` \| `undefined`\>

A Lens focusing on the element at the specified index

## Examples

```typescript
const firstLens = index<number>(0)
const thirdLens = index<number>(2)

const numbers = [1, 2, 3, 4, 5]

firstLens.get(numbers) // 1
thirdLens.get(numbers) // 3

firstLens.set(10)(numbers) // [10, 2, 3, 4, 5]
thirdLens.set(30)(numbers) // [1, 2, 30, 4, 5]
```

```typescript
// With objects in arrays
interface Todo {
  id: number
  text: string
  done: boolean
}

const todos: Todo[] = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true }
]

const secondTodoLens = index<Todo>(1)
secondTodoLens.get(todos) // { id: 2, text: 'Walk dog', done: true }
```

## See

 - prop - For object property access
 - path - For nested property access
