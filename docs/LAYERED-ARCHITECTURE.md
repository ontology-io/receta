# Layered Architecture Vision

> Understanding Receta's place in the functional programming ecosystem and potential higher-level pattern libraries.

## The Stack

```
┌─────────────────────────────────────────┐
│      Your Application Logic             │  ← Business rules, workflows
├─────────────────────────────────────────┤
│   Domain Libraries (receta-api, etc.)   │  ← Business-specific patterns
├─────────────────────────────────────────┤
│   Framework Adapters (receta-react)     │  ← Tech stack integration
├─────────────────────────────────────────┤
│   Receta (Composed FP Patterns)         │  ← General-purpose recipes
├─────────────────────────────────────────┤
│   Remeda (FP Primitives)                │  ← Low-level utilities
├─────────────────────────────────────────┤
│   TypeScript / JavaScript               │  ← Language runtime
└─────────────────────────────────────────┘
```

## Current Layer: Receta

**Receta** provides general-purpose functional patterns that solve common programming problems:

- **Error Handling**: `Result`, `Option`, `tryCatch`
- **Async Operations**: `retry`, `mapAsync`, `race`, `timeout`
- **Data Validation**: `Validation`, `combine`, `schema`
- **Predicates**: `where`, `and`, `or`, composable type guards
- **Collections**: `nest`, `diff`, `paginate`, advanced grouping

These are **domain-agnostic** — useful across any application type.

---

## Above Receta: Domain-Specific Pattern Libraries

### 1. Domain Pattern Libraries

Business-specific patterns built on Receta's foundations:

#### **receta-api**
REST/GraphQL API patterns
```typescript
import { paginate, retry } from 'receta'
import { endpoint, withAuth, rateLimit } from 'receta-api'

// Built on Receta's retry + validation
const getUsers = endpoint({
  method: 'GET',
  path: '/users',
  auth: withAuth(),
  rateLimit: rateLimit({ max: 100, window: '1m' }),
  query: paginate({ page: 1, limit: 20 }),
  retry: { maxAttempts: 3 }
})
```

#### **receta-forms**
Form state management and validation workflows
```typescript
import { Validation } from 'receta/validation'
import { createForm, field } from 'receta-forms'

// Built on Receta's Validation
const loginForm = createForm({
  email: field(string(), [required, email]),
  password: field(string(), [required, minLength(8)])
})
```

#### **receta-auth**
Authentication and authorization patterns
```typescript
import { Result, Option } from 'receta'
import { authenticate, authorize, session } from 'receta-auth'

// Built on Receta's Result + Option
const checkPermission = (user: Option<User>, resource: string): Result<boolean, AuthError> =>
  pipe(
    user,
    Option.toResult({ code: 'UNAUTHENTICATED' }),
    Result.flatMap(u => authorize(u, resource))
  )
```

#### **receta-data**
Data access patterns
```typescript
import { Result, retry } from 'receta'
import { repository, transaction, migration } from 'receta-data'

// Built on Receta's Result + retry
const userRepo = repository<User>({
  findById: (id) => retry(() => db.users.findUnique({ where: { id } })),
  create: (data) => transaction(() => db.users.create({ data }))
})
```

#### **receta-events**
Event sourcing and CQRS patterns
```typescript
import { Result, collect } from 'receta'
import { eventStore, aggregate, projection } from 'receta-events'

// Built on Receta's Result + collect
const orderAggregate = aggregate({
  created: (event) => ({ id: event.orderId, items: [] }),
  itemAdded: (state, event) => ({ ...state, items: [...state.items, event.item] }),
  submitted: (state) => ({ ...state, status: 'submitted' })
})
```

#### **receta-workflow**
State machines, sagas, job queues
```typescript
import { Result, mapAsync } from 'receta'
import { stateMachine, saga, queue } from 'receta-workflow'

// Built on Receta's Result + async patterns
const checkoutFlow = stateMachine({
  initial: 'cart',
  states: {
    cart: { on: { SUBMIT: 'payment' } },
    payment: { on: { SUCCESS: 'complete', FAIL: 'cart' } },
    complete: { type: 'final' }
  }
})
```

---

### 2. Framework Adapters

Integration with specific technologies:

