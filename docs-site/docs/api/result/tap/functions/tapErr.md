# Function: tapErr()

## Call Signature

> **tapErr**\<`T`, `E`\>(`result`, `fn`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

Defined in: [result/tap/index.ts:75](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/tap/index.ts#L75)

Performs a side effect with the Err value without modifying the Result.

Useful for error logging or monitoring while keeping the error flowing
through the pipeline.

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

(`error`) => `void`

Side effect function to call with the Err value

### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The original Result unchanged

### Example

```typescript
// Data-first
tapErr(ok(42), e => console.error(e)) // no log, returns Ok(42)
tapErr(err('fail'), e => console.error('Error:', e)) // logs, returns Err('fail')

// Data-last (in pipe) - error monitoring
pipe(
  parseConfig(str),
  tapErr(error => {
    logError(error)
    sendToMonitoring(error)
  }),
  mapErr(error => 'Using default config due to error'),
  unwrapOr(defaultConfig)
)
```

### See

tap - for side effects with Ok values

## Call Signature

> **tapErr**\<`E`\>(`fn`): \<`T`\>(`result`) => [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

Defined in: [result/tap/index.ts:76](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/tap/index.ts#L76)

Performs a side effect with the Err value without modifying the Result.

Useful for error logging or monitoring while keeping the error flowing
through the pipeline.

### Type Parameters

#### E

`E`

### Parameters

#### fn

(`error`) => `void`

Side effect function to call with the Err value

### Returns

The original Result unchanged

> \<`T`\>(`result`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

### Example

```typescript
// Data-first
tapErr(ok(42), e => console.error(e)) // no log, returns Ok(42)
tapErr(err('fail'), e => console.error('Error:', e)) // logs, returns Err('fail')

// Data-last (in pipe) - error monitoring
pipe(
  parseConfig(str),
  tapErr(error => {
    logError(error)
    sendToMonitoring(error)
  }),
  mapErr(error => 'Using default config due to error'),
  unwrapOr(defaultConfig)
)
```

### See

tap - for side effects with Ok values
