# Interface: FlattenConfig\<T\>

Defined in: [collection/types.ts:203](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/types.ts#L203)

Configuration for flatten operation.

## Example

```typescript
const config: FlattenConfig<FileNode> = {
  getChildren: (node) => node.children,
  maxDepth: 3,
  includePath: true
}
```

## Type Parameters

### T

`T`

The type of tree nodes

## Properties

### getChildren()

> `readonly` **getChildren**: (`node`) => readonly `T`[] \| `undefined`

Defined in: [collection/types.ts:204](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/types.ts#L204)

#### Parameters

##### node

`T`

#### Returns

readonly `T`[] \| `undefined`

***

### includePath?

> `readonly` `optional` **includePath**: `boolean`

Defined in: [collection/types.ts:206](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/types.ts#L206)

***

### maxDepth?

> `readonly` `optional` **maxDepth**: `number`

Defined in: [collection/types.ts:205](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/types.ts#L205)
