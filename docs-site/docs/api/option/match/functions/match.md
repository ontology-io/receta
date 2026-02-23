# Function: match()

## Call Signature

> **match**\<`T`, `R`\>(`option`, `patterns`): `R`

Defined in: [option/match/index.ts:41](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/match/index.ts#L41)

Pattern matching for Options.

Provides a clean way to handle both Some and None cases.

### Type Parameters

#### T

`T`

#### R

`R`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to match on

#### patterns

Object with onSome and onNone handlers

##### onNone

() => `R`

##### onSome

(`value`) => `R`

### Returns

`R`

The result of the matched handler

### Example

```typescript
// Data-first
const message = match(findUser(id), {
  onSome: user => `Hello, ${user.name}`,
  onNone: () => 'User not found'
})

// Data-last (in pipe)
pipe(
  config.get('theme'),
  match({
    onSome: theme => applyTheme(theme),
    onNone: () => applyDefaultTheme()
  })
)

// With different return types
const status = match(maybeUser, {
  onSome: () => 200,
  onNone: () => 404
})
```

### See

 - unwrapOr - for simple default values
 - unwrapOrElse - for computed defaults

## Call Signature

> **match**\<`T`, `R`\>(`patterns`): (`option`) => `R`

Defined in: [option/match/index.ts:48](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/match/index.ts#L48)

Pattern matching for Options.

Provides a clean way to handle both Some and None cases.

### Type Parameters

#### T

`T`

#### R

`R`

### Parameters

#### patterns

Object with onSome and onNone handlers

##### onNone

() => `R`

##### onSome

(`value`) => `R`

### Returns

The result of the matched handler

> (`option`): `R`

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

`R`

### Example

```typescript
// Data-first
const message = match(findUser(id), {
  onSome: user => `Hello, ${user.name}`,
  onNone: () => 'User not found'
})

// Data-last (in pipe)
pipe(
  config.get('theme'),
  match({
    onSome: theme => applyTheme(theme),
    onNone: () => applyDefaultTheme()
  })
)

// With different return types
const status = match(maybeUser, {
  onSome: () => 200,
  onNone: () => 404
})
```

### See

 - unwrapOr - for simple default values
 - unwrapOrElse - for computed defaults
