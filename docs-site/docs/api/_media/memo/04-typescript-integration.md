# TypeScript Integration

> Type inference, generics, and type-safe memoization patterns.

## Type Inference

### Automatic Type Inference

```typescript
import { memoize } from 'receta/memo'

// TypeScript infers types automatically
const double = memoize((n: number) => n * 2)
//    ^? MemoizedFunction<[number], number>

const result = double(5)
//    ^? number
```

### Generic Functions

```typescript
function createGetter<T>(data: T[]) {
  return memoize((id: string): T | undefined => {
    return data.find((item: any) => item.id === id)
  })
}

interface User {
  id: string
  name: string
}

const users: User[] = [...]
const getUser = createGetter(users)
//    ^? MemoizedFunction<[string], User | undefined>

const user = getUser('123')
//    ^? User | undefined
```

### Async Type Inference

```typescript
const fetchUser = memoizeAsync(async (id: string) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json() as Promise<User>
})
//    ^? MemoizedAsyncFunction<[string], User>

const user = await fetchUser('123')
//    ^? User
```

## Cache Types

```typescript
interface Cache<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
}
```

## Next Steps

- **Handle errors** → [Error Handling](./05-error-handling.md)
- **Best practices** → [Patterns](./06-patterns.md)
