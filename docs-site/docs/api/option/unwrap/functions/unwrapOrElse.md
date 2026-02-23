# Function: unwrapOrElse()

## Call Signature

> **unwrapOrElse**\<`T`\>(`option`, `fn`): `T`

Defined in: [option/unwrap/index.ts:99](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/unwrap/index.ts#L99)

Extracts the value from an Option or computes a default.

If the Option is Some, returns the value.
If the Option is None, calls the function to compute a default.

Use this when the default value is expensive to compute.

### Type Parameters

#### T

`T`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to unwrap

#### fn

() => `T`

Function to compute default value

### Returns

`T`

The value or computed default

### Example

```typescript
// Data-first
unwrapOrElse(some(42), () => expensiveComputation()) // => 42
unwrapOrElse(none(), () => expensiveComputation()) // => computed value

// Data-last (in pipe)
pipe(
  config.get('timeout'),
  unwrapOrElse(() => DEFAULT_TIMEOUT)
)
```

### See

 - unwrapOr - for simple default values
 - unwrap - for throwing on None

## Call Signature

> **unwrapOrElse**\<`T`\>(`fn`): (`option`) => `T`

Defined in: [option/unwrap/index.ts:100](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/unwrap/index.ts#L100)

Extracts the value from an Option or computes a default.

If the Option is Some, returns the value.
If the Option is None, calls the function to compute a default.

Use this when the default value is expensive to compute.

### Type Parameters

#### T

`T`

### Parameters

#### fn

() => `T`

Function to compute default value

### Returns

The value or computed default

> (`option`): `T`

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

`T`

### Example

```typescript
// Data-first
unwrapOrElse(some(42), () => expensiveComputation()) // => 42
unwrapOrElse(none(), () => expensiveComputation()) // => computed value

// Data-last (in pipe)
pipe(
  config.get('timeout'),
  unwrapOrElse(() => DEFAULT_TIMEOUT)
)
```

### See

 - unwrapOr - for simple default values
 - unwrap - for throwing on None
