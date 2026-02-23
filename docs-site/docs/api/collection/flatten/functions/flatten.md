# Function: flatten()

## Call Signature

> **flatten**\<`T`\>(`items`, `config`): readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

Defined in: [collection/flatten/index.ts:74](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/flatten/index.ts#L74)

Flattens a tree structure into a flat array with optional depth control and path tracking.

Unlike Remeda's `flat()` which flattens nested arrays, this function handles tree structures
where each node contains children. Useful for hierarchical data like file systems, org charts,
or nested comments.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The root items to flatten

#### config

[`FlattenConfig`](../../types/interfaces/FlattenConfig.md)\<`T`\> & `object`

Configuration for extracting children and controlling depth

### Returns

readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

Flat array of items or items with path information

### Example

```typescript
// Data-first: File system tree
interface FileNode {
  name: string
  children?: FileNode[]
}

const tree: FileNode[] = [
  {
    name: 'src',
    children: [
      { name: 'index.ts' },
      { name: 'utils', children: [{ name: 'helper.ts' }] }
    ]
  }
]

flatten(tree, { getChildren: (n) => n.children })
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] },
//   { name: 'helper.ts' }
// ]

// With path tracking
flatten(tree, {
  getChildren: (n) => n.children,
  includePath: true
})
// => [
//   { item: { name: 'src', ... }, path: [], depth: 0 },
//   { item: { name: 'index.ts' }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'utils', ... }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'helper.ts' }, path: [{ name: 'src', ... }, { name: 'utils', ... }], depth: 2 }
// ]

// With max depth
flatten(tree, {
  getChildren: (n) => n.children,
  maxDepth: 1
})
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] }
// ]
// (stops at depth 1, doesn't include helper.ts)

// Data-last (in pipe)
pipe(
  tree,
  flatten({ getChildren: (n) => n.children })
)
```

### See

nest - for inverse operation (flat → tree)

## Call Signature

> **flatten**\<`T`\>(`items`, `config`): readonly `T`[]

Defined in: [collection/flatten/index.ts:78](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/flatten/index.ts#L78)

Flattens a tree structure into a flat array with optional depth control and path tracking.

Unlike Remeda's `flat()` which flattens nested arrays, this function handles tree structures
where each node contains children. Useful for hierarchical data like file systems, org charts,
or nested comments.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The root items to flatten

#### config

[`FlattenConfig`](../../types/interfaces/FlattenConfig.md)\<`T`\> & `object`

Configuration for extracting children and controlling depth

### Returns

readonly `T`[]

Flat array of items or items with path information

### Example

```typescript
// Data-first: File system tree
interface FileNode {
  name: string
  children?: FileNode[]
}

const tree: FileNode[] = [
  {
    name: 'src',
    children: [
      { name: 'index.ts' },
      { name: 'utils', children: [{ name: 'helper.ts' }] }
    ]
  }
]

flatten(tree, { getChildren: (n) => n.children })
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] },
//   { name: 'helper.ts' }
// ]

// With path tracking
flatten(tree, {
  getChildren: (n) => n.children,
  includePath: true
})
// => [
//   { item: { name: 'src', ... }, path: [], depth: 0 },
//   { item: { name: 'index.ts' }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'utils', ... }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'helper.ts' }, path: [{ name: 'src', ... }, { name: 'utils', ... }], depth: 2 }
// ]

// With max depth
flatten(tree, {
  getChildren: (n) => n.children,
  maxDepth: 1
})
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] }
// ]
// (stops at depth 1, doesn't include helper.ts)

// Data-last (in pipe)
pipe(
  tree,
  flatten({ getChildren: (n) => n.children })
)
```

### See

nest - for inverse operation (flat → tree)

## Call Signature

> **flatten**\<`T`\>(`items`, `config`): readonly `T`[] \| readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

Defined in: [collection/flatten/index.ts:82](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/flatten/index.ts#L82)

Flattens a tree structure into a flat array with optional depth control and path tracking.

Unlike Remeda's `flat()` which flattens nested arrays, this function handles tree structures
where each node contains children. Useful for hierarchical data like file systems, org charts,
or nested comments.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The root items to flatten

#### config

[`FlattenConfig`](../../types/interfaces/FlattenConfig.md)\<`T`\>

Configuration for extracting children and controlling depth

### Returns

readonly `T`[] \| readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

Flat array of items or items with path information

### Example

```typescript
// Data-first: File system tree
interface FileNode {
  name: string
  children?: FileNode[]
}

const tree: FileNode[] = [
  {
    name: 'src',
    children: [
      { name: 'index.ts' },
      { name: 'utils', children: [{ name: 'helper.ts' }] }
    ]
  }
]

flatten(tree, { getChildren: (n) => n.children })
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] },
//   { name: 'helper.ts' }
// ]

// With path tracking
flatten(tree, {
  getChildren: (n) => n.children,
  includePath: true
})
// => [
//   { item: { name: 'src', ... }, path: [], depth: 0 },
//   { item: { name: 'index.ts' }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'utils', ... }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'helper.ts' }, path: [{ name: 'src', ... }, { name: 'utils', ... }], depth: 2 }
// ]

// With max depth
flatten(tree, {
  getChildren: (n) => n.children,
  maxDepth: 1
})
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] }
// ]
// (stops at depth 1, doesn't include helper.ts)

// Data-last (in pipe)
pipe(
  tree,
  flatten({ getChildren: (n) => n.children })
)
```

### See

nest - for inverse operation (flat → tree)

## Call Signature

> **flatten**\<`T`\>(`config`): (`items`) => readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

Defined in: [collection/flatten/index.ts:86](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/flatten/index.ts#L86)

Flattens a tree structure into a flat array with optional depth control and path tracking.

Unlike Remeda's `flat()` which flattens nested arrays, this function handles tree structures
where each node contains children. Useful for hierarchical data like file systems, org charts,
or nested comments.

### Type Parameters

#### T

`T`

### Parameters

#### config

[`FlattenConfig`](../../types/interfaces/FlattenConfig.md)\<`T`\> & `object`

Configuration for extracting children and controlling depth

### Returns

Flat array of items or items with path information

> (`items`): readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

#### Parameters

##### items

readonly `T`[]

#### Returns

readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

### Example

```typescript
// Data-first: File system tree
interface FileNode {
  name: string
  children?: FileNode[]
}

const tree: FileNode[] = [
  {
    name: 'src',
    children: [
      { name: 'index.ts' },
      { name: 'utils', children: [{ name: 'helper.ts' }] }
    ]
  }
]

flatten(tree, { getChildren: (n) => n.children })
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] },
//   { name: 'helper.ts' }
// ]

// With path tracking
flatten(tree, {
  getChildren: (n) => n.children,
  includePath: true
})
// => [
//   { item: { name: 'src', ... }, path: [], depth: 0 },
//   { item: { name: 'index.ts' }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'utils', ... }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'helper.ts' }, path: [{ name: 'src', ... }, { name: 'utils', ... }], depth: 2 }
// ]

// With max depth
flatten(tree, {
  getChildren: (n) => n.children,
  maxDepth: 1
})
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] }
// ]
// (stops at depth 1, doesn't include helper.ts)

// Data-last (in pipe)
pipe(
  tree,
  flatten({ getChildren: (n) => n.children })
)
```

### See

nest - for inverse operation (flat → tree)

## Call Signature

> **flatten**\<`T`\>(`config`): (`items`) => readonly `T`[]

Defined in: [collection/flatten/index.ts:89](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/flatten/index.ts#L89)

Flattens a tree structure into a flat array with optional depth control and path tracking.

Unlike Remeda's `flat()` which flattens nested arrays, this function handles tree structures
where each node contains children. Useful for hierarchical data like file systems, org charts,
or nested comments.

### Type Parameters

#### T

`T`

### Parameters

#### config

[`FlattenConfig`](../../types/interfaces/FlattenConfig.md)\<`T`\> & `object`

Configuration for extracting children and controlling depth

### Returns

Flat array of items or items with path information

> (`items`): readonly `T`[]

#### Parameters

##### items

readonly `T`[]

#### Returns

readonly `T`[]

### Example

```typescript
// Data-first: File system tree
interface FileNode {
  name: string
  children?: FileNode[]
}

const tree: FileNode[] = [
  {
    name: 'src',
    children: [
      { name: 'index.ts' },
      { name: 'utils', children: [{ name: 'helper.ts' }] }
    ]
  }
]

flatten(tree, { getChildren: (n) => n.children })
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] },
//   { name: 'helper.ts' }
// ]

// With path tracking
flatten(tree, {
  getChildren: (n) => n.children,
  includePath: true
})
// => [
//   { item: { name: 'src', ... }, path: [], depth: 0 },
//   { item: { name: 'index.ts' }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'utils', ... }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'helper.ts' }, path: [{ name: 'src', ... }, { name: 'utils', ... }], depth: 2 }
// ]

// With max depth
flatten(tree, {
  getChildren: (n) => n.children,
  maxDepth: 1
})
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] }
// ]
// (stops at depth 1, doesn't include helper.ts)

// Data-last (in pipe)
pipe(
  tree,
  flatten({ getChildren: (n) => n.children })
)
```

### See

nest - for inverse operation (flat → tree)

## Call Signature

> **flatten**\<`T`\>(`config`): (`items`) => readonly `T`[] \| readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

Defined in: [collection/flatten/index.ts:92](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/flatten/index.ts#L92)

Flattens a tree structure into a flat array with optional depth control and path tracking.

Unlike Remeda's `flat()` which flattens nested arrays, this function handles tree structures
where each node contains children. Useful for hierarchical data like file systems, org charts,
or nested comments.

### Type Parameters

#### T

`T`

### Parameters

#### config

[`FlattenConfig`](../../types/interfaces/FlattenConfig.md)\<`T`\>

Configuration for extracting children and controlling depth

### Returns

Flat array of items or items with path information

> (`items`): readonly `T`[] \| readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

#### Parameters

##### items

readonly `T`[]

#### Returns

readonly `T`[] \| readonly [`FlattenedItem`](../../types/interfaces/FlattenedItem.md)\<`T`\>[]

### Example

```typescript
// Data-first: File system tree
interface FileNode {
  name: string
  children?: FileNode[]
}

const tree: FileNode[] = [
  {
    name: 'src',
    children: [
      { name: 'index.ts' },
      { name: 'utils', children: [{ name: 'helper.ts' }] }
    ]
  }
]

flatten(tree, { getChildren: (n) => n.children })
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] },
//   { name: 'helper.ts' }
// ]

// With path tracking
flatten(tree, {
  getChildren: (n) => n.children,
  includePath: true
})
// => [
//   { item: { name: 'src', ... }, path: [], depth: 0 },
//   { item: { name: 'index.ts' }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'utils', ... }, path: [{ name: 'src', ... }], depth: 1 },
//   { item: { name: 'helper.ts' }, path: [{ name: 'src', ... }, { name: 'utils', ... }], depth: 2 }
// ]

// With max depth
flatten(tree, {
  getChildren: (n) => n.children,
  maxDepth: 1
})
// => [
//   { name: 'src', children: [...] },
//   { name: 'index.ts' },
//   { name: 'utils', children: [...] }
// ]
// (stops at depth 1, doesn't include helper.ts)

// Data-last (in pipe)
pipe(
  tree,
  flatten({ getChildren: (n) => n.children })
)
```

### See

nest - for inverse operation (flat → tree)
