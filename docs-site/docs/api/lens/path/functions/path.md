# Function: path()

> **path**\<`S`, `A`\>(`pathStr`): [`Lens`](../../types/interfaces/Lens.md)\<`S`, `A`\>

Defined in: [lens/path/index.ts:55](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/lens/path/index.ts#L55)

Creates a Lens focusing on a nested property using dot notation.

Allows deep access into nested objects using string paths like 'user.address.city'.
The lens handles immutable updates at any depth.

## Type Parameters

### S

`S`

### A

`A` = `unknown`

## Parameters

### pathStr

`string`

Dot-separated path to the nested property

## Returns

[`Lens`](../../types/interfaces/Lens.md)\<`S`, `A`\>

A Lens focusing on the value at the specified path

## Examples

```typescript
interface User {
  name: string
  address: {
    street: string
    city: string
    zip: string
  }
}

const cityLens = path<User, string>('address.city')

const user = {
  name: 'Alice',
  address: { street: '123 Main St', city: 'Boston', zip: '02101' }
}

cityLens.get(user) // 'Boston'
cityLens.set('NYC')(user)
// => { name: 'Alice', address: { street: '123 Main St', city: 'NYC', zip: '02101' } }
```

```typescript
// Deeply nested access
interface State {
  ui: {
    modal: {
      isOpen: boolean
      data: { title: string }
    }
  }
}

const modalTitleLens = path<State, string>('ui.modal.data.title')
```

## See

 - prop - For single property access
 - lens - For custom get/set logic
