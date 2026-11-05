// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { and, gte, hasProperty, isNumber, isString, matchesShape, not, or, where } from '../index'
import type { TypePredicate } from '../types'

interface Account {
  id: string
  age: number
  plan?: string
}

const accounts: readonly Account[] = [{ id: 'a', age: 20 }]

// An interface works everywhere a type alias does.
export const byWhere = R.filter(accounts, where<Account>({ age: gte(18) }))
export const inferredWhere = R.filter(accounts, where({ age: gte(18) }))
export const byShape = R.filter(accounts, matchesShape<Account>({ id: 'a' }))
export const byProperty = R.filter(accounts, hasProperty<Account, 'plan'>('plan'))
export const inferredProperty = R.filter(accounts, hasProperty('plan'))

type Cat = { kind: 'cat'; lives: number }
type Dog = { kind: 'dog'; bark: string }
type Tagged = { tag: string }

const isCat: TypePredicate<Cat | Dog, Cat> = (pet): pet is Cat => pet.kind === 'cat'
const isDog: TypePredicate<Cat | Dog, Dog> = (pet): pet is Dog => pet.kind === 'dog'
const hasTag: TypePredicate<unknown, Tagged> = (value): value is Tagged =>
  typeof value === 'object' && value !== null && 'tag' in value
const hasLives: TypePredicate<unknown, { lives: number }> = (value): value is { lives: number } =>
  typeof value === 'object' && value !== null && 'lives' in value

const pets: readonly (Cat | Dog)[] = []
const mixed: readonly (string | number | boolean)[] = []

// or keeps both guards, and and keeps what each one proves.
export const catsOrDogs: (Cat | Dog)[] = R.filter(pets, or(isCat, isDog))
export const stringsOrNumbers: (string | number)[] = R.filter(mixed, or(isString, isNumber))
export const tagged: ({ lives: number } & Tagged)[] = R.filter([] as unknown[], and(hasTag, hasLives))

// not removes what the guard proved.
export const onlyDogs: Dog[] = R.filter(pets, not(isCat))

// A guard over unknown has nothing to exclude from, so not stays a plain predicate
// rather than claiming the false branch is impossible.
export const notString = (value: unknown) => {
  if (not(isString)(value)) return 'other'
  const stillString: unknown = value
  return stillString
}

// Plain predicates keep their old types, spread included.
const isAdult = (age: number) => age >= 18
const isSenior = (age: number) => age >= 65
export const plain: boolean = and(isAdult, not(isSenior))(30)
export const spread: boolean = or(...[isAdult, isSenior])(30)
export const mixedGuard: boolean = and(isString, (text: string) => text.length > 0)('a')
