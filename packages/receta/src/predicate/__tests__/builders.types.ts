// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { and, eq, gt, neq, not, oneOf, or, where } from '../index'
import type { Predicate } from '../types'

type Role = 'admin' | 'user'
type User = { id: number; age: number; role: Role; deletedAt: Date | null }
type Todo = { id: number; optimistic?: boolean }

const users: readonly User[] = []
const todos: readonly Todo[] = []
const roles: readonly Role[] = []

// A literal fits a field typed as a union of literals.
export const onLiteralField = where<User>({ role: eq('admin') })
export const notOnLiteralField = where<User>({ role: neq('admin') })
export const oneOfLiteralField = where<User>({ role: oneOf(['admin']) })
export const inFilter = R.filter(users, where({ role: eq('admin') }))
export const inPipe = R.pipe(users, R.filter(where({ role: eq('admin') })), R.map((u) => u.role))
export const onLiterals = R.filter(roles, eq('admin'))
export const annotated: Predicate<Role> = eq('admin')

// So does null, on a field that can be null.
export const onNullable = where<User>({ deletedAt: eq(null) })

// A field that's optional on the data doesn't have to be required by the schema.
export const onOptionalField = R.filter(todos, where({ optimistic: Boolean }))

// On its own, a predicate still takes its type from the argument.
const isFive = eq(5)
export const standalone: Predicate<number> = isFive
export const standaloneCall: boolean = isFive(5)
export const standaloneList: Predicate<string> = oneOf(['a', 'b'])

// Writing the type out keeps working, and so do the combinators and generic code.
export const explicit = eq<Role>('admin')
export const combined = [and(eq(5), gt(3)), not(eq(5)), or(eq('a'), eq('b'))]
export const generic = <T>(item: T, list: readonly T[]) => R.filter(list, eq(item))
export const withoutContext = where({ age: gt(18) })({ age: 3 })
const schema = { age: gt(18) }
export const fromVariable = R.filter(users, where(schema))
const standaloneFromVariable = where(schema)
export const fromVariableCall: boolean = standaloneFromVariable({ age: 30 })
type Settings = { theme?: string; compact?: boolean }
const settings: readonly Settings[] = []
export const onAllOptional = R.filter(settings, where({ compact: Boolean }))
export const found = R.find(users, where({ id: eq(1) }))

// Being looser about literals must not let mistakes through.
// @ts-expect-error a typo in a literal
export const typo = where<User>({ role: eq('nope') })
// @ts-expect-error a typo in a list
export const typoInList = where<User>({ role: oneOf(['admin', 'nope']) })
// @ts-expect-error a typo with no annotation on where
export const typoInFilter = R.filter(roles, eq('nope'))
// @ts-expect-error the wrong type for the field
export const wrongType = where<User>({ age: eq('x') })
// @ts-expect-error a field that doesn't exist
export const wrongField = where<User>({ agee: gt(18) })
// @ts-expect-error a field that doesn't exist, with no annotation on where
export const wrongFieldInFilter = R.filter(users, where({ agee: gt(18) }))
// @ts-expect-error the wrong type for a standalone predicate
export const wrongArgument = isFive('x')
// @ts-expect-error a schema in a variable still types the predicate
export const missingField = standaloneFromVariable({})
// @ts-expect-error a schema in a variable still types its fields
export const wrongFieldType = standaloneFromVariable({ age: 'old' })
