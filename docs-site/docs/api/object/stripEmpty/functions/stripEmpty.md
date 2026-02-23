# Function: stripEmpty()

## Call Signature

> **stripEmpty**(`obj`, `options?`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/stripEmpty/index.ts:163](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/stripEmpty/index.ts#L163)

Removes all empty values from an object.

By default, removes:
- null and undefined
- Empty strings ('')
- Empty arrays ([])
- Empty objects ({})

This is useful for cleaning API payloads, removing optional fields before
sending data, and normalizing objects for comparison or storage.

### Parameters

#### obj

[`PlainObject`](../../types/type-aliases/PlainObject.md)

The object to strip empty values from

#### options?

[`StripEmptyOptions`](../interfaces/StripEmptyOptions.md)

Options controlling what is considered "empty"

### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

A new object with empty values removed

### Example

```typescript
// Basic usage
const input = {
  name: 'Alice',
  email: '',
  tags: [],
  metadata: {},
  age: null,
  verified: false
}

stripEmpty(input)
// => { name: 'Alice', verified: false }

// Keeps non-empty values (0, false are not empty)
stripEmpty({ count: 0, active: false, name: '' })
// => { count: 0, active: false }

// Deep cleaning of nested objects
const nested = {
  user: {
    name: 'Alice',
    bio: '',
    settings: {
      theme: null,
      notifications: []
    }
  },
  metadata: {}
}

stripEmpty(nested)
// => { user: { name: 'Alice', settings: {} } }
// Note: settings is empty but kept because stripEmptyObjects applies to top-level

// Customize what to strip
stripEmpty(
  { name: '', tags: [], count: 0 },
  { stripEmptyStrings: false, stripEmptyArrays: true }
)
// => { name: '', count: 0 }

// Preparing API request payload
const formData = {
  title: 'New Post',
  body: 'Content here',
  tags: [],
  draft: false,
  publishedAt: null
}

pipe(
  formData,
  stripEmpty,
  (clean) => fetch('/api/posts', { method: 'POST', body: JSON.stringify(clean) })
)
// Sends: { title: 'New Post', body: 'Content here', draft: false }

// Shallow stripping (not recursive)
stripEmpty(
  {
    name: 'Alice',
    nested: { bio: '', age: null }
  },
  { deep: false }
)
// => { name: 'Alice', nested: { bio: '', age: null } }

// Data-last (in pipe)
pipe(
  apiPayload,
  stripEmpty()
)
```

### See

 - compact - for removing only null/undefined (keeps empty strings/arrays)
 - stripUndefined - for removing only undefined values

## Call Signature

> **stripEmpty**(`options?`): (`obj`) => [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/stripEmpty/index.ts:164](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/stripEmpty/index.ts#L164)

Removes all empty values from an object.

By default, removes:
- null and undefined
- Empty strings ('')
- Empty arrays ([])
- Empty objects ({})

This is useful for cleaning API payloads, removing optional fields before
sending data, and normalizing objects for comparison or storage.

### Parameters

#### options?

[`StripEmptyOptions`](../interfaces/StripEmptyOptions.md)

Options controlling what is considered "empty"

### Returns

A new object with empty values removed

> (`obj`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### obj

[`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

### Example

```typescript
// Basic usage
const input = {
  name: 'Alice',
  email: '',
  tags: [],
  metadata: {},
  age: null,
  verified: false
}

stripEmpty(input)
// => { name: 'Alice', verified: false }

// Keeps non-empty values (0, false are not empty)
stripEmpty({ count: 0, active: false, name: '' })
// => { count: 0, active: false }

// Deep cleaning of nested objects
const nested = {
  user: {
    name: 'Alice',
    bio: '',
    settings: {
      theme: null,
      notifications: []
    }
  },
  metadata: {}
}

stripEmpty(nested)
// => { user: { name: 'Alice', settings: {} } }
// Note: settings is empty but kept because stripEmptyObjects applies to top-level

// Customize what to strip
stripEmpty(
  { name: '', tags: [], count: 0 },
  { stripEmptyStrings: false, stripEmptyArrays: true }
)
// => { name: '', count: 0 }

// Preparing API request payload
const formData = {
  title: 'New Post',
  body: 'Content here',
  tags: [],
  draft: false,
  publishedAt: null
}

pipe(
  formData,
  stripEmpty,
  (clean) => fetch('/api/posts', { method: 'POST', body: JSON.stringify(clean) })
)
// Sends: { title: 'New Post', body: 'Content here', draft: false }

// Shallow stripping (not recursive)
stripEmpty(
  {
    name: 'Alice',
    nested: { bio: '', age: null }
  },
  { deep: false }
)
// => { name: 'Alice', nested: { bio: '', age: null } }

// Data-last (in pipe)
pipe(
  apiPayload,
  stripEmpty()
)
```

### See

 - compact - for removing only null/undefined (keeps empty strings/arrays)
 - stripUndefined - for removing only undefined values
