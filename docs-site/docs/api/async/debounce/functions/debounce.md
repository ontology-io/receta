# Function: debounce()

> **debounce**\<`TArgs`, `TReturn`\>(`fn`, `options`): (...`args`) => `Promise`\<`TReturn`\>

Defined in: [async/debounce/index.ts:43](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/debounce/index.ts#L43)

Debounces an async function.

Creates a debounced version of an async function that delays invoking
until after the specified delay has elapsed since the last call.

Useful for rate-limiting API calls, search inputs, or any operation
that shouldn't run on every invocation.

## Type Parameters

### TArgs

`TArgs` *extends* readonly `unknown`[]

### TReturn

`TReturn`

## Parameters

### fn

(...`args`) => `Promise`\<`TReturn`\>

Async function to debounce

### options

[`DebounceOptions`](../../types/interfaces/DebounceOptions.md)

Debounce options

## Returns

Debounced function

> (...`args`): `Promise`\<`TReturn`\>

### Parameters

#### args

...`TArgs`

### Returns

`Promise`\<`TReturn`\>

## Example

```typescript
// Debounced search
const searchAPI = debounce(
  async (query: string) => {
    const res = await fetch(`/api/search?q=${query}`)
    return res.json()
  },
  { delay: 300 }
)

// User types "hello" quickly
searchAPI('h')      // Cancelled
searchAPI('he')     // Cancelled
searchAPI('hel')    // Cancelled
searchAPI('hell')   // Cancelled
searchAPI('hello')  // Executes after 300ms

// Leading edge debounce (execute immediately, ignore subsequent calls)
const saveData = debounce(
  async (data) => api.save(data),
  { delay: 1000, leading: true, trailing: false }
)
```

## See

throttle - for limiting function calls to a fixed rate
