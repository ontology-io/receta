# receta-test

**Domain-level testing utilities for business applications**

> 🚧 **Status**: Planned for future releases

## Vision

This package will extend Receta's FP testing utilities (`receta/testing`) with domain-specific testing helpers for real-world business applications.

## Planned Features

### 🔄 Event Sourcing Testing
- Event stream validation
- Aggregate testing helpers
- Projection testing utilities
- Event handler verification

### 🏗️ Domain Modeling (DDD/CQRS)
- Command/Query testing patterns
- Domain invariant validators
- Entity/Value Object test builders
- Saga testing utilities

### 🌐 API Testing
- REST API test helpers
- GraphQL operation testing
- Contract testing utilities
- Mock server patterns

### 📊 State Machine Testing
- State transition validators
- FSM property-based testing
- Workflow testing helpers

### 🔐 Authorization/Authentication Testing
- Permission testing patterns
- Role-based access testing
- Auth flow validators

## Current State

The basic FP testing utilities (matchers, laws, arbitraries) have been **moved to the core `receta` package** under `receta/testing`.

### For FP Testing

Use `receta/testing` for:
- ✅ Result/Option matchers
- ✅ Functor/Monad law testing
- ✅ Property-based testing with fast-check

```bash
npm install receta --save-dev
```

```typescript
import { recetaMatchers } from 'receta/testing'
import { testFunctorLaws } from 'receta/testing/laws'
import { result } from 'receta/testing/arbitraries'
```

See [receta/testing documentation](../../src/testing/README.md) for details.

## Contributing

Interested in shaping the future of `receta-test`? We welcome discussions and contributions!

- **Ideas**: Open an issue describing your domain testing use case
- **Patterns**: Share testing patterns you've found useful in production
- **PRs**: Propose implementations for domain-specific helpers

## License

MIT © Khaled Maher
