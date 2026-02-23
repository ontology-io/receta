# Function: filter()

## Call Signature

> **filter**\<`T`\>(`option`, `predicate`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/filter/index.ts:35](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/filter/index.ts#L35)

Filters an Option based on a predicate.

If the Option is Some and the predicate returns true, returns the Option unchanged.
If the Option is Some and the predicate returns false, returns None.
If the Option is None, returns None unchanged.

### Type Parameters

#### T

`T`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to filter

#### predicate

(`value`) => `boolean`

Function to test the value

### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The filtered Option

### Example

```typescript
// Data-first
filter(some(5), x => x > 0) // => Some(5)
filter(some(-5), x => x > 0) // => None
filter(none(), x => x > 0) // => None

// Data-last (in pipe)
pipe(
  fromNullable(user.age),
  filter(age => age >= 18),
  map(age => `Adult: ${age}`)
)
```

### See

 - map - for transforming values
 - flatMap - for chaining operations

## Call Signature

> **filter**\<`T`\>(`predicate`): (`option`) => [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/filter/index.ts:36](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/filter/index.ts#L36)

Filters an Option based on a predicate.

If the Option is Some and the predicate returns true, returns the Option unchanged.
If the Option is Some and the predicate returns false, returns None.
If the Option is None, returns None unchanged.

### Type Parameters

#### T

`T`

### Parameters

#### predicate

(`value`) => `boolean`

Function to test the value

### Returns

The filtered Option

> (`option`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

### Example

```typescript
// Data-first
filter(some(5), x => x > 0) // => Some(5)
filter(some(-5), x => x > 0) // => None
filter(none(), x => x > 0) // => None

// Data-last (in pipe)
pipe(
  fromNullable(user.age),
  filter(age => age >= 18),
  map(age => `Adult: ${age}`)
)
```

### See

 - map - for transforming values
 - flatMap - for chaining operations
