# Interface: RetryError

Defined in: [async/retry/index.ts:8](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/retry/index.ts#L8)

Error type returned when all retry attempts fail.

## Properties

### attempts

> `readonly` **attempts**: `number`

Defined in: [async/retry/index.ts:11](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/retry/index.ts#L11)

***

### lastError

> `readonly` **lastError**: `unknown`

Defined in: [async/retry/index.ts:10](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/retry/index.ts#L10)

***

### type

> `readonly` **type**: `"max_attempts_exceeded"`

Defined in: [async/retry/index.ts:9](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/retry/index.ts#L9)
