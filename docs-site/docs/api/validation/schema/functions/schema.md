# Function: schema()

## Call Signature

> **schema**\<`T`, `E`\>(`schemaObj`, `value`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

Defined in: [validation/schema/index.ts:86](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/schema/index.ts#L86)

Validates an object against a schema, accumulating field-level errors.

Each field is validated independently using its validator from the schema.
If all fields are valid, returns Valid with the object.
If any field is invalid, returns Invalid with FieldError objects for each failed field.

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

`T`

Object to validate

### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

Validation with the object, or field-level errors

### Example

```typescript
interface User {
  name: string
  email: string
  age: number
}

const userSchema: ValidationSchema<User, string> = {
  name: (n) => n.length > 0 ? valid(n) : invalid('Name required'),
  email: (e) => e.includes('@') ? valid(e) : invalid('Invalid email'),
  age: (a) => a >= 18 ? valid(a) : invalid('Must be 18+')
}

// Valid object
schema(userSchema, { name: 'John', email: 'john@example.com', age: 25 })
// => Valid({ name: 'John', email: 'john@example.com', age: 25 })

// Invalid object - accumulates all field errors
schema(userSchema, { name: '', email: 'invalid', age: 17 })
// => Invalid([
//   { field: 'name', errors: ['Name required'] },
//   { field: 'email', errors: ['Invalid email'] },
//   { field: 'age', errors: ['Must be 18+'] }
// ])

// Real-world: Form validation
const validateRegistration = (formData: unknown) =>
  schema(userSchema, formData)

const result = validateRegistration(formData)
if (isInvalid(result)) {
  // Display all field errors at once
  result.errors.forEach(({ field, errors }) => {
    showFieldError(field, errors)
  })
}

// Real-world: API request validation
const createUserSchema: ValidationSchema<CreateUserRequest, string> = {
  email: pipe(
    fromPredicate(s => s.length > 0, 'Email required'),
    flatMap(fromPredicate(s => s.includes('@'), 'Invalid email'))
  ),
  password: pipe(
    fromPredicate(s => s.length >= 8, 'Min 8 characters'),
    flatMap(fromPredicate(s => /[A-Z]/.test(s), 'Need uppercase'))
  )
}

app.post('/api/users', (req, res) => {
  const validation = schema(createUserSchema, req.body)
  if (isInvalid(validation)) {
    return res.status(400).json({ errors: validation.errors })
  }
  // Process valid user data
  createUser(validation.value)
})
```

### See

 - validate - for applying multiple validators to a single value
 - collectErrors - for combining independent validations

## Call Signature

> **schema**\<`T`, `E`\>(`schemaObj`): (`value`) => [`Validation`](../../types/type-aliases/Validation.md)\<`T`, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

Defined in: [validation/schema/index.ts:90](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/schema/index.ts#L90)

Validates an object against a schema, accumulating field-level errors.

Each field is validated independently using its validator from the schema.
If all fields are valid, returns Valid with the object.
If any field is invalid, returns Invalid with FieldError objects for each failed field.

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

Validation with the object, or field-level errors

> (`value`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

#### Parameters

##### value

`T`

#### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, [`FieldError`](../../types/interfaces/FieldError.md)\<`E`\>\>

### Example

```typescript
interface User {
  name: string
  email: string
  age: number
}

const userSchema: ValidationSchema<User, string> = {
  name: (n) => n.length > 0 ? valid(n) : invalid('Name required'),
  email: (e) => e.includes('@') ? valid(e) : invalid('Invalid email'),
  age: (a) => a >= 18 ? valid(a) : invalid('Must be 18+')
}

// Valid object
schema(userSchema, { name: 'John', email: 'john@example.com', age: 25 })
// => Valid({ name: 'John', email: 'john@example.com', age: 25 })

// Invalid object - accumulates all field errors
schema(userSchema, { name: '', email: 'invalid', age: 17 })
// => Invalid([
//   { field: 'name', errors: ['Name required'] },
//   { field: 'email', errors: ['Invalid email'] },
//   { field: 'age', errors: ['Must be 18+'] }
// ])

// Real-world: Form validation
const validateRegistration = (formData: unknown) =>
  schema(userSchema, formData)

const result = validateRegistration(formData)
if (isInvalid(result)) {
  // Display all field errors at once
  result.errors.forEach(({ field, errors }) => {
    showFieldError(field, errors)
  })
}

// Real-world: API request validation
const createUserSchema: ValidationSchema<CreateUserRequest, string> = {
  email: pipe(
    fromPredicate(s => s.length > 0, 'Email required'),
    flatMap(fromPredicate(s => s.includes('@'), 'Invalid email'))
  ),
  password: pipe(
    fromPredicate(s => s.length >= 8, 'Min 8 characters'),
    flatMap(fromPredicate(s => /[A-Z]/.test(s), 'Need uppercase'))
  )
}

app.post('/api/users', (req, res) => {
  const validation = schema(createUserSchema, req.body)
  if (isInvalid(validation)) {
    return res.status(400).json({ errors: validation.errors })
  }
  // Process valid user data
  createUser(validation.value)
})
```

### See

 - validate - for applying multiple validators to a single value
 - collectErrors - for combining independent validations
