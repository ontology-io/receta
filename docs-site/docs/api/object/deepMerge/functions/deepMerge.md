# Function: deepMerge()

## Call Signature

> **deepMerge**(`objects`, `options?`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/deepMerge/index.ts:60](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/deepMerge/index.ts#L60)

Deep merges multiple objects with configurable conflict resolution.

Recursively merges objects, with later objects taking precedence over earlier ones.
Arrays and nested objects can be merged according to specified strategies.

### Parameters

#### objects

readonly [`PlainObject`](../../types/type-aliases/PlainObject.md)[]

Array of objects to merge

#### options?

[`DeepMergeOptions`](../../types/interfaces/DeepMergeOptions.md)

Merge options (arrayStrategy, customMerge)

### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

A new deeply merged object

### Example

```typescript
// Basic deep merge
const defaults = { theme: 'light', features: { search: true } }
const config = { features: { export: true } }
deepMerge([defaults, config])
// => { theme: 'light', features: { search: true, export: true } }

// Array replace strategy (default)
deepMerge([
  { tags: ['a', 'b'] },
  { tags: ['c'] }
])
// => { tags: ['c'] }

// Array concat strategy
deepMerge([
  { tags: ['a', 'b'] },
  { tags: ['c'] }
], { arrayStrategy: 'concat' })
// => { tags: ['a', 'b', 'c'] }

// Custom merge function
deepMerge([obj1, obj2], {
  customMerge: (key, target, source) => {
    if (key === 'count') return (target as number) + (source as number)
    return source
  }
})

// Data-last (in pipe)
pipe(
  defaults,
  (defaults) => deepMerge([defaults, userConfig])
)
```

### See

 - Remeda.merge - for shallow merge
 - Remeda.mergeDeep - for basic deep merge

## Call Signature

> **deepMerge**(`options?`): (`objects`) => [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/deepMerge/index.ts:61](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/deepMerge/index.ts#L61)

Deep merges multiple objects with configurable conflict resolution.

Recursively merges objects, with later objects taking precedence over earlier ones.
Arrays and nested objects can be merged according to specified strategies.

### Parameters

#### options?

[`DeepMergeOptions`](../../types/interfaces/DeepMergeOptions.md)

Merge options (arrayStrategy, customMerge)

### Returns

A new deeply merged object

> (`objects`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### objects

readonly [`PlainObject`](../../types/type-aliases/PlainObject.md)[]

#### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

### Example

```typescript
// Basic deep merge
const defaults = { theme: 'light', features: { search: true } }
const config = { features: { export: true } }
deepMerge([defaults, config])
// => { theme: 'light', features: { search: true, export: true } }

// Array replace strategy (default)
deepMerge([
  { tags: ['a', 'b'] },
  { tags: ['c'] }
])
// => { tags: ['c'] }

// Array concat strategy
deepMerge([
  { tags: ['a', 'b'] },
  { tags: ['c'] }
], { arrayStrategy: 'concat' })
// => { tags: ['a', 'b', 'c'] }

// Custom merge function
deepMerge([obj1, obj2], {
  customMerge: (key, target, source) => {
    if (key === 'count') return (target as number) + (source as number)
    return source
  }
})

// Data-last (in pipe)
pipe(
  defaults,
  (defaults) => deepMerge([defaults, userConfig])
)
```

### See

 - Remeda.merge - for shallow merge
 - Remeda.mergeDeep - for basic deep merge
