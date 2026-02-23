# Function: tap()

## Call Signature

> **tap**\<`T`, `E`\>(`result`, `fn`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

Defined in: [result/tap/index.ts:32](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/tap/index.ts#L32)

Performs a side effect with the Ok value without modifying the Result.

Useful for logging, debugging, or performing side effects in a pipeline
while keeping the Result unchanged.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The Result to tap into

#### fn

(`value`) => `void`

Side effect function to call with the Ok value

### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The original Result unchanged

### Example

```typescript
// Data-first
tap(ok(42), n => console.log('Got:', n)) // logs 'Got: 42', returns Ok(42)
tap(err('fail'), n => console.log(n)) // no log, returns Err('fail')

// Data-last (in pipe) - debugging
pipe(
  fetchUser(id),
  tap(user => console.log('Fetched user:', user.name)),
  map(user => user.email),
  tap(email => console.log('Email:', email))
)
```

### See

tapErr - for side effects with Err values

## Call Signature

> **tap**\<`T`\>(`fn`): \<`E`\>(`result`) => [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

Defined in: [result/tap/index.ts:33](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/tap/index.ts#L33)

Performs a side effect with the Ok value without modifying the Result.

Useful for logging, debugging, or performing side effects in a pipeline
while keeping the Result unchanged.

### Type Parameters

#### T

`T`

### Parameters

#### fn

(`value`) => `void`

Side effect function to call with the Ok value

### Returns

The original Result unchanged

> \<`E`\>(`result`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

#### Type Parameters

##### E

`E`

#### Parameters

##### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

### Example

```typescript
// Data-first
tap(ok(42), n => console.log('Got:', n)) // logs 'Got: 42', returns Ok(42)
tap(err('fail'), n => console.log(n)) // no log, returns Err('fail')

// Data-last (in pipe) - debugging
pipe(
  fetchUser(id),
  tap(user => console.log('Fetched user:', user.name)),
  map(user => user.email),
  tap(email => console.log('Email:', email))
)
```

### See

tapErr - for side effects with Err values
