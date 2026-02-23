# Interface: RetryOptions

Defined in: [async/types.ts:4](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L4)

Options for retry operations.

## Properties

### backoff?

> `readonly` `optional` **backoff**: `number`

Defined in: [async/types.ts:22](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L22)

Backoff multiplier for exponential backoff.
Set to 1 for constant delay.

#### Default

```ts
2
```

***

### delay?

> `readonly` `optional` **delay**: `number`

Defined in: [async/types.ts:15](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L15)

Initial delay in milliseconds before the first retry.

#### Default

```ts
1000
```

***

### maxAttempts?

> `readonly` `optional` **maxAttempts**: `number`

Defined in: [async/types.ts:9](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L9)

Maximum number of retry attempts.

#### Default

```ts
3
```

***

### maxDelay?

> `readonly` `optional` **maxDelay**: `number`

Defined in: [async/types.ts:28](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L28)

Maximum delay in milliseconds between retries.

#### Default

```ts
30000
```

***

### onRetry()?

> `readonly` `optional` **onRetry**: (`error`, `attempt`, `delay`) => `void`

Defined in: [async/types.ts:39](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L39)

Callback invoked on each retry attempt.

#### Parameters

##### error

`unknown`

##### attempt

`number`

##### delay

`number`

#### Returns

`void`

***

### shouldRetry()?

> `readonly` `optional` **shouldRetry**: (`error`, `attempt`) => `boolean`

Defined in: [async/types.ts:34](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L34)

Function to determine if an error should be retried.
Return true to retry, false to fail immediately.

#### Parameters

##### error

`unknown`

##### attempt

`number`

#### Returns

`boolean`
