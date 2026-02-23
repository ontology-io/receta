# Function: match()

## Call Signature

> **match**\<`T`, `E`, `R`\>(`validation`, `matcher`): `R`

Defined in: [validation/match/index.ts:91](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/match/index.ts#L91)

Performs pattern matching on a Validation.

Exhaustively handles both Valid and Invalid cases by providing functions
for each. This is the recommended way to work with Validation when you
need to handle both cases.

### Type Parameters

#### T

`T`

#### E

`E`

#### R

`R`

### Parameters

#### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The validation to match on

#### matcher

[`ValidationMatcher`](../interfaces/ValidationMatcher.md)\<`T`, `E`, `R`\>

Object with onValid and onInvalid handlers

### Returns

`R`

The result of calling the appropriate handler

### Example

```typescript
// Data-first
match(valid(42), {
  onValid: (n) => `Success: ${n}`,
  onInvalid: (errors) => `Errors: ${errors.join(', ')}`
})
// => "Success: 42"

match(invalid(['error1', 'error2']), {
  onValid: (n) => `Success: ${n}`,
  onInvalid: (errors) => `Errors: ${errors.join(', ')}`
})
// => "Errors: error1, error2"

// Data-last (in pipe)
pipe(
  validateEmail(email),
  match({
    onValid: (email) => sendWelcomeEmail(email),
    onInvalid: (errors) => showErrors(errors)
  })
)

// Real-world: HTTP response
app.post('/api/users', (req, res) => {
  const validation = validateUser(req.body)

  match(validation, {
    onValid: (user) => res.status(201).json(user),
    onInvalid: (errors) => res.status(400).json({ errors })
  })
})

// Real-world: UI rendering
const renderForm = (validation: Validation<FormData, FieldError>) =>
  match(validation, {
    onValid: (data) => <SuccessMessage data={data} />,
    onInvalid: (errors) => <Form errors={errors} />
  })

// Real-world: Error logging
const processWithLogging = (data: unknown) =>
  pipe(
    validateData(data),
    match({
      onValid: (validated) => {
        logger.info('Validation succeeded')
        return process(validated)
      },
      onInvalid: (errors) => {
        logger.error('Validation failed', { errors })
        return null
      }
    })
  )
```

### See

 - unwrapOr - for providing a default value
 - unwrapOrElse - for computing a default from errors

## Call Signature

> **match**\<`T`, `E`, `R`\>(`matcher`): (`validation`) => `R`

Defined in: [validation/match/index.ts:95](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/match/index.ts#L95)

Performs pattern matching on a Validation.

Exhaustively handles both Valid and Invalid cases by providing functions
for each. This is the recommended way to work with Validation when you
need to handle both cases.

### Type Parameters

#### T

`T`

#### E

`E`

#### R

`R`

### Parameters

#### matcher

[`ValidationMatcher`](../interfaces/ValidationMatcher.md)\<`T`, `E`, `R`\>

Object with onValid and onInvalid handlers

### Returns

The result of calling the appropriate handler

> (`validation`): `R`

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Returns

`R`

### Example

```typescript
// Data-first
match(valid(42), {
  onValid: (n) => `Success: ${n}`,
  onInvalid: (errors) => `Errors: ${errors.join(', ')}`
})
// => "Success: 42"

match(invalid(['error1', 'error2']), {
  onValid: (n) => `Success: ${n}`,
  onInvalid: (errors) => `Errors: ${errors.join(', ')}`
})
// => "Errors: error1, error2"

// Data-last (in pipe)
pipe(
  validateEmail(email),
  match({
    onValid: (email) => sendWelcomeEmail(email),
    onInvalid: (errors) => showErrors(errors)
  })
)

// Real-world: HTTP response
app.post('/api/users', (req, res) => {
  const validation = validateUser(req.body)

  match(validation, {
    onValid: (user) => res.status(201).json(user),
    onInvalid: (errors) => res.status(400).json({ errors })
  })
})

// Real-world: UI rendering
const renderForm = (validation: Validation<FormData, FieldError>) =>
  match(validation, {
    onValid: (data) => <SuccessMessage data={data} />,
    onInvalid: (errors) => <Form errors={errors} />
  })

// Real-world: Error logging
const processWithLogging = (data: unknown) =>
  pipe(
    validateData(data),
    match({
      onValid: (validated) => {
        logger.info('Validation succeeded')
        return process(validated)
      },
      onInvalid: (errors) => {
        logger.error('Validation failed', { errors })
        return null
      }
    })
  )
```

### See

 - unwrapOr - for providing a default value
 - unwrapOrElse - for computing a default from errors
