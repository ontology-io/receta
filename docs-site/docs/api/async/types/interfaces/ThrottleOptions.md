# Interface: ThrottleOptions

Defined in: [async/types.ts:135](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L135)

Options for throttle operations.

## Properties

### delay

> `readonly` **delay**: `number`

Defined in: [async/types.ts:139](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L139)

Delay in milliseconds between function invocations.

***

### leading?

> `readonly` `optional` **leading**: `boolean`

Defined in: [async/types.ts:145](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L145)

Whether to invoke the function on the leading edge.

#### Default

```ts
true
```

***

### trailing?

> `readonly` `optional` **trailing**: `boolean`

Defined in: [async/types.ts:151](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/types.ts#L151)

Whether to invoke the function on the trailing edge.

#### Default

```ts
true
```
