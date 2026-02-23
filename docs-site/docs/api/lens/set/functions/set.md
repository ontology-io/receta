# Function: set()

## Call Signature

> **set**\<`S`, `A`\>(`l`, `value`, `source`): `S`

Defined in: [lens/set/index.ts:59](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/lens/set/index.ts#L59)

Sets a new value through a Lens, returning an updated source object.

This creates a new object with the focused value updated, without mutating
the original. The update is immutable and type-safe.

Supports both data-first and data-last (for use in pipes).

### Type Parameters

#### S

`S`

#### A

`A`

### Parameters

#### l

[`Lens`](../../types/interfaces/Lens.md)\<`S`, `A`\>

The Lens to set through

#### value

`A`

The new value to set

#### source

`S`

The source object to update

### Returns

`S`

A new source object with the focused value updated

### Examples

```typescript
// Data-first
const nameLens = prop<User>('name')
const user = { name: 'Alice', age: 30 }

set(nameLens, 'Bob', user)
// => { name: 'Bob', age: 30 }
// Original user is unchanged
```

```typescript
// Data-last (in pipe)
import * as R from 'remeda'

const updated = R.pipe(
  user,
  set(prop<User>('name'), 'Bob')
) // { name: 'Bob', age: 30 }
```

```typescript
// With nested lenses
const cityLens = path<User, string>('address.city')
const user = {
  name: 'Alice',
  address: { street: '123 Main', city: 'Boston', zip: '02101' }
}

set(cityLens, 'NYC', user)
// => {
//   name: 'Alice',
//   address: { street: '123 Main', city: 'NYC', zip: '02101' }
// }
```

### See

 - view - To read through a lens
 - over - To transform through a lens
 - prop - To create a property lens

## Call Signature

> **set**\<`S`, `A`\>(`l`, `value`): (`source`) => `S`

Defined in: [lens/set/index.ts:60](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/lens/set/index.ts#L60)

Sets a new value through a Lens, returning an updated source object.

This creates a new object with the focused value updated, without mutating
the original. The update is immutable and type-safe.

Supports both data-first and data-last (for use in pipes).

### Type Parameters

#### S

`S`

#### A

`A`

### Parameters

#### l

[`Lens`](../../types/interfaces/Lens.md)\<`S`, `A`\>

The Lens to set through

#### value

`A`

The new value to set

### Returns

A new source object with the focused value updated

> (`source`): `S`

#### Parameters

##### source

`S`

#### Returns

`S`

### Examples

```typescript
// Data-first
const nameLens = prop<User>('name')
const user = { name: 'Alice', age: 30 }

set(nameLens, 'Bob', user)
// => { name: 'Bob', age: 30 }
// Original user is unchanged
```

```typescript
// Data-last (in pipe)
import * as R from 'remeda'

const updated = R.pipe(
  user,
  set(prop<User>('name'), 'Bob')
) // { name: 'Bob', age: 30 }
```

```typescript
// With nested lenses
const cityLens = path<User, string>('address.city')
const user = {
  name: 'Alice',
  address: { street: '123 Main', city: 'Boston', zip: '02101' }
}

set(cityLens, 'NYC', user)
// => {
//   name: 'Alice',
//   address: { street: '123 Main', city: 'NYC', zip: '02101' }
// }
```

### See

 - view - To read through a lens
 - over - To transform through a lens
 - prop - To create a property lens
