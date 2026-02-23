# Function: toResult()

## Call Signature

> **toResult**\<`T`, `E`\>(`option`, `error`): [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

Defined in: [option/toResult/index.ts:39](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/toResult/index.ts#L39)

Converts an Option to a Result.

If the Option is Some, returns Ok with the value.
If the Option is None, returns Err with the provided error.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to convert

#### error

`E`

Error value to use if None

### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

Result containing the value or error

### Example

```typescript
// Data-first
toResult(some(42), 'No value') // => Ok(42)
toResult(none(), 'No value') // => Err('No value')

// Data-last (in pipe)
pipe(
  findUser(id),
  toResult({ code: 'USER_NOT_FOUND', message: 'User not found' }),
  flatMap(user => validateUser(user))
)

// With error function
pipe(
  config.get('apiKey'),
  toResult('Missing API key in config')
)
```

### See

fromResult - for converting Result to Option

## Call Signature

> **toResult**\<`E`\>(`error`): \<`T`\>(`option`) => [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

Defined in: [option/toResult/index.ts:40](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/toResult/index.ts#L40)

Converts an Option to a Result.

If the Option is Some, returns Ok with the value.
If the Option is None, returns Err with the provided error.

### Type Parameters

#### E

`E`

### Parameters

#### error

`E`

Error value to use if None

### Returns

Result containing the value or error

> \<`T`\>(`option`): [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

### Example

```typescript
// Data-first
toResult(some(42), 'No value') // => Ok(42)
toResult(none(), 'No value') // => Err('No value')

// Data-last (in pipe)
pipe(
  findUser(id),
  toResult({ code: 'USER_NOT_FOUND', message: 'User not found' }),
  flatMap(user => validateUser(user))
)

// With error function
pipe(
  config.get('apiKey'),
  toResult('Missing API key in config')
)
```

### See

fromResult - for converting Result to Option
