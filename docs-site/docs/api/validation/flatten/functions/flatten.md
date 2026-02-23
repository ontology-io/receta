# Function: flatten()

## Call Signature

> **flatten**\<`T`, `E`\>(`validation`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Defined in: [validation/flatten/index.ts:53](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/flatten/index.ts#L53)

Flattens a nested Validation<Validation<T, E>, E> to Validation<T, E>.

If the outer validation is Valid containing a Valid, returns the inner Valid.
If the outer validation is Valid containing an Invalid, returns the inner Invalid.
If the outer validation is Invalid, returns it unchanged.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### validation

[`Validation`](../../types/type-aliases/Validation.md)\<[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>, `E`\>

The nested validation to flatten

### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The flattened validation

### Example

```typescript
// Data-first
flatten(valid(valid(5))) // => Valid(5)
flatten(valid(invalid(['error']))) // => Invalid(['error'])
flatten(invalid(['outer error'])) // => Invalid(['outer error'])

// Data-last (in pipe)
pipe(
  valid(valid(5)),
  flatten
) // => Valid(5)

// Real-world: Flatten result of mapping with validator
const validateEmail = (s: string) =>
  s.includes('@') ? valid(s) : invalid('Invalid email')

pipe(
  valid('user@example.com'),
  map(validateEmail),  // => Valid(Valid('user@example.com'))
  flatten              // => Valid('user@example.com')
)

// Note: Usually you'd use flatMap instead
pipe(
  valid('user@example.com'),
  flatMap(validateEmail) // => Valid('user@example.com')
)
```

### See

flatMap - for mapping and flattening in one step

## Call Signature

> **flatten**\<`T`, `E`\>(): (`validation`) => [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Defined in: [validation/flatten/index.ts:54](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/flatten/index.ts#L54)

Flattens a nested Validation<Validation<T, E>, E> to Validation<T, E>.

If the outer validation is Valid containing a Valid, returns the inner Valid.
If the outer validation is Valid containing an Invalid, returns the inner Invalid.
If the outer validation is Invalid, returns it unchanged.

### Type Parameters

#### T

`T`

#### E

`E`

### Returns

The flattened validation

> (`validation`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>, `E`\>

#### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

### Example

```typescript
// Data-first
flatten(valid(valid(5))) // => Valid(5)
flatten(valid(invalid(['error']))) // => Invalid(['error'])
flatten(invalid(['outer error'])) // => Invalid(['outer error'])

// Data-last (in pipe)
pipe(
  valid(valid(5)),
  flatten
) // => Valid(5)

// Real-world: Flatten result of mapping with validator
const validateEmail = (s: string) =>
  s.includes('@') ? valid(s) : invalid('Invalid email')

pipe(
  valid('user@example.com'),
  map(validateEmail),  // => Valid(Valid('user@example.com'))
  flatten              // => Valid('user@example.com')
)

// Note: Usually you'd use flatMap instead
pipe(
  valid('user@example.com'),
  flatMap(validateEmail) // => Valid('user@example.com')
)
```

### See

flatMap - for mapping and flattening in one step