#### **receta-react**
React hooks and patterns
```typescript
import { Result, Option } from 'receta'
import { useResult, useOption, useAsync } from 'receta-react'

function UserProfile({ userId }: Props) {
  const user = useAsync(() => fetchUser(userId))

  return Result.match(user, {
    Ok: (data) => <Profile user={data} />,
    Err: (error) => <Error error={error} />,
    Loading: () => <Spinner />
  })
}
```

#### **receta-express**
Express.js middleware and patterns
```typescript
import { Result } from 'receta'
import { asyncHandler, errorMiddleware } from 'receta-express'

// Built on Receta's Result
app.get('/users/:id', asyncHandler(async (req, res) => {
  const result = await getUser(req.params.id)

  return Result.match(result, {
    Ok: (user) => res.json(user),
    Err: (error) => res.status(404).json(error)
  })
}))
```

#### **receta-prisma**
Type-safe database query patterns
```typescript
import { Result, Option } from 'receta'
import { query, transaction } from 'receta-prisma'

// Built on Receta's Result + Option
const findUser = (id: string): Promise<Option<User>> =>
  query(prisma.user.findUnique({ where: { id } }))

const createUser = (data: CreateUser): Promise<Result<User, DbError>> =>
  transaction(() => prisma.user.create({ data }))
```

#### **receta-trpc**
End-to-end type-safe APIs
```typescript
import { Result } from 'receta'
import { procedure } from 'receta-trpc'

// Built on Receta's Result + Validation
const getUser = procedure
  .input(z.string())
  .query(({ input }) => getUserById(input))
```

---

### 3. Business Logic Frameworks

Complete solutions for specific business domains:

#### **receta-ecommerce**
E-commerce patterns
```typescript
import { Result, Validation } from 'receta'
import { Cart, checkout, inventory } from 'receta-ecommerce'

// Built on multiple Receta patterns
const processOrder = async (cart: Cart): Promise<Result<Order, CheckoutError>> =>
  pipe(
    await Validation.combine([
      validateCart(cart),
      checkInventory(cart.items),
      validatePayment(cart.payment)
    ]),
    Result.flatMap(reserveInventory),
    Result.flatMap(processPayment),
    Result.flatMap(createOrder)
  )
```

#### **receta-saas**
SaaS patterns
```typescript
import { Result, Option } from 'receta'
import { subscription, billing, multitenancy } from 'receta-saas'

// Built on Receta's Result + Option
const checkAccess = (
  user: User,
  feature: Feature
): Result<boolean, AccessError> =>
  pipe(
    subscription.findByUser(user.id),
    Option.toResult({ code: 'NO_SUBSCRIPTION' }),
    Result.flatMap(sub => subscription.hasFeature(sub, feature))
  )
```

#### **receta-analytics**
Analytics and metrics
```typescript
import { collect, nest } from 'receta/collection'
import { track, aggregate, metric } from 'receta-analytics'

// Built on Receta's collection patterns
const dailyActiveUsers = metric({
  name: 'dau',
  calculate: (events) => pipe(
    events,
    nest({ by: ['date'], collect: 'userId', unique: true }),
    mapValues(users => users.length)
  )
})
```

#### **receta-notifications**
Notification patterns
```typescript
import { Result, retry, mapAsync } from 'receta'
import { email, sms, push, template } from 'receta-notifications'

// Built on Receta's async + Result
const sendWelcome = (user: User): Promise<Result<void, NotificationError>> =>
  retry(() => email.send({
    to: user.email,
    template: template('welcome', { name: user.name })
  }))
```

---

### 4. Architecture Patterns

Full architectural frameworks:

#### **receta-ddd**
Domain-driven design building blocks
```typescript
import { Result, Option } from 'receta'
import { Entity, ValueObject, AggregateRoot, DomainEvent } from 'receta-ddd'

// Built on Receta's core types
class Order extends AggregateRoot {
  addItem(item: OrderItem): Result<void, DomainError> {
    return pipe(
      this.validateItem(item),
      Result.map(() => {
        this.items.push(item)
        this.addEvent(new ItemAdded(this.id, item))
      })
    )
  }
}
```

