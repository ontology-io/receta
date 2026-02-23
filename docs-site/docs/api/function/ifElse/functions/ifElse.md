# Function: ifElse()

## Call Signature

> **ifElse**\<`T`, `U`\>(`predicate`, `onTrue`, `onFalse`): (`value`) => `U`

Defined in: [function/ifElse/index.ts:48](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/ifElse/index.ts#L48)

Creates a function that conditionally applies one of two functions based on a predicate.

Returns a function that tests its input against the predicate, then applies
either `onTrue` if the predicate passes, or `onFalse` if it fails.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### predicate

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

#### onTrue

[`Mapper`](../../types/type-aliases/Mapper.md)\<`T`, `U`\>

#### onFalse

[`Mapper`](../../types/type-aliases/Mapper.md)\<`T`, `U`\>

### Returns

> (`value`): `U`

#### Parameters

##### value

`T`

#### Returns

`U`

### Examples

```typescript
const classify = ifElse(
  (n: number) => n >= 0,
  (n) => 'positive',
  (n) => 'negative'
)

classify(5)   // => 'positive'
classify(-3)  // => 'negative'
classify(0)   // => 'positive'
```

```typescript
// Data-first signature
const result = ifElse(
  (age: number) => age >= 18,
  (age) => ({ status: 'adult', age }),
  (age) => ({ status: 'minor', age }),
  25
)
// => { status: 'adult', age: 25 }
```

```typescript
// In a pipe
pipe(
  fetchUser(),
  ifElse(
    (user) => user.role === 'admin',
    (user) => grantFullAccess(user),
    (user) => grantLimitedAccess(user)
  )
)
```

## Call Signature

> **ifElse**\<`T`, `U`\>(`predicate`, `onTrue`, `onFalse`, `value`): `U`

Defined in: [function/ifElse/index.ts:53](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/ifElse/index.ts#L53)

Creates a function that conditionally applies one of two functions based on a predicate.

Returns a function that tests its input against the predicate, then applies
either `onTrue` if the predicate passes, or `onFalse` if it fails.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### predicate

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

#### onTrue

[`Mapper`](../../types/type-aliases/Mapper.md)\<`T`, `U`\>

#### onFalse

[`Mapper`](../../types/type-aliases/Mapper.md)\<`T`, `U`\>

#### value

`T`

### Returns

`U`

### Examples

```typescript
const classify = ifElse(
  (n: number) => n >= 0,
  (n) => 'positive',
  (n) => 'negative'
)

classify(5)   // => 'positive'
classify(-3)  // => 'negative'
classify(0)   // => 'positive'
```

```typescript
// Data-first signature
const result = ifElse(
  (age: number) => age >= 18,
  (age) => ({ status: 'adult', age }),
  (age) => ({ status: 'minor', age }),
  25
)
// => { status: 'adult', age: 25 }
```

```typescript
// In a pipe
pipe(
  fetchUser(),
  ifElse(
    (user) => user.role === 'admin',
    (user) => grantFullAccess(user),
    (user) => grantLimitedAccess(user)
  )
)
```
