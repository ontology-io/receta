# Function: transformKeys()

## Call Signature

> **transformKeys**(`obj`, `transform`, `options?`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/transformKeys/index.ts:219](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/transformKeys/index.ts#L219)

Recursively transforms all keys in an object and its nested structures.

This function is useful for converting API responses between different
naming conventions (e.g., snake_case from Python APIs to camelCase in JS).

Supports deep transformation of nested objects and arrays of objects.

### Parameters

#### obj

[`PlainObject`](../../types/type-aliases/PlainObject.md)

The object whose keys to transform

#### transform

[`KeyTransform`](../type-aliases/KeyTransform.md)

The transformation to apply ('camelCase', 'snakeCase', 'kebabCase', 'pascalCase', or custom function)

#### options?

[`TransformKeysOptions`](../interfaces/TransformKeysOptions.md)

Transformation options

### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

A new object with transformed keys

### Example

```typescript
// Convert snake_case API response to camelCase
const apiResponse = {
  user_id: 123,
  user_profile: {
    first_name: 'Alice',
    last_name: 'Smith',
    contact_info: {
      email_address: 'alice@example.com'
    }
  }
}

transformKeys(apiResponse, 'camelCase')
// => {
//   userId: 123,
//   userProfile: {
//     firstName: 'Alice',
//     lastName: 'Smith',
//     contactInfo: {
//       emailAddress: 'alice@example.com'
//     }
//   }
// }

// Convert camelCase to snake_case for API request
const jsObject = {
  userId: 123,
  userProfile: {
    firstName: 'Alice',
    contactInfo: {
      emailAddress: 'alice@example.com'
    }
  }
}

transformKeys(jsObject, 'snakeCase')
// => {
//   user_id: 123,
//   user_profile: {
//     first_name: 'Alice',
//     contact_info: {
//       email_address: 'alice@example.com'
//     }
//   }
// }

// Transform arrays of objects
const users = {
  user_list: [
    { first_name: 'Alice', user_id: 1 },
    { first_name: 'Bob', user_id: 2 }
  ]
}

transformKeys(users, 'camelCase')
// => {
//   userList: [
//     { firstName: 'Alice', userId: 1 },
//     { firstName: 'Bob', userId: 2 }
//   ]
// }

// Custom transformation function
transformKeys(
  { hello: 'world', foo: 'bar' },
  (key) => key.toUpperCase()
)
// => { HELLO: 'world', FOO: 'bar' }

// Shallow transformation (not recursive)
transformKeys(
  { user_name: 'Alice', user_meta: { created_at: '2024-01-01' } },
  'camelCase',
  { deep: false }
)
// => { userName: 'Alice', userMeta: { created_at: '2024-01-01' } }

// Data-last (in pipe)
pipe(
  fetchUserData(),
  transformKeys('camelCase')
)
```

### See

mapKeys - for shallow key transformation only

## Call Signature

> **transformKeys**(`transform`, `options?`): (`obj`) => [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/transformKeys/index.ts:224](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/transformKeys/index.ts#L224)

Recursively transforms all keys in an object and its nested structures.

This function is useful for converting API responses between different
naming conventions (e.g., snake_case from Python APIs to camelCase in JS).

Supports deep transformation of nested objects and arrays of objects.

### Parameters

#### transform

[`KeyTransform`](../type-aliases/KeyTransform.md)

The transformation to apply ('camelCase', 'snakeCase', 'kebabCase', 'pascalCase', or custom function)

#### options?

[`TransformKeysOptions`](../interfaces/TransformKeysOptions.md)

Transformation options

### Returns

A new object with transformed keys

> (`obj`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### obj

[`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

### Example

```typescript
// Convert snake_case API response to camelCase
const apiResponse = {
  user_id: 123,
  user_profile: {
    first_name: 'Alice',
    last_name: 'Smith',
    contact_info: {
      email_address: 'alice@example.com'
    }
  }
}

transformKeys(apiResponse, 'camelCase')
// => {
//   userId: 123,
//   userProfile: {
//     firstName: 'Alice',
//     lastName: 'Smith',
//     contactInfo: {
//       emailAddress: 'alice@example.com'
//     }
//   }
// }

// Convert camelCase to snake_case for API request
const jsObject = {
  userId: 123,
  userProfile: {
    firstName: 'Alice',
    contactInfo: {
      emailAddress: 'alice@example.com'
    }
  }
}

transformKeys(jsObject, 'snakeCase')
// => {
//   user_id: 123,
//   user_profile: {
//     first_name: 'Alice',
//     contact_info: {
//       email_address: 'alice@example.com'
//     }
//   }
// }

// Transform arrays of objects
const users = {
  user_list: [
    { first_name: 'Alice', user_id: 1 },
    { first_name: 'Bob', user_id: 2 }
  ]
}

transformKeys(users, 'camelCase')
// => {
//   userList: [
//     { firstName: 'Alice', userId: 1 },
//     { firstName: 'Bob', userId: 2 }
//   ]
// }

// Custom transformation function
transformKeys(
  { hello: 'world', foo: 'bar' },
  (key) => key.toUpperCase()
)
// => { HELLO: 'world', FOO: 'bar' }

// Shallow transformation (not recursive)
transformKeys(
  { user_name: 'Alice', user_meta: { created_at: '2024-01-01' } },
  'camelCase',
  { deep: false }
)
// => { userName: 'Alice', userMeta: { created_at: '2024-01-01' } }

// Data-last (in pipe)
pipe(
  fetchUserData(),
  transformKeys('camelCase')
)
```

### See

mapKeys - for shallow key transformation only
