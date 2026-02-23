# Function: flatten()

## Call Signature

> **flatten**\<`T`\>(`option`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/flatten/index.ts:30](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/flatten/index.ts#L30)

Flattens a nested Option.

Converts Option<Option<T>> to Option<T>.

### Type Parameters

#### T

`T`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<[`Option`](../../types/type-aliases/Option.md)\<`T`\>\>

The nested Option to flatten

### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The flattened Option

### Example

```typescript
// Data-first
flatten(some(some(42))) // => Some(42)
flatten(some(none())) // => None
flatten(none()) // => None

// Data-last (in pipe)
pipe(
  some(some(5)),
  flatten,
  map(x => x * 2)
) // => Some(10)
```

### See

flatMap - for mapping and flattening in one step

## Call Signature

> **flatten**\<`T`\>(): (`option`) => [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/flatten/index.ts:31](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/flatten/index.ts#L31)

Flattens a nested Option.

Converts Option<Option<T>> to Option<T>.

### Type Parameters

#### T

`T`

### Returns

The flattened Option

> (`option`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<[`Option`](../../types/type-aliases/Option.md)\<`T`\>\>

#### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

### Example

```typescript
// Data-first
flatten(some(some(42))) // => Some(42)
flatten(some(none())) // => None
flatten(none()) // => None

// Data-last (in pipe)
pipe(
  some(some(5)),
  flatten,
  map(x => x * 2)
) // => Some(10)
```

### See

flatMap - for mapping and flattening in one step
