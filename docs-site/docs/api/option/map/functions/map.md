# Function: map()

## Call Signature

> **map**\<`T`, `U`\>(`option`, `fn`): [`Option`](../../types/type-aliases/Option.md)\<`U`\>

Defined in: [option/map/index.ts:35](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/map/index.ts#L35)

Maps over the Some value of an Option.

If the Option is Some, applies the function to its value and returns a new Some.
If the Option is None, returns None unchanged.

This is the functor map operation for Option.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to map over

#### fn

(`value`) => `U`

Function to transform the Some value

### Returns

[`Option`](../../types/type-aliases/Option.md)\<`U`\>

A new Option with the transformed value

### Example

```typescript
// Data-first
map(some(5), x => x * 2) // => Some(10)
map(none(), x => x * 2) // => None

// Data-last (in pipe)
pipe(
  some(5),
  map(x => x * 2),
  map(x => x + 1)
) // => Some(11)
```

### See

 - flatMap - for chaining Option-returning functions
 - filter - for conditionally keeping values

## Call Signature

> **map**\<`T`, `U`\>(`fn`): (`option`) => [`Option`](../../types/type-aliases/Option.md)\<`U`\>

Defined in: [option/map/index.ts:36](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/map/index.ts#L36)

Maps over the Some value of an Option.

If the Option is Some, applies the function to its value and returns a new Some.
If the Option is None, returns None unchanged.

This is the functor map operation for Option.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### fn

(`value`) => `U`

Function to transform the Some value

### Returns

A new Option with the transformed value

> (`option`): [`Option`](../../types/type-aliases/Option.md)\<`U`\>

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

[`Option`](../../types/type-aliases/Option.md)\<`U`\>

### Example

```typescript
// Data-first
map(some(5), x => x * 2) // => Some(10)
map(none(), x => x * 2) // => None

// Data-last (in pipe)
pipe(
  some(5),
  map(x => x * 2),
  map(x => x + 1)
) // => Some(11)
```

### See

 - flatMap - for chaining Option-returning functions
 - filter - for conditionally keeping values
