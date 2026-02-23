# Function: memoizeBy()

> **memoizeBy**\<`Args`, `R`, `K`\>(`fn`, `keyFn`, `options?`): [`MemoizedFunction`](../../types/interfaces/MemoizedFunction.md)\<`Args`, `R`\>

Defined in: [memo/memoizeBy/index.ts:42](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/memoizeBy/index.ts#L42)

Creates a memoized function with custom key extraction.

Use this when:
- Function takes multiple arguments
- Function takes complex objects as arguments
- You need custom cache key logic

## Type Parameters

### Args

`Args` *extends* readonly `unknown`[]

### R

`R`

### K

`K`

## Parameters

### fn

(...`args`) => `R`

### keyFn

[`KeyFn`](../../types/type-aliases/KeyFn.md)\<`Args`, `K`\>

### options?

[`MemoizeOptions`](../../types/interfaces/MemoizeOptions.md)\<`K`\> = `{}`

## Returns

[`MemoizedFunction`](../../types/interfaces/MemoizedFunction.md)\<`Args`, `R`\>

## Example

```typescript
// Multi-argument function
const add = (a: number, b: number) => a + b
const memoAdd = memoizeBy(add, (a, b) => `${a},${b}`)

memoAdd(2, 3) // computed
memoAdd(2, 3) // cached

// Complex object arguments
interface FetchOptions {
  id: string
  include?: string[]
}

const fetchUser = memoizeBy(
  (opts: FetchOptions) => api.fetch(opts),
  (opts) => JSON.stringify(opts)
)

// Object key (use with WeakMap cache)
const processNode = memoizeBy(
  (node: Node) => expensiveOperation(node),
  (node) => node // object as key
)
```

## See

 - memoize - for single-argument functions
 - memoizeAsync - for async functions
