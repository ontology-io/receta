# API Reference

Complete reference for all lens functions.

## Type Definitions

```typescript
interface Lens<S, A> {
  readonly get: (source: S) => A
  readonly set: (value: A) => (source: S) => S
}

type Path = string
```

## Constructors

### `lens()`

Create a custom lens from get/set functions.

```typescript
function lens<S, A>(
  get: (source: S) => A,
  set: (value: A) => (source: S) => S
): Lens<S, A>
```

**Example**:
```typescript
const fullNameLens = lens<User, string>(
  (user) => `${user.firstName} ${user.lastName}`,
  (name) => (user) => {
    const [firstName, lastName] = name.split(' ')
    return { ...user, firstName, lastName }
  }
)
```

### `prop()`

Create a lens for an object property.

```typescript
function prop<S, K extends keyof S>(key: K): Lens<S, S[K]>
```

**Example**:
```typescript
const nameLens = prop<User>('name')
```

### `path()`

Create a lens for a nested path (dot notation).

```typescript
function path<S, A = unknown>(pathStr: string): Lens<S, A>
```

**Example**:
```typescript
const cityLens = path<User, string>('address.city')
```

### `index()`

Create a lens for an array element.

```typescript
function index<A>(idx: number): Lens<readonly A[], A | undefined>
```

**Example**:
```typescript
const firstLens = index<Todo>(0)
```

### `optional()`

Wrap a lens to handle optional values with Option.

```typescript
function optional<S, A>(baseLens: Lens<S, A | undefined>): Lens<S, Option<A>>
```

**Example**:
```typescript
const emailLens = prop<User>('email')
const optionalEmailLens = optional(emailLens)
```

## Operations

### `view()`

Read the value focused by a lens.

```typescript
// Data-first
function view<S, A>(lens: Lens<S, A>, source: S): A

// Data-last
function view<S, A>(lens: Lens<S, A>): (source: S) => A
```

**Example**:
```typescript
view(nameLens, user) // Data-first
R.pipe(user, view(nameLens)) // Data-last
```

### `set()`

Update the value focused by a lens.

```typescript
// Data-first
function set<S, A>(lens: Lens<S, A>, value: A, source: S): S

// Data-last
function set<S, A>(lens: Lens<S, A>, value: A): (source: S) => S
```

**Example**:
```typescript
set(nameLens, 'Bob', user) // Data-first
R.pipe(user, set(nameLens, 'Bob')) // Data-last
```

### `over()`

Transform the value focused by a lens.

```typescript
// Data-first
function over<S, A>(lens: Lens<S, A>, fn: (a: A) => A, source: S): S

// Data-last
function over<S, A>(lens: Lens<S, A>, fn: (a: A) => A): (source: S) => S
```

**Example**:
```typescript
over(ageLens, (age) => age + 1, user) // Data-first
R.pipe(user, over(ageLens, (n) => n + 1)) // Data-last
```

## Composition

### `compose()`

Compose two lenses to focus deeper.

```typescript
function compose<S, A, B>(outer: Lens<S, A>, inner: Lens<A, B>): Lens<S, B>
```

**Example**:
```typescript
const addressLens = prop<User>('address')
const cityLens = prop<Address>('city')
const userCityLens = compose(addressLens, cityLens)
```

## Quick Decision Guide

| I want to...                      | Use this                         |
| --------------------------------- | -------------------------------- |
| Access a property                 | `prop(key)`                      |
| Access a nested path              | `path('a.b.c')`                  |
| Access array element              | `index(n)`                       |
| Handle optional/nullable          | `optional(lens)`                 |
| Create custom logic               | `lens(get, set)`                 |
| Read a value                      | `view(lens, data)`               |
| Update a value                    | `set(lens, value, data)`         |
| Transform a value                 | `over(lens, fn, data)`           |
| Access deep nested value          | `compose(outer, inner)`          |
| Chain multiple updates            | `R.pipe(data, set(...), set...)` |

## Type Signatures Cheat Sheet

```typescript
// Constructors
lens<S, A>: (get, set) => Lens<S, A>
prop<S>: (key: keyof S) => Lens<S, S[key]>
path<S, A>: (path: string) => Lens<S, A>
index<A>: (idx: number) => Lens<A[], A?>
optional<S, A>: (Lens<S, A?>) => Lens<S, Option<A>>

// Operations (data-first)
view<S, A>: (Lens<S, A>, S) => A
set<S, A>: (Lens<S, A>, A, S) => S
over<S, A>: (Lens<S, A>, (A) => A, S) => S

// Operations (data-last)
view<S, A>: (Lens<S, A>) => (S) => A
set<S, A>: (Lens<S, A>, A) => (S) => S
over<S, A>: (Lens<S, A>, (A) => A) => (S) => S

// Composition
compose<S, A, B>: (Lens<S, A>, Lens<A, B>) => Lens<S, B>
```

[← Back to Migration](./05-migration.md)
[← Back to README](./README.md)