#### **receta-hexagonal**
Ports and adapters architecture
```typescript
import { Result } from 'receta'
import { Port, Adapter, UseCase } from 'receta-hexagonal'

// Built on Receta's Result
interface UserRepository extends Port {
  findById(id: string): Promise<Option<User>>
  save(user: User): Promise<Result<User, SaveError>>
}

class CreateUserUseCase extends UseCase<CreateUserInput, User> {
  async execute(input: CreateUserInput): Promise<Result<User, UseCaseError>> {
    return pipe(
      await this.validate(input),
      Result.flatMap(data => this.userRepo.save(data))
    )
  }
}
```

#### **receta-microservices**
Microservice patterns
```typescript
import { Result, retry, timeout } from 'receta'
import { circuitBreaker, serviceDiscovery, eventBus } from 'receta-microservices'

// Built on Receta's async patterns
const callUserService = circuitBreaker(
  retry(
    timeout(() => fetch('http://users-service/api/users'), 5000),
    { maxAttempts: 3 }
  ),
  { threshold: 5, resetTimeout: 30000 }
)
```

---

## Composition Principle

Each layer **composes** the layer below without duplicating logic:

### Example: E-commerce Checkout Flow

```typescript
// Layer 1: Remeda primitives
import { pipe, map, filter } from 'remeda'

// Layer 2: Receta patterns
import { Result, Validation, retry, mapAsync } from 'receta'

// Layer 3: Domain library
import { validateCart, processPayment, reserveInventory } from 'receta-ecommerce'

// Layer 4: Your application
const checkoutWorkflow = async (cartId: string) =>
  pipe(
    // Fetch cart (Receta: retry)
    await retry(() => getCart(cartId)),

    // Validate cart (receta-ecommerce: validateCart → Receta: Validation)
    Result.flatMap(validateCart),

    // Reserve inventory (receta-ecommerce: reserveInventory → Receta: mapAsync)
    Result.flatMap(cart => reserveInventory(cart.items)),

    // Process payment (receta-ecommerce: processPayment → Receta: retry + Result)
    Result.flatMap(items => processPayment(cart.payment)),

    // Create order (Your app logic)
    Result.flatMap(payment => createOrder({ cartId, payment, items }))
  )
```

---

## Benefits of Layered Architecture

### 1. **Separation of Concerns**
- **Receta**: General-purpose patterns (Result, retry, validation)
- **Domain Libraries**: Business-specific patterns (checkout, auth, billing)
- **Your App**: Unique business rules

### 2. **Reusability**
- **Receta** used across all domains (API, forms, data, events)
- **Domain libraries** used across projects in same domain
- **Framework adapters** bridge Receta to your tech stack

### 3. **Maintainability**
- Bug fixes in Receta benefit all layers above
- Domain patterns evolved independently
- Application code stays clean and focused

### 4. **Testability**
- Each layer tested independently
- Mock higher layers, test against lower layers
- Property tests at Receta level, integration tests at domain level

### 5. **Discoverability**
- Clear naming: `receta-*` indicates domain/framework
- Progressive learning: Remeda → Receta → Domain
- Copy-paste examples from each layer

---

## Future Direction

### Short Term
1. **Complete Receta core modules** (object, string, number, date, memo, lens)
2. **Document composition patterns** between modules
3. **Create migration guides** from imperative to functional

### Medium Term
1. **Prototype first domain library** (likely `receta-api` or `receta-forms`)
2. **Establish framework adapter pattern** with `receta-react`
3. **Build example applications** showing full stack usage

### Long Term
1. **Community-driven domain libraries** for common business patterns
2. **Framework adapters** for popular ecosystems (Next.js, Remix, Fastify)
3. **Architecture templates** (DDD, Hexagonal, Event-Sourced apps)

---

## Contributing

Each layer can evolve independently:

- **Receta Core**: Submit PRs to main Receta repo
- **Domain Libraries**: Create new repos as `receta-{domain}`
- **Framework Adapters**: Create new repos as `receta-{framework}`
- **Architecture Patterns**: Create new repos as `receta-{pattern}`

All layers should:
1. Build on Receta's patterns (no duplication)
2. Follow data-first/data-last convention
3. Return `Result` or `Option` for error handling
4. Include comprehensive examples and docs
5. Maintain high test coverage

---

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Receta core development guide
- [Module Development Guide](./docs/module-development-guide.md) - How to implement new modules
- [Result Module](./src/result/) - Reference implementation
- [Remeda LLMs](./remeda-llms.txt) - Remeda API reference
