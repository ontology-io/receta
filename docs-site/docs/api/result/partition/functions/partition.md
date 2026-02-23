# Function: partition()

## Call Signature

> **partition**\<`T`, `E`\>(`results`): \[`T`[], `E`[]\]

Defined in: [result/partition/index.ts:41](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/partition/index.ts#L41)

Separates an array of Results into Ok values and Err values.

Returns a tuple of [okValues, errValues].

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### results

readonly [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>[]

Array of Results to partition

### Returns

\[`T`[], `E`[]\]

Tuple of [array of Ok values, array of Err values]

### Example

```typescript
const results = [
  ok(1),
  err('fail1'),
  ok(2),
  err('fail2'),
  ok(3)
]

partition(results)
// => [[1, 2, 3], ['fail1', 'fail2']]

// Practical use case: bulk validation
const [validUsers, errors] = pipe(
  rawUsers,
  R.map(validateUser),
  partition
)

if (errors.length > 0) {
  console.log('Validation errors:', errors)
}
console.log('Valid users:', validUsers)
```

### See

collect - for short-circuiting on first error

## Call Signature

> **partition**\<`T`\>(): \<`E`\>(`results`) => \[`T`[], `E`[]\]

Defined in: [result/partition/index.ts:42](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/partition/index.ts#L42)

Separates an array of Results into Ok values and Err values.

Returns a tuple of [okValues, errValues].

### Type Parameters

#### T

`T`

### Returns

Tuple of [array of Ok values, array of Err values]

> \<`E`\>(`results`): \[`T`[], `E`[]\]

#### Type Parameters

##### E

`E`

#### Parameters

##### results

readonly [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>[]

#### Returns

\[`T`[], `E`[]\]

### Example

```typescript
const results = [
  ok(1),
  err('fail1'),
  ok(2),
  err('fail2'),
  ok(3)
]

partition(results)
// => [[1, 2, 3], ['fail1', 'fail2']]

// Practical use case: bulk validation
const [validUsers, errors] = pipe(
  rawUsers,
  R.map(validateUser),
  partition
)

if (errors.length > 0) {
  console.log('Validation errors:', errors)
}
console.log('Valid users:', validUsers)
```

### See

collect - for short-circuiting on first error
