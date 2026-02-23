# Interface: RetryError

Defined in: [async/retry/index.ts:8](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/retry/index.ts#L8)

Error type returned when all retry attempts fail.

## Properties

### attempts

> `readonly` **attempts**: `number`

Defined in: [async/retry/index.ts:11](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/retry/index.ts#L11)

***

### lastError

> `readonly` **lastError**: `unknown`

Defined in: [async/retry/index.ts:10](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/retry/index.ts#L10)

***

### type

> `readonly` **type**: `"max_attempts_exceeded"`

Defined in: [async/retry/index.ts:9](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/retry/index.ts#L9)
