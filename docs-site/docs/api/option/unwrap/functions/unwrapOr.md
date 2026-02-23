# Function: unwrapOr()

## Call Signature

> **unwrapOr**\<`T`\>(`option`, `defaultValue`): `T`

Defined in: [option/unwrap/index.ts:61](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/unwrap/index.ts#L61)

Extracts the value from an Option or returns a default.

If the Option is Some, returns the value.
If the Option is None, returns the default value.

### Type Parameters

#### T

`T`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to unwrap

#### defaultValue

`T`

Value to return if None

### Returns

`T`

The value or default

### Example

```typescript
// Data-first
unwrapOr(some(42), 0) // => 42
unwrapOr(none(), 0) // => 0

// Data-last (in pipe)
pipe(
  findUser(id),
  map(u => u.name),
  unwrapOr('Guest')
) // => 'John' or 'Guest'
```

### See

 - unwrapOrElse - for computing the default value lazily
 - unwrap - for throwing on None

## Call Signature

> **unwrapOr**\<`T`\>(`defaultValue`): (`option`) => `T`

Defined in: [option/unwrap/index.ts:62](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/unwrap/index.ts#L62)

Extracts the value from an Option or returns a default.

If the Option is Some, returns the value.
If the Option is None, returns the default value.

### Type Parameters

#### T

`T`

### Parameters

#### defaultValue

`T`

Value to return if None

### Returns

The value or default

> (`option`): `T`

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

`T`

### Example

```typescript
// Data-first
unwrapOr(some(42), 0) // => 42
unwrapOr(none(), 0) // => 0

// Data-last (in pipe)
pipe(
  findUser(id),
  map(u => u.name),
  unwrapOr('Guest')
) // => 'John' or 'Guest'
```

### See

 - unwrapOrElse - for computing the default value lazily
 - unwrap - for throwing on None
