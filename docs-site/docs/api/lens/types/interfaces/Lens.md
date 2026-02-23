# Interface: Lens\<S, A\>

Defined in: [lens/types.ts:19](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/lens/types.ts#L19)

A Lens is a composable getter/setter pair for immutable updates.

A lens focuses on a specific part of a data structure, allowing you to
read and update that part without mutating the original structure.

## Example

```typescript
// Lens focusing on a user's name
const nameLens: Lens<User, string> = {
  get: (user) => user.name,
  set: (name) => (user) => ({ ...user, name })
}
```

## Type Parameters

### S

`S`

The source type (the whole data structure)

### A

`A`

The focus type (the part being accessed)

## Properties

### get()

> `readonly` **get**: (`source`) => `A`

Defined in: [lens/types.ts:23](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/lens/types.ts#L23)

Gets the focused value from the source.

#### Parameters

##### source

`S`

#### Returns

`A`

***

### set()

> `readonly` **set**: (`value`) => (`source`) => `S`

Defined in: [lens/types.ts:28](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/lens/types.ts#L28)

Sets the focused value in the source, returning a new source.

#### Parameters

##### value

`A`

#### Returns

> (`source`): `S`

##### Parameters

###### source

`S`

##### Returns

`S`
