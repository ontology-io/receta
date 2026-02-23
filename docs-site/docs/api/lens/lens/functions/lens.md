# Function: lens()

> **lens**\<`S`, `A`\>(`get`, `set`): [`Lens`](../../types/interfaces/Lens.md)\<`S`, `A`\>

Defined in: [lens/lens/index.ts:35](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/lens/lens/index.ts#L35)

Creates a Lens from a getter and setter function.

A lens is a composable abstraction for focusing on a specific part of a
data structure. It consists of:
- `get`: Extracts the focused value from the source
- `set`: Returns a new source with the focused value updated

## Type Parameters

### S

`S`

### A

`A`

## Parameters

### get

(`source`) => `A`

Function to extract the focused value

### set

(`value`) => (`source`) => `S`

Function to update the focused value (returns updater)

## Returns

[`Lens`](../../types/interfaces/Lens.md)\<`S`, `A`\>

A Lens for the specified get/set operations

## Example

```typescript
interface User {
  name: string
  age: number
}

const nameLens = lens<User, string>(
  (user) => user.name,
  (name) => (user) => ({ ...user, name })
)

const user = { name: 'Alice', age: 30 }
const newName = nameLens.get(user) // 'Alice'
const updated = nameLens.set('Bob')(user) // { name: 'Bob', age: 30 }
```

## See

 - prop - For simple property access
 - path - For nested property access
