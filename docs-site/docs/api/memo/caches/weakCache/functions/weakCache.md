# Function: weakCache()

> **weakCache**\<`K`, `V`\>(): [`Cache`](../../../types/interfaces/Cache.md)\<`K`, `V`\>

Defined in: [memo/caches/weakCache.ts:38](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/caches/weakCache.ts#L38)

Creates a WeakMap-based cache for object keys.

Advantages:
- Entries are garbage collected when keys are no longer referenced
- No memory leaks from unreferenced objects
- Perfect for caching computations on DOM nodes, objects, etc.

Limitations:
- Only works with object keys (not primitives)
- Cannot iterate entries
- No size limit or TTL support

## Type Parameters

### K

`K` *extends* `object`

### V

`V`

## Returns

[`Cache`](../../../types/interfaces/Cache.md)\<`K`, `V`\>

## Example

```typescript
import { memoizeBy, weakCache } from 'receta/memo'

interface Node {
  id: string
  children: Node[]
}

const processNode = memoizeBy(
  (node: Node) => expensiveOperation(node),
  (node) => node, // object as key
  { cache: weakCache() }
)

const node = { id: 'root', children: [] }
processNode(node) // computed
processNode(node) // cached
// When 'node' is GC'd, cache entry is automatically removed
```
