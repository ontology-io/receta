# Function: collect()

## Call Signature

> **collect**\<`T`\>(`options`): [`Option`](../../types/type-aliases/Option.md)\<`T`[]\>

Defined in: [option/collect/index.ts:45](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/collect/index.ts#L45)

Collects an array of Options into an Option of array.

If all Options are Some, returns Some with array of values.
If any Option is None, returns None.

This is useful for operations that must all succeed.

### Type Parameters

#### T

`T`

### Parameters

#### options

readonly [`Option`](../../types/type-aliases/Option.md)\<`T`\>[]

Array of Options to collect

### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`[]\>

Option containing array of values, or None if any is None

### Example

```typescript
// All Some
collect([some(1), some(2), some(3)])
// => Some([1, 2, 3])

// Any None
collect([some(1), none(), some(3)])
// => None

// Real-world: validating multiple fields
const validateForm = (data: FormData) => {
  const fields = collect([
    validateEmail(data.email),
    validatePassword(data.password),
    validateAge(data.age)
  ])

  return map(fields, ([email, password, age]) => ({
    email,
    password,
    age
  }))
}
```

### See

partition - for separating Some and None values

## Call Signature

> **collect**\<`T`\>(): (`options`) => [`Option`](../../types/type-aliases/Option.md)\<`T`[]\>

Defined in: [option/collect/index.ts:46](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/collect/index.ts#L46)

Collects an array of Options into an Option of array.

If all Options are Some, returns Some with array of values.
If any Option is None, returns None.

This is useful for operations that must all succeed.

### Type Parameters

#### T

`T`

### Returns

Option containing array of values, or None if any is None

> (`options`): [`Option`](../../types/type-aliases/Option.md)\<`T`[]\>

#### Parameters

##### options

readonly [`Option`](../../types/type-aliases/Option.md)\<`T`\>[]

#### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`[]\>

### Example

```typescript
// All Some
collect([some(1), some(2), some(3)])
// => Some([1, 2, 3])

// Any None
collect([some(1), none(), some(3)])
// => None

// Real-world: validating multiple fields
const validateForm = (data: FormData) => {
  const fields = collect([
    validateEmail(data.email),
    validatePassword(data.password),
    validateAge(data.age)
  ])

  return map(fields, ([email, password, age]) => ({
    email,
    password,
    age
  }))
}
```

### See

partition - for separating Some and None values
