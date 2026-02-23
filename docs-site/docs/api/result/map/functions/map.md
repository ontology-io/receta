# Function: map()

## Call Signature

> **map**\<`T`, `U`, `E`\>(`result`, `fn`): [`Result`](../../types/type-aliases/Result.md)\<`U`, `E`\>

Defined in: [result/map/index.ts:35](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/map/index.ts#L35)

Maps over the Ok value of a Result.

If the Result is Ok, applies the function to its value and returns a new Ok.
If the Result is Err, returns the Err unchanged.

This is the functor map operation for Result.

### Type Parameters

#### T

`T`

#### U

`U`

#### E

`E`

### Parameters

#### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The Result to map over

#### fn

(`value`) => `U`

Function to transform the Ok value

### Returns

[`Result`](../../types/type-aliases/Result.md)\<`U`, `E`\>

A new Result with the transformed value

### Example

```typescript
// Data-first
map(ok(5), x => x * 2) // => Ok(10)
map(err('fail'), x => x * 2) // => Err('fail')

// Data-last (in pipe)
pipe(
  ok(5),
  map(x => x * 2),
  map(x => x + 1)
) // => Ok(11)
```

### See

 - mapErr - for transforming the error value
 - flatMap - for chaining Results

## Call Signature

> **map**\<`T`, `U`\>(`fn`): \<`E`\>(`result`) => [`Result`](../../types/type-aliases/Result.md)\<`U`, `E`\>

Defined in: [result/map/index.ts:36](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/map/index.ts#L36)

Maps over the Ok value of a Result.

If the Result is Ok, applies the function to its value and returns a new Ok.
If the Result is Err, returns the Err unchanged.

This is the functor map operation for Result.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### fn

(`value`) => `U`

Function to transform the Ok value

### Returns

A new Result with the transformed value

> \<`E`\>(`result`): [`Result`](../../types/type-aliases/Result.md)\<`U`, `E`\>

#### Type Parameters

##### E

`E`

#### Parameters

##### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../../types/type-aliases/Result.md)\<`U`, `E`\>

### Example

```typescript
// Data-first
map(ok(5), x => x * 2) // => Ok(10)
map(err('fail'), x => x * 2) // => Err('fail')

// Data-last (in pipe)
pipe(
  ok(5),
  map(x => x * 2),
  map(x => x + 1)
) // => Ok(11)
```

### See

 - mapErr - for transforming the error value
 - flatMap - for chaining Results
