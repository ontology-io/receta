# Interface: PollOptions

Defined in: [async/types.ts:57](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L57)

Options for polling operations.

## Properties

### interval?

> `readonly` `optional` **interval**: `number`

Defined in: [async/types.ts:62](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L62)

Interval between poll attempts in milliseconds.

#### Default

```ts
1000
```

***

### maxAttempts?

> `readonly` `optional` **maxAttempts**: `number`

Defined in: [async/types.ts:68](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L68)

Maximum number of poll attempts.

#### Default

```ts
10
```

***

### onPoll()?

> `readonly` `optional` **onPoll**: (`attempt`) => `void`

Defined in: [async/types.ts:84](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L84)

Callback invoked on each poll attempt.

#### Parameters

##### attempt

`number`

#### Returns

`void`

***

### shouldContinue()?

> `readonly` `optional` **shouldContinue**: (`attempt`) => `boolean`

Defined in: [async/types.ts:79](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L79)

Predicate to determine if polling should stop.
Return true to continue polling, false to stop.

#### Parameters

##### attempt

`number`

#### Returns

`boolean`

***

### timeout?

> `readonly` `optional` **timeout**: `number`

Defined in: [async/types.ts:73](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L73)

Timeout in milliseconds for the entire polling operation.
