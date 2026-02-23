# Function: collect()

## Call Signature

> **collect**\<`T`, `E`\>(`results`): [`Result`](../../types/type-aliases/Result.md)\<`T`[], `E`\>

Defined in: [result/collect/index.ts:42](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/collect/index.ts#L42)

Collects an array of Results into a single Result of an array.

If all Results are Ok, returns Ok with an array of all values.
If any Result is Err, returns the first Err encountered.

This is useful for validating multiple independent operations and
collecting all successes or short-circuiting on the first error.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### results

readonly [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>[]

Array of Results to collect

### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`[], `E`\>

Result containing array of all values, or first error

### Example

```typescript
// All successful
collect([ok(1), ok(2), ok(3)])
// => Ok([1, 2, 3])

// First error short-circuits
collect([ok(1), err('fail'), ok(3)])
// => Err('fail')

// Practical use case
const validateUser = (data: unknown) => pipe(
  [
    validateName(data.name),
    validateEmail(data.email),
    validateAge(data.age)
  ],
  collect,
  map(([name, email, age]) => ({ name, email, age }))
)
```

### See

partition - for separating Ok and Err values

## Call Signature

> **collect**\<`T`\>(): \<`E`\>(`results`) => [`Result`](../../types/type-aliases/Result.md)\<`T`[], `E`\>

Defined in: [result/collect/index.ts:43](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/collect/index.ts#L43)

Collects an array of Results into a single Result of an array.

If all Results are Ok, returns Ok with an array of all values.
If any Result is Err, returns the first Err encountered.

This is useful for validating multiple independent operations and
collecting all successes or short-circuiting on the first error.

### Type Parameters

#### T

`T`

### Returns

Result containing array of all values, or first error

> \<`E`\>(`results`): [`Result`](../../types/type-aliases/Result.md)\<`T`[], `E`\>

#### Type Parameters

##### E

`E`

#### Parameters

##### results

readonly [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>[]

#### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`[], `E`\>

### Example

```typescript
// All successful
collect([ok(1), ok(2), ok(3)])
// => Ok([1, 2, 3])

// First error short-circuits
collect([ok(1), err('fail'), ok(3)])
// => Err('fail')

// Practical use case
const validateUser = (data: unknown) => pipe(
  [
    validateName(data.name),
    validateEmail(data.email),
    validateAge(data.age)
  ],
  collect,
  map(([name, email, age]) => ({ name, email, age }))
)
```

### See

partition - for separating Ok and Err values
