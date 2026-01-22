/**
 * Lens Usage Examples
 *
 * Run with: bun run examples/lens-usage.ts
 */

import * as R from 'remeda'
import {
  lens,
  prop,
  path,
  index,
  compose,
  view,
  set,
  over,
  optional,
  type Lens,
} from '../src/lens'
import { some, none, isSome } from '../src/option'

// Example 1: Basic Property Lens
console.log('=== Example 1: Basic Property Lens ===')

interface User {
  name: string
  email: string
  age: number
}

const user: User = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
}

const nameLens = prop<User>('name')
const ageLens = prop<User>('age')

console.log('Original user:', user)
console.log('Name:', view(nameLens, user))
console.log('Updated name:', set(nameLens, 'Bob', user))
console.log('Incremented age:', over(ageLens, (age) => age + 1, user))

// Example 2: Nested Path Lens
console.log('\n=== Example 2: Nested Path Lens ===')

interface Address {
  street: string
  city: string
  zip: string
}

interface UserWithAddress {
  name: string
  address: Address
}

const userWithAddress: UserWithAddress = {
  name: 'Charlie',
  address: {
    street: '123 Main St',
    city: 'Boston',
    zip: '02101',
  },
}

const cityLens = path<UserWithAddress, string>('address.city')

console.log('City:', view(cityLens, userWithAddress))
console.log('Updated city:', set(cityLens, 'NYC', userWithAddress))

// Example 3: Lens Composition
console.log('\n=== Example 3: Lens Composition ===')

const addressLens = prop<UserWithAddress>('address')
const zipLens = prop<Address>('zip')
const userZipLens = compose(addressLens, zipLens)

console.log('ZIP via composition:', view(userZipLens, userWithAddress))
console.log(
  'Updated ZIP:',
  set(userZipLens, '10001', userWithAddress)
)

// Example 4: Array Index Lens
console.log('\n=== Example 4: Array Index Lens ===')

interface TodoList {
  todos: Array<{ text: string; done: boolean }>
}

const todoList: TodoList = {
  todos: [
    { text: 'Buy milk', done: false },
    { text: 'Walk dog', done: true },
    { text: 'Write code', done: false },
  ],
}

const todosLens = prop<TodoList>('todos')
const firstTodo = index<{ text: string; done: boolean }>(0)

// Compose to access first todo
const firstTodoLens = compose(todosLens, firstTodo)

console.log('First todo:', view(firstTodoLens, todoList))

// Mark first todo as done
const doneLens = lens<{ text: string; done: boolean }, boolean>(
  (todo) => todo.done,
  (done) => (todo) => ({ ...todo, done })
)

const firstTodoDoneLens = compose(firstTodoLens, doneLens)

// This has type issues due to optional undefined, skip for now
// console.log('Marked done:', set(firstTodoDoneLens, true, todoList))

// Example 5: Using Lenses in Pipes
console.log('\n=== Example 5: Using Lenses in Pipes ===')

const updatedUser = R.pipe(
  user,
  set(nameLens, 'David'),
  over(ageLens, (age) => age + 5),
  set(prop<User>('email'), 'david@example.com')
)

console.log('Pipeline updated user:', updatedUser)

// Example 6: Optional Lens
console.log('\n=== Example 6: Optional Lens ===')

interface Profile {
  username: string
  bio?: string
  website?: string
}

const profile1: Profile = {
  username: 'alice',
  bio: 'Hello world',
}

const profile2: Profile = {
  username: 'bob',
}

const bioLens = prop<Profile>('bio')
const optionalBioLens = optional(bioLens)

console.log('Profile1 bio:', view(optionalBioLens, profile1))
console.log('Profile2 bio (none):', view(optionalBioLens, profile2))

// Set bio for profile without one
const updatedProfile2 = over(
  optionalBioLens,
  (opt) => (isSome(opt) ? opt : some('New bio')),
  profile2
)

console.log('Profile2 with bio:', updatedProfile2)

// Example 7: React-style State Updates
console.log('\n=== Example 7: React-style State Updates ===')

interface AppState {
  counter: number
  settings: {
    theme: 'light' | 'dark'
    notifications: boolean
  }
}

const initialState: AppState = {
  counter: 0,
  settings: {
    theme: 'light',
    notifications: true,
  },
}

const counterLens = prop<AppState>('counter')
const themeLens = path<AppState, 'light' | 'dark'>('settings.theme')

// Simulate state updates
const newState1 = over(counterLens, (n) => n + 1, initialState)
console.log('After increment:', newState1)

const newState2 = set(themeLens, 'dark', newState1)
console.log('After theme change:', newState2)

// Chained updates in a pipe
const finalState = R.pipe(
  initialState,
  over(counterLens, (n) => n + 10),
  set(themeLens, 'dark'),
  set(path<AppState, boolean>('settings.notifications'), false)
)

console.log('Final state:', finalState)

console.log('\n=== All Examples Complete ===')
