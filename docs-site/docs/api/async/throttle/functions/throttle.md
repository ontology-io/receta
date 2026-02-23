# Function: throttle()

> **throttle**\<`TArgs`, `TReturn`\>(`fn`, `options`): (...`args`) => `Promise`\<`TReturn`\>

Defined in: [async/throttle/index.ts:45](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/throttle/index.ts#L45)

Throttles an async function.

Creates a throttled version of an async function that only invokes
at most once per specified delay period.

Unlike debounce (which delays execution until calls stop), throttle
guarantees execution at regular intervals regardless of call frequency.

## Type Parameters

### TArgs

`TArgs` *extends* readonly `unknown`[]

### TReturn

`TReturn`

## Parameters

### fn

(...`args`) => `Promise`\<`TReturn`\>

Async function to throttle

### options

[`ThrottleOptions`](../../types/interfaces/ThrottleOptions.md)

Throttle options

## Returns

Throttled function

> (...`args`): `Promise`\<`TReturn`\>

### Parameters

#### args

...`TArgs`

### Returns

`Promise`\<`TReturn`\>

## Example

```typescript
// Throttled API call (max once per second)
const trackEvent = throttle(
  async (event: string) => {
    await fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event })
    })
  },
  { delay: 1000 }
)

// User scrolls rapidly
trackEvent('scroll') // Executes immediately
trackEvent('scroll') // Ignored (within 1s)
trackEvent('scroll') // Ignored (within 1s)
// ... 1 second passes
trackEvent('scroll') // Executes

// Throttle with trailing edge only
const saveProgress = throttle(
  async (data) => api.save(data),
  { delay: 5000, leading: false, trailing: true }
)
```

## See

debounce - for delaying execution until calls stop
