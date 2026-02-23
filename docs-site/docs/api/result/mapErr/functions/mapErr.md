# Function: mapErr()

## Call Signature

> **mapErr**\<`T`, `E`, `F`\>(`result`, `fn`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `F`\>

Defined in: [result/mapErr/index.ts:37](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/mapErr/index.ts#L37)

Maps over the Err value of a Result.

If the Result is Err, applies the function to its error and returns a new Err.
If the Result is Ok, returns the Ok unchanged.

Useful for transforming or enriching error values.

### Type Parameters

#### T

`T`

#### E

`E`

#### F

`F`

### Parameters

#### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The Result to map over

#### fn

(`error`) => `F`

Function to transform the Err value

### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `F`\>

A new Result with the transformed error

### Example

```typescript
// Data-first
mapErr(err('fail'), e => `Error: ${e}`) // => Err('Error: fail')
mapErr(ok(5), e => `Error: ${e}`) // => Ok(5)

// Data-last (in pipe)
pipe(
  parseJSON(str),
  mapErr(e => ({
    code: 'PARSE_ERROR',
    message: e.message,
    timestamp: Date.now()
  }))
)
```

### See

map - for transforming the success value

## Call Signature

> **mapErr**\<`E`, `F`\>(`fn`): \<`T`\>(`result`) => [`Result`](../../types/type-aliases/Result.md)\<`T`, `F`\>

Defined in: [result/mapErr/index.ts:38](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/mapErr/index.ts#L38)

Maps over the Err value of a Result.

If the Result is Err, applies the function to its error and returns a new Err.
If the Result is Ok, returns the Ok unchanged.

Useful for transforming or enriching error values.

### Type Parameters

#### E

`E`

#### F

`F`

### Parameters

#### fn

(`error`) => `F`

Function to transform the Err value

### Returns

A new Result with the transformed error

> \<`T`\>(`result`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `F`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `F`\>

### Example

```typescript
// Data-first
mapErr(err('fail'), e => `Error: ${e}`) // => Err('Error: fail')
mapErr(ok(5), e => `Error: ${e}`) // => Ok(5)

// Data-last (in pipe)
pipe(
  parseJSON(str),
  mapErr(e => ({
    code: 'PARSE_ERROR',
    message: e.message,
    timestamp: Date.now()
  }))
)
```

### See

map - for transforming the success value
