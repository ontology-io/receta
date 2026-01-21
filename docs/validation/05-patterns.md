# Common Patterns & Real-World Recipes

Production-ready validation patterns for forms, APIs, bulk operations, and more. All examples are copy-paste ready and fully typed.

## Table of Contents

1. [Form Validation](#form-validation)
2. [API Request Validation](#api-request-validation)
3. [Bulk Data Validation](#bulk-data-validation)
4. [Multi-Step Wizards](#multi-step-wizards)
5. [Conditional Validation](#conditional-validation)
6. [Cross-Field Validation](#cross-field-validation)
7. [Async Validation](#async-validation)
8. [Configuration Validation](#configuration-validation)

## Form Validation

### User Registration Form

Complete registration form with all common validations.

```typescript
import { schema, validate, required, email, minLength, maxLength, matches, min, max, equals } from 'receta/validation'

interface RegistrationForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  age: number
  country: string
  terms: boolean
}

const validateRegistration = (data: RegistrationForm): Validation<RegistrationForm, FieldError<string>> => {
  const registrationSchema = {
    username: (u: string) =>
      validate(u, [
        required('Username is required'),
        minLength(3, 'Username must be at least 3 characters'),
        maxLength(20, 'Username must be at most 20 characters'),
        matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      ]),

    email: (e: string) =>
      validate(e, [
        required('Email is required'),
        email('Invalid email format')
      ]),

    password: (p: string) =>
      validate(p, [
        required('Password is required'),
        minLength(8, 'Password must be at least 8 characters'),
        matches(/[A-Z]/, 'Password must contain at least one uppercase letter'),
        matches(/[a-z]/, 'Password must contain at least one lowercase letter'),
        matches(/[0-9]/, 'Password must contain at least one number'),
        matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
      ]),

    confirmPassword: (c: string) =>
      c === data.password
        ? valid(c)
        : invalid('Passwords must match'),

    age: (a: number) =>
      validate(a, [
        min(18, 'You must be at least 18 years old'),
        max(120, 'Please enter a valid age'),
        integer('Age must be a whole number')
      ]),

    country: oneOf(
      ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'ES', 'IT'],
      'Please select a valid country'
    ),

    terms: equals(true, 'You must accept the terms and conditions')
  }

  return schema(registrationSchema, data)
}

// Usage in React
const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationForm>({...})
  const [errors, setErrors] = useState<FieldError<string>[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateRegistration(formData)

    match(validation, {
      onValid: async (data) => {
        // Submit to API
        await createAccount(data)
        navigate('/welcome')
      },
      onInvalid: (fieldErrors) => {
        // Show all errors at once
        setErrors(fieldErrors)
        fieldErrors.forEach(({ field, errors }) => {
          showFieldError(field, errors)
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {errors.map(({ field, errors: fieldErrors }) => (
        <ErrorMessage key={field} field={field} errors={fieldErrors} />
      ))}
    </form>
  )
}
```

### Contact Form

Simple contact form with email and message validation.

```typescript
interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const validateContactForm = (data: ContactForm) => {
  return schema({
    name: (n: string) =>
      validate(n, [
        required('Name is required'),
        minLength(2, 'Name must be at least 2 characters')
      ]),

    email: (e: string) =>
      validate(e, [
        required('Email is required'),
        email('Please enter a valid email address')
      ]),

    subject: (s: string) =>
      validate(s, [
        required('Subject is required'),
        minLength(5, 'Subject must be at least 5 characters'),
        maxLength(100, 'Subject must be at most 100 characters')
      ]),

    message: (m: string) =>
      validate(m, [
        required('Message is required'),
        minLength(10, 'Message must be at least 10 characters'),
        maxLength(1000, 'Message must be at most 1000 characters')
      ])
  }, data)
}
```

### Payment Form

Payment form with conditional validation based on payment method.

```typescript
interface PaymentForm {
  paymentMethod: 'card' | 'bank'
  cardNumber?: string
  cardExpiry?: string
  cardCvv?: string
  accountNumber?: string
  routingNumber?: string
  amount: number
}

const validatePayment = (data: PaymentForm): Validation<PaymentForm, FieldError<string>> => {
  if (data.paymentMethod === 'card') {
    return schema({
      paymentMethod: (m: string) => valid(m),
      cardNumber: (n: string | undefined) =>
        n
          ? validate(n, [
              required('Card number is required'),
              matches(/^\d{16}$/, 'Card number must be 16 digits'),
              fromPredicate(luhnCheck, 'Invalid card number')
            ])
          : invalid('Card number is required'),
      cardExpiry: (e: string | undefined) =>
        e
          ? validate(e, [
              required('Expiry date is required'),
              matches(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
              fromPredicate(isValidExpiry, 'Card has expired')
            ])
          : invalid('Expiry date is required'),
      cardCvv: (c: string | undefined) =>
        c
          ? validate(c, [
              required('CVV is required'),
              matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
            ])
          : invalid('CVV is required'),
      amount: (a: number) =>
        validate(a, [
          min(0.01, 'Amount must be positive'),
          finite('Amount must be a valid number')
        ])
    }, data as any)
  } else {
    return schema({
      paymentMethod: (m: string) => valid(m),
      accountNumber: (n: string | undefined) =>
        n
          ? validate(n, [
              required('Account number is required'),
              matches(/^\d{8,17}$/, 'Account number must be 8-17 digits')
            ])
          : invalid('Account number is required'),
      routingNumber: (r: string | undefined) =>
        r
          ? validate(r, [
              required('Routing number is required'),
              matches(/^\d{9}$/, 'Routing number must be 9 digits')
            ])
          : invalid('Routing number is required'),
      amount: (a: number) =>
        validate(a, [
          min(0.01, 'Amount must be positive'),
          finite('Amount must be a valid number')
        ])
    }, data as any)
  }
}
```

## API Request Validation

### Create User Endpoint

```typescript
interface CreateUserRequest {
  email: string
  name: string
  role: 'admin' | 'user' | 'moderator'
  age: number
}

const validateCreateUser = (body: unknown): Validation<CreateUserRequest, FieldError<string>> => {
  // Type guard
  if (typeof body !== 'object' || body === null) {
    return invalid({ field: 'body', errors: ['Request body must be an object'] })
  }

  const data = body as Record<string, unknown>

  const createUserSchema = {
    email: (e: unknown) =>
      typeof e === 'string'
        ? validate(e, [
            required('Email is required'),
            email('Invalid email format'),
            maxLength(254, 'Email too long')
          ])
        : invalid('Email must be a string'),

    name: (n: unknown) =>
      typeof n === 'string'
        ? validate(n, [
            required('Name is required'),
            minLength(2, 'Name must be at least 2 characters'),
            maxLength(50, 'Name must be at most 50 characters')
          ])
        : invalid('Name must be a string'),

    role: (r: unknown) =>
      typeof r === 'string'
        ? oneOf(['admin', 'user', 'moderator'] as const, 'Invalid role')(r as string)
        : invalid('Role must be a string'),

    age: (a: unknown) =>
      typeof a === 'number'
        ? validate(a, [
            min(18, 'Must be at least 18 years old'),
            max(120, 'Invalid age'),
            integer('Age must be a whole number')
          ])
        : invalid('Age must be a number')
  }

  return schema(createUserSchema, data as CreateUserRequest)
}

// Express endpoint
app.post('/api/users', (req, res) => {
  const validation = validateCreateUser(req.body)

  match(validation, {
    onValid: async (user) => {
      const created = await db.users.create(user)
      res.status(201).json(created)
    },
    onInvalid: (errors) => {
      res.status(400).json({
        error: 'Validation failed',
        fields: errors
      })
    }
  })
})
```

### Update User Endpoint (PATCH)

```typescript
const validateUpdateUser = (body: unknown): Validation<Partial<User>, FieldError<string>> => {
  if (typeof body !== 'object' || body === null) {
    return invalid({ field: 'body', errors: ['Request body must be an object'] })
  }

  const userSchema = {
    email: (e: unknown) =>
      typeof e === 'string'
        ? validate(e, [email('Invalid email'), maxLength(254)])
        : invalid('Email must be a string'),

    name: (n: unknown) =>
      typeof n === 'string'
        ? validate(n, [minLength(2), maxLength(50)])
        : invalid('Name must be a string'),

    age: (a: unknown) =>
      typeof a === 'number'
        ? validate(a, [min(18), max(120), integer()])
        : invalid('Age must be a number')
  }

  // Only validate present fields
  return partial(userSchema, body as Partial<User>)
}

app.patch('/api/users/:id', (req, res) => {
  const validation = validateUpdateUser(req.body)

  if (isInvalid(validation)) {
    return res.status(400).json({ errors: validation.errors })
  }

  const updated = updateUser(req.params.id, validation.value)
  res.json(updated)
})
```

### Batch Create Endpoint

```typescript
app.post('/api/users/batch', (req, res) => {
  if (!Array.isArray(req.body.users)) {
    return res.status(400).json({ error: 'users must be an array' })
  }

  const validation = validateAll(req.body.users, validateCreateUser)

  match(validation, {
    onValid: async (users) => {
      const created = await db.users.createMany(users)
      res.status(201).json({
        message: `Created ${created.length} users`,
        users: created
      })
    },
    onInvalid: (errors) => {
      res.status(400).json({
        message: `Validation failed for ${errors.length} users`,
        errors: errors.map((err, idx) => ({
          index: idx,
          error: err
        }))
      })
    }
  })
})
```

## Bulk Data Validation

### CSV Import

```typescript
interface ProductRow {
  name: string
  sku: string
  price: number
  category: string
}

const validateProduct = (row: unknown, rowIndex: number): Validation<ProductRow, string> => {
  if (typeof row !== 'object' || row === null) {
    return invalid(`Row ${rowIndex}: Invalid data format`)
  }

  const data = row as Record<string, unknown>

  return pipe(
    collectErrors([
      typeof data.name === 'string'
        ? validate(data.name, [
            required('Name required'),
            minLength(3, 'Name too short')
          ])
        : invalid('Name must be a string'),

      typeof data.sku === 'string'
        ? validate(data.sku, [
            required('SKU required'),
            matches(/^[A-Z0-9-]+$/, 'Invalid SKU format')
          ])
        : invalid('SKU must be a string'),

      typeof data.price === 'number'
        ? validate(data.price, [
            min(0, 'Price must be positive'),
            finite('Price must be valid')
          ])
        : invalid('Price must be a number'),

      typeof data.category === 'string'
        ? oneOf(['electronics', 'books', 'clothing', 'home'], 'Invalid category')(data.category)
        : invalid('Category must be a string')
    ]),
    map(([name, sku, price, category]) => ({
      name,
      sku,
      price,
      category
    })),
    mapInvalid((errors) => `Row ${rowIndex}: ${errors.join(', ')}`)
  )
}

const importCSV = (csvData: unknown[]) => {
  const validations = csvData.map((row, idx) => validateProduct(row, idx + 1))
  const result = collectErrors(validations)

  return match(result, {
    onValid: async (products) => {
      await db.products.createMany(products)
      return {
        success: true,
        imported: products.length,
        message: `Successfully imported ${products.length} products`
      }
    },
    onInvalid: (errors) => {
      return {
        success: false,
        imported: 0,
        errors: errors,
        message: `Failed to import. ${errors.length} validation errors found.`
      }
    }
  })
}
```

### Batch Validation with Partial Success

```typescript
interface ValidationResult<T, E> {
  valid: T[]
  invalid: Array<{ index: number; errors: readonly E[] }>
}

const validateWithPartialSuccess = <T, E>(
  items: unknown[],
  validator: Validator<unknown, T, E>
): ValidationResult<T, E> => {
  const valid: T[] = []
  const invalid: Array<{ index: number; errors: readonly E[] }> = []

  items.forEach((item, index) => {
    const validation = validator(item)

    if (isValid(validation)) {
      valid.push(validation.value)
    } else {
      invalid.push({ index, errors: validation.errors })
    }
  })

  return { valid, invalid }
}

// Usage
const result = validateWithPartialSuccess(csvRows, validateProduct)

if (result.valid.length > 0) {
  await db.products.createMany(result.valid)
}

if (result.invalid.length > 0) {
  console.log(`Skipped ${result.invalid.length} invalid rows:`)
  result.invalid.forEach(({ index, errors }) => {
    console.log(`  Row ${index + 1}: ${errors.join(', ')}`)
  })
}
```

## Multi-Step Wizards

### 5-Step Onboarding Wizard

```typescript
interface WizardData {
  step1: PersonalInfo
  step2: AccountSettings
  step3: Preferences
  step4: PaymentInfo
  step5: Confirmation
}

const validateWizardStep1 = (data: PersonalInfo) =>
  schema({
    firstName: (f: string) =>
      validate(f, [required('First name required'), minLength(2)]),
    lastName: (l: string) =>
      validate(l, [required('Last name required'), minLength(2)]),
    email: (e: string) =>
      validate(e, [required('Email required'), email()])
  }, data)

const validateWizardStep2 = (data: AccountSettings) =>
  schema({
    username: (u: string) =>
      validate(u, [
        required('Username required'),
        minLength(3),
        maxLength(20),
        alphanumeric()
      ]),
    password: (p: string) =>
      validate(p, [
        required('Password required'),
        minLength(8),
        matches(/[A-Z]/, 'Need uppercase'),
        matches(/[0-9]/, 'Need number')
      ])
  }, data)

const validateCompleteWizard = (data: WizardData) => {
  return collectErrors([
    validateWizardStep1(data.step1),
    validateWizardStep2(data.step2),
    validateWizardStep3(data.step3),
    validateWizardStep4(data.step4),
    validateWizardStep5(data.step5)
  ])
}

// Usage
const WizardComponent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({...})

  const handleFinalSubmit = () => {
    const validation = validateCompleteWizard(wizardData)

    match(validation, {
      onValid: async (data) => {
        await submitWizard(data)
        navigate('/success')
      },
      onInvalid: (errors) => {
        // Show which steps have errors
        const errorSteps = new Set<number>()
        errors.forEach((err, idx) => {
          errorSteps.add(Math.floor(idx / 5) + 1)
        })

        alert(`Please fix errors in steps: ${Array.from(errorSteps).join(', ')}`)
      }
    })
  }

  return <div>...</div>
}
```

## Conditional Validation

### Dynamic Field Validation

```typescript
interface OrderForm {
  orderType: 'pickup' | 'delivery'
  deliveryAddress?: Address
  pickupLocation?: string
  items: OrderItem[]
}

const validateOrder = (data: OrderForm) => {
  const baseValidation = schema({
    orderType: oneOf(['pickup', 'delivery']),
    items: (items: OrderItem[]) =>
      validate(items, [
        nonEmpty('Order must have at least one item'),
        maxItems(50, 'Maximum 50 items per order')
      ])
  }, data)

  if (isInvalid(baseValidation)) {
    return baseValidation
  }

  // Conditional validation based on orderType
  if (data.orderType === 'delivery') {
    return data.deliveryAddress
      ? pipe(
          validateAddress(data.deliveryAddress),
          map((addr) => ({ ...data, deliveryAddress: addr }))
        )
      : invalid({ field: 'deliveryAddress', errors: ['Delivery address required'] })
  } else {
    return data.pickupLocation
      ? validate(data.pickupLocation, [
          required('Pickup location required'),
          oneOf(['store1', 'store2', 'store3'], 'Invalid pickup location')
        ]).then(loc => ({ ...data, pickupLocation: loc }))
      : invalid({ field: 'pickupLocation', errors: ['Pickup location required'] })
  }
}
```

## Cross-Field Validation

### Password Confirmation

```typescript
interface PasswordChangeForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const validatePasswordChange = (data: PasswordChangeForm) => {
  return pipe(
    schema({
      currentPassword: (p: string) =>
        required('Current password required')(p),
      newPassword: (p: string) =>
        validate(p, [
          required('New password required'),
          minLength(8),
          matches(/[A-Z]/, 'Need uppercase'),
          matches(/[0-9]/, 'Need number')
        ]),
      confirmPassword: (c: string) =>
        required('Please confirm your password')(c)
    }, data),
    flatMap((validated) =>
      validated.newPassword === validated.confirmPassword
        ? valid(validated)
        : invalid({
            field: 'confirmPassword',
            errors: ['Passwords do not match']
          })
    ),
    flatMap((validated) =>
      validated.currentPassword !== validated.newPassword
        ? valid(validated)
        : invalid({
            field: 'newPassword',
            errors: ['New password must be different from current password']
          })
    )
  )
}
```

### Date Range Validation

```typescript
interface EventForm {
  title: string
  startDate: Date
  endDate: Date
  location: string
}

const validateEvent = (data: EventForm) => {
  return pipe(
    schema({
      title: (t: string) =>
        validate(t, [required('Title required'), maxLength(100)]),
      startDate: (d: Date) =>
        fromPredicate(
          (date: Date) => date > new Date(),
          'Start date must be in the future'
        )(d),
      endDate: (d: Date) => valid(d),
      location: (l: string) =>
        validate(l, [required('Location required')])
    }, data),
    flatMap((validated) =>
      validated.endDate > validated.startDate
        ? valid(validated)
        : invalid({
            field: 'endDate',
            errors: ['End date must be after start date']
          })
    )
  )
}
```

## Async Validation

### Check Username Availability

```typescript
const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const response = await fetch(`/api/check-username/${username}`)
  const { available } = await response.json()
  return available
}

const validateUsername = async (username: string): Promise<Validation<string, string>> => {
  // Sync validations first
  const syncValidation = validate(username, [
    required('Username required'),
    minLength(3),
    maxLength(20),
    alphanumeric()
  ])

  if (isInvalid(syncValidation)) {
    return syncValidation
  }

  // Async validation
  const available = await checkUsernameAvailable(username)
  return available
    ? valid(username)
    : invalid('Username is already taken')
}

// Usage
const handleUsernameBlur = async (username: string) => {
  const validation = await validateUsername(username)

  if (isInvalid(validation)) {
    showError(validation.errors[0])
  }
}
```

## Configuration Validation

### Environment Variables

```typescript
interface AppConfig {
  DATABASE_URL: string
  API_KEY: string
  PORT: number
  NODE_ENV: 'development' | 'production' | 'test'
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
}

const validateConfig = (env: NodeJS.ProcessEnv): Validation<AppConfig, FieldError<string>> => {
  const configSchema = {
    DATABASE_URL: (v: string | undefined) =>
      v
        ? validate(v, [
            required('DATABASE_URL is required'),
            url('DATABASE_URL must be a valid URL')
          ])
        : invalid('DATABASE_URL environment variable is missing'),

    API_KEY: (v: string | undefined) =>
      v
        ? validate(v, [
            required('API_KEY is required'),
            minLength(32, 'API_KEY must be at least 32 characters')
          ])
        : invalid('API_KEY environment variable is missing'),

    PORT: (v: string | undefined) =>
      v
        ? pipe(
            tryCatch(() => Number(v), () => 'PORT must be a number'),
            flatMap((port) =>
              validate(port, [
                integer('PORT must be an integer'),
                between(1000, 65535, 'PORT must be between 1000 and 65535')
              ])
            )
          )
        : invalid('PORT environment variable is missing'),

    NODE_ENV: (v: string | undefined) =>
      v
        ? oneOf(['development', 'production', 'test'] as const, 'Invalid NODE_ENV')(v as any)
        : invalid('NODE_ENV environment variable is missing'),

    LOG_LEVEL: (v: string | undefined) =>
      v
        ? oneOf(['debug', 'info', 'warn', 'error'] as const, 'Invalid LOG_LEVEL')(v as any)
        : valid('info' as const) // Default value
  }

  return schema(configSchema, env as any)
}

// Usage at app startup
const configValidation = validateConfig(process.env)

if (isInvalid(configValidation)) {
  console.error('Configuration validation failed:')
  configValidation.errors.forEach(({ field, errors }) => {
    console.error(`  ${field}: ${errors.join(', ')}`)
  })
  process.exit(1)
}

const config = configValidation.value
// Now use config safely
```

## Next Steps

- **[Migration Guide](./06-migration.md)** - Move from Zod, Yup, or try-catch
- **[API Reference](./07-api-reference.md)** - Complete function reference
- **[Examples](../../examples/validation-usage.ts)** - More runnable examples
