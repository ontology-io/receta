# Function: byKey()

> **byKey**\<`T`, `K`\>(`key`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/basic/index.ts:192](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/basic/index.ts#L192)

Creates a comparator that sorts by a specific object key.

Convenience function for the common case of sorting objects by a property.

## Type Parameters

### T

`T`

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### key

`K`

The object key to sort by

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A comparator function

## Example

```typescript
interface Product {
  id: string
  name: string
  price: number
  stock: number
}

const products = [
  { id: 'c', name: 'Keyboard', price: 80, stock: 5 },
  { id: 'a', name: 'Mouse', price: 25, stock: 10 },
  { id: 'b', name: 'Monitor', price: 300, stock: 3 }
]

// Sort by price
products.sort(byKey('price'))
// => [{ name: 'Mouse', price: 25, ... }, { name: 'Keyboard', price: 80, ... }, ...]

// Sort by name
products.sort(byKey('name'))
// => [{ name: 'Keyboard', ... }, { name: 'Monitor', ... }, { name: 'Mouse', ... }]

// Sort by ID
products.sort(byKey('id'))
// => [{ id: 'a', ... }, { id: 'b', ... }, { id: 'c', ... }]
```

## See

 - ascending - for custom extraction with ascending order
 - descending - for custom extraction with descending order
