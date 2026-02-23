# Function: flatten()

## Call Signature

> **flatten**\<`T`, `E`, `F`\>(`result`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `E` \| `F`\>

Defined in: [result/flatten/index.ts:29](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/flatten/index.ts#L29)

Flattens a nested Result one level.

Converts Result<Result<T, E>, E> to Result<T, E>.

### Type Parameters

#### T

`T`

#### E

`E`

#### F

`F`

### Parameters

#### result

[`Result`](../../types/type-aliases/Result.md)\<[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>, `F`\>

A Result containing another Result

### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E` \| `F`\>

The inner Result

### Example

```typescript
// Data-first
flatten(ok(ok(42))) // => Ok(42)
flatten(ok(err('inner'))) // => Err('inner')
flatten(err('outer')) // => Err('outer')

// Data-last (in pipe)
pipe(
  ok(ok(42)),
  flatten
) // => Ok(42)
```

### See

flatMap - for chaining Result-returning functions

## Call Signature

> **flatten**\<`T`, `E`\>(): \<`F`\>(`result`) => [`Result`](../../types/type-aliases/Result.md)\<`T`, `E` \| `F`\>

Defined in: [result/flatten/index.ts:30](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/flatten/index.ts#L30)

Flattens a nested Result one level.

Converts Result<Result<T, E>, E> to Result<T, E>.

### Type Parameters

#### T

`T`

#### E

`E`

### Returns

The inner Result

> \<`F`\>(`result`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `E` \| `F`\>

#### Type Parameters

##### F

`F`

#### Parameters

##### result

[`Result`](../../types/type-aliases/Result.md)\<[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>, `F`\>

#### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E` \| `F`\>

### Example

```typescript
// Data-first
flatten(ok(ok(42))) // => Ok(42)
flatten(ok(err('inner'))) // => Err('inner')
flatten(err('outer')) // => Err('outer')

// Data-last (in pipe)
pipe(
  ok(ok(42)),
  flatten
) // => Ok(42)
```

### See

flatMap - for chaining Result-returning functions
