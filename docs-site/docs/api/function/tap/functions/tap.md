# Function: tap()

## Call Signature

> **tap**\<`T`\>(`fn`): (`value`) => `T`

Defined in: [function/tap/index.ts:60](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/tap/index.ts#L60)

Executes a side effect function and returns the original value unchanged.

This is invaluable for debugging pipelines or performing side effects
(like logging) without breaking the data flow.

### Type Parameters

#### T

`T`

### Parameters

#### fn

(`value`) => `void`

### Returns

> (`value`): `T`

#### Parameters

##### value

`T`

#### Returns

`T`

### Examples

```typescript
// Debugging a pipeline
pipe(
  [1, 2, 3, 4, 5],
  R.map(x => x * 2),
  tap(x => console.log('After doubling:', x)),  // [2, 4, 6, 8, 10]
  R.filter(x => x > 5),
  tap(x => console.log('After filtering:', x)), // [6, 8, 10]
  R.reduce((a, b) => a + b, 0)
)
```

```typescript
// Data-first
const result = tap(
  (x) => console.log('Value:', x),
  42
)
// Logs: "Value: 42"
// => 42
```

```typescript
// Side effects in a chain
const processUser = pipe(
  fetchUser(userId),
  tap(user => analytics.track('user_fetched', { id: user.id })),
  tap(user => logger.info('Processing user', user)),
  transformUser,
  tap(transformed => cache.set(userId, transformed)),
  saveUser
)
```

```typescript
// Conditional logging
pipe(
  getData(),
  tap(data => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug:', data)
    }
  }),
  processData
)
```

## Call Signature

> **tap**\<`T`\>(`fn`, `value`): `T`

Defined in: [function/tap/index.ts:61](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/tap/index.ts#L61)

Executes a side effect function and returns the original value unchanged.

This is invaluable for debugging pipelines or performing side effects
(like logging) without breaking the data flow.

### Type Parameters

#### T

`T`

### Parameters

#### fn

(`value`) => `void`

#### value

`T`

### Returns

`T`

### Examples

```typescript
// Debugging a pipeline
pipe(
  [1, 2, 3, 4, 5],
  R.map(x => x * 2),
  tap(x => console.log('After doubling:', x)),  // [2, 4, 6, 8, 10]
  R.filter(x => x > 5),
  tap(x => console.log('After filtering:', x)), // [6, 8, 10]
  R.reduce((a, b) => a + b, 0)
)
```

```typescript
// Data-first
const result = tap(
  (x) => console.log('Value:', x),
  42
)
// Logs: "Value: 42"
// => 42
```

```typescript
// Side effects in a chain
const processUser = pipe(
  fetchUser(userId),
  tap(user => analytics.track('user_fetched', { id: user.id })),
  tap(user => logger.info('Processing user', user)),
  transformUser,
  tap(transformed => cache.set(userId, transformed)),
  saveUser
)
```

```typescript
// Conditional logging
pipe(
  getData(),
  tap(data => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug:', data)
    }
  }),
  processData
)
```
