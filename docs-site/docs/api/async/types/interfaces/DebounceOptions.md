# Interface: DebounceOptions

Defined in: [async/types.ts:113](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L113)

Options for debounce operations.

## Properties

### delay

> `readonly` **delay**: `number`

Defined in: [async/types.ts:117](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L117)

Delay in milliseconds to wait before invoking the function.

***

### leading?

> `readonly` `optional` **leading**: `boolean`

Defined in: [async/types.ts:123](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L123)

Whether to invoke the function on the leading edge.

#### Default

```ts
false
```

***

### trailing?

> `readonly` `optional` **trailing**: `boolean`

Defined in: [async/types.ts:129](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L129)

Whether to invoke the function on the trailing edge.

#### Default

```ts
true
```
