# Function: flatMap()

## Call Signature

> **flatMap**\<`T`, `U`\>(`option`, `fn`): [`Option`](../../types/type-aliases/Option.md)\<`U`\>

Defined in: [option/flatMap/index.ts:37](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/flatMap/index.ts#L37)

Chains Option-returning functions.

If the Option is Some, applies the function to its value.
If the Option is None, returns None unchanged.

This is the monadic bind operation for Option, used to avoid nested Options.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to flat map over

#### fn

(`value`) => [`Option`](../../types/type-aliases/Option.md)\<`U`\>

Function that returns a new Option

### Returns

[`Option`](../../types/type-aliases/Option.md)\<`U`\>

The resulting Option

### Example

```typescript
// Data-first
const findUser = (id: string): Option<User> => ...
const getEmail = (user: User): Option<string> => ...

flatMap(findUser('123'), getEmail)
// => Some('user@example.com') or None

// Data-last (in pipe)
pipe(
  findUser('123'),
  flatMap(getEmail),
  flatMap(validateEmail)
)
```

### See

 - map - for transforming values without nesting
 - flatten - for flattening nested Options

## Call Signature

> **flatMap**\<`T`, `U`\>(`fn`): (`option`) => [`Option`](../../types/type-aliases/Option.md)\<`U`\>

Defined in: [option/flatMap/index.ts:38](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/flatMap/index.ts#L38)

Chains Option-returning functions.

If the Option is Some, applies the function to its value.
If the Option is None, returns None unchanged.

This is the monadic bind operation for Option, used to avoid nested Options.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### fn

(`value`) => [`Option`](../../types/type-aliases/Option.md)\<`U`\>

Function that returns a new Option

### Returns

The resulting Option

> (`option`): [`Option`](../../types/type-aliases/Option.md)\<`U`\>

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

[`Option`](../../types/type-aliases/Option.md)\<`U`\>

### Example

```typescript
// Data-first
const findUser = (id: string): Option<User> => ...
const getEmail = (user: User): Option<string> => ...

flatMap(findUser('123'), getEmail)
// => Some('user@example.com') or None

// Data-last (in pipe)
pipe(
  findUser('123'),
  flatMap(getEmail),
  flatMap(validateEmail)
)
```

### See

 - map - for transforming values without nesting
 - flatten - for flattening nested Options
