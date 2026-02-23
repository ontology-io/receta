# Function: toNullable()

## Call Signature

> **toNullable**\<`T`\>(`option`): `T` \| `null`

Defined in: [option/toNullable/index.ts:38](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/toNullable/index.ts#L38)

Converts an Option to a nullable value.

If the Option is Some, returns the value.
If the Option is None, returns null.

Use this when interfacing with APIs that expect null for missing values.

### Type Parameters

#### T

`T`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to convert

### Returns

`T` \| `null`

The value or null

### Example

```typescript
// Data-first
toNullable(some(42)) // => 42
toNullable(none()) // => null

// Data-last (in pipe)
pipe(
  findUser(id),
  map(u => u.name),
  toNullable
) // => 'John' or null

// Interfacing with external API
const apiPayload = {
  userId: pipe(maybeUserId, toNullable),
  metadata: pipe(maybeMetadata, toNullable)
}
```

### See

fromNullable - for converting nullable values to Option

## Call Signature

> **toNullable**\<`T`\>(): (`option`) => `T` \| `null`

Defined in: [option/toNullable/index.ts:39](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/toNullable/index.ts#L39)

Converts an Option to a nullable value.

If the Option is Some, returns the value.
If the Option is None, returns null.

Use this when interfacing with APIs that expect null for missing values.

### Type Parameters

#### T

`T`

### Returns

The value or null

> (`option`): `T` \| `null`

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

`T` \| `null`

### Example

```typescript
// Data-first
toNullable(some(42)) // => 42
toNullable(none()) // => null

// Data-last (in pipe)
pipe(
  findUser(id),
  map(u => u.name),
  toNullable
) // => 'John' or null

// Interfacing with external API
const apiPayload = {
  userId: pipe(maybeUserId, toNullable),
  metadata: pipe(maybeMetadata, toNullable)
}
```

### See

fromNullable - for converting nullable values to Option
