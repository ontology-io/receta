# Function: partial()

## Call Signature

> **partial**\<`T`, `E`\>(`schemaObj`, `value`): [`Validation`](../../types/type-aliases/Validation.md)\<`Partial`\<`T`\>, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

Defined in: [validation/schema/index.ts:161](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/schema/index.ts#L161)

Creates a schema validator for partial objects.

Like schema, but only validates fields that are present in the value.
Missing fields are not validated.

### Type Parameters

#### T

`T` *extends* `Record`\<`string`, `unknown`\>

#### E

`E`

### Parameters

#### schemaObj

[`ValidationSchema`](../../types/type-aliases/ValidationSchema.md)\<`T`, `E`\>

Schema mapping keys to validators

#### value

`Partial`\<`T`\>

Partial object to validate

### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`Partial`\<`T`\>, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

Validation with the partial object, or field-level errors

### Example

```typescript
const userSchema: ValidationSchema<User, string> = {
  name: (n) => n.length > 0 ? valid(n) : invalid('Name required'),
  email: (e) => e.includes('@') ? valid(e) : invalid('Invalid email'),
  age: (a) => a >= 18 ? valid(a) : invalid('Must be 18+')
}

// Only validates present fields
partial(userSchema, { name: 'John' })
// => Valid({ name: 'John' })

partial(userSchema, { name: '', email: 'invalid' })
// => Invalid([
//   { field: 'name', errors: ['Name required'] },
//   { field: 'email', errors: ['Invalid email'] }
// ])

// Real-world: PATCH request validation
app.patch('/api/users/:id', (req, res) => {
  const validation = partial(userSchema, req.body)
  if (isInvalid(validation)) {
    return res.status(400).json({ errors: validation.errors })
  }
  updateUser(req.params.id, validation.value)
})
```

### See

schema - for validating complete objects

## Call Signature

> **partial**\<`T`, `E`\>(`schemaObj`): (`value`) => [`Validation`](../../types/type-aliases/Validation.md)\<`Partial`\<`T`\>, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

Defined in: [validation/schema/index.ts:165](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/schema/index.ts#L165)

Creates a schema validator for partial objects.

Like schema, but only validates fields that are present in the value.
Missing fields are not validated.

### Type Parameters

#### T

`T` *extends* `Record`\<`string`, `unknown`\>

#### E

`E`

### Parameters

#### schemaObj

[`ValidationSchema`](../../types/type-aliases/ValidationSchema.md)\<`T`, `E`\>

Schema mapping keys to validators

### Returns

Validation with the partial object, or field-level errors

> (`value`): [`Validation`](../../types/type-aliases/Validation.md)\<`Partial`\<`T`\>, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

#### Parameters

##### value

`Partial`\<`T`\>

#### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`Partial`\<`T`\>, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

### Example

```typescript
const userSchema: ValidationSchema<User, string> = {
  name: (n) => n.length > 0 ? valid(n) : invalid('Name required'),
  email: (e) => e.includes('@') ? valid(e) : invalid('Invalid email'),
  age: (a) => a >= 18 ? valid(a) : invalid('Must be 18+')
}

// Only validates present fields
partial(userSchema, { name: 'John' })
// => Valid({ name: 'John' })

partial(userSchema, { name: '', email: 'invalid' })
// => Invalid([
//   { field: 'name', errors: ['Name required'] },
//   { field: 'email', errors: ['Invalid email'] }
// ])

// Real-world: PATCH request validation
app.patch('/api/users/:id', (req, res) => {
  const validation = partial(userSchema, req.body)
  if (isInvalid(validation)) {
    return res.status(400).json({ errors: validation.errors })
  }
  updateUser(req.params.id, validation.value)
})
```

### See

schema - for validating complete objects
