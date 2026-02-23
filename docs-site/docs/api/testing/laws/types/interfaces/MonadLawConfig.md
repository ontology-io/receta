# Interface: MonadLawConfig\<M, A\>

Defined in: [testing/laws/types.ts:90](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L90)

Configuration for testing monad laws.

## Example

```typescript
testMonadLaws({
  type: 'Result',
  of: ok,
  flatMap: Result.flatMap,
  testCases: [
    {
      value: 5,
      functions: [
        (x: number) => ok(x * 2),
        (x: number) => x > 0 ? ok(x) : err('negative')
      ]
    }
  ]
})
```

## Type Parameters

### M

`M`

### A

`A`

## Properties

### equals()?

> `optional` **equals**: (`a`, `b`) => `boolean`

Defined in: [testing/laws/types.ts:114](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L114)

Custom equality function for comparing monad values.
Defaults to deep equality check.

#### Parameters

##### a

`M`

##### b

`M`

#### Returns

`boolean`

***

### flatMap()

> **flatMap**: \<`B`\>(`ma`, `fn`) => `M`

Defined in: [testing/laws/types.ts:108](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L108)

FlatMap (bind, chain) function to test.

#### Type Parameters

##### B

`B`

#### Parameters

##### ma

`M`

##### fn

(`a`) => `M`

#### Returns

`M`

#### Example

```ts
Result.flatMap, Option.flatMap
```

***

### of()

> **of**: (`value`) => `M`

Defined in: [testing/laws/types.ts:101](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L101)

Constructor function to wrap values in the monad.

#### Parameters

##### value

`A`

#### Returns

`M`

#### Example

```ts
ok, some, Just
```

***

### testCases?

> `optional` **testCases**: [`MonadTestCase`](MonadTestCase.md)\<`M`, `A`\>[]

Defined in: [testing/laws/types.ts:120](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L120)

Specific test cases to run.
If not provided, uses default test cases.

***

### type

> **type**: `string`

Defined in: [testing/laws/types.ts:94](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L94)

Name of the type being tested (for test descriptions).
