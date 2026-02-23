# Interface: ResultMatchers\<R\>

Defined in: [testing/types.ts:8](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L8)

Extended Vitest matcher interface for Result types.

## Extended by

- [`RecetaMatchers`](RecetaMatchers.md)

## Type Parameters

### R

`R` = `unknown`

## Methods

### toBeErr()

> **toBeErr**\<`E`\>(`expectedError?`): `R`

Defined in: [testing/types.ts:31](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L31)

Assert that a Result is Err, optionally checking the error.

#### Type Parameters

##### E

`E`

#### Parameters

##### expectedError?

`E`

#### Returns

`R`

#### Example

```typescript
expect(err('fail')).toBeErr()
expect(err('fail')).toBeErr('fail')
expect(ok(5)).not.toBeErr()
```

***

### toBeOk()

> **toBeOk**\<`T`\>(`expectedValue?`): `R`

Defined in: [testing/types.ts:19](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L19)

Assert that a Result is Ok, optionally checking the value.

#### Type Parameters

##### T

`T`

#### Parameters

##### expectedValue?

`T`

#### Returns

`R`

#### Example

```typescript
expect(ok(5)).toBeOk()
expect(ok(5)).toBeOk(5)
expect(err('fail')).not.toBeOk()
```

***

### toEqualResult()

> **toEqualResult**\<`T`, `E`\>(`expected`): `R`

Defined in: [testing/types.ts:42](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L42)

Deep equality check for Result types.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### expected

`unknown`

#### Returns

`R`

#### Example

```typescript
expect(ok(5)).toEqualResult(ok(5))
expect(err('fail')).toEqualResult(err('fail'))
```
