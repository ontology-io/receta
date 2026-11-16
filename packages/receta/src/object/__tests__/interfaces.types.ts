// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
// A value typed by an interface has no index signature, so it is not a Record<string, unknown>.
import * as R from 'remeda'
import type { Option } from '../../option'
import type { Result } from '../../result'
import {
  compact,
  deepMerge,
  filterKeys,
  filterValues,
  flatten,
  getPath,
  mapKeys,
  mapValues,
  mask,
  rename,
  setPath,
  stripEmpty,
  stripUndefined,
  transformKeys,
  unflatten,
  updatePath,
  validateShape,
  type FlatObject,
  type ObjectError,
  type ObjectSchema,
  type PlainObject,
} from '../index'

interface Address {
  city: string
  zip?: string
}

interface User {
  id: number
  name: string
  address: Address
}

interface FlatSettings {
  'theme.mode': string
}

declare const user: User
declare const settings: FlatSettings

// Reading and writing a path
export const city: Option<string> = getPath<string>(['address', 'city'], user)
export const cityInPipe: Option<string> = R.pipe(user, getPath<string>(['address', 'city']))
export const moved: User = setPath(['address', 'city'], 'Cairo', user)
export const movedInPipe: User = R.pipe(user, setPath(['address', 'city'], 'Cairo'))
export const renamedCity: User = updatePath(['address', 'city'], (value: string) => value.trim(), user)
export const renamedCityInPipe: User = R.pipe(
  user,
  updatePath(['address', 'city'], (value: string) => value.trim())
)

// Functions that keep the object's own type
export const withoutNullish: Partial<User> = compact(user)
export const withoutUndefined: Partial<User> = stripUndefined(user)
export const publicFields: Partial<User> = mask(user, ['id', 'name'])
export const publicFieldsInPipe: Partial<User> = R.pipe(user, mask(['id', 'name']))
export const someKeys: Partial<User> = filterKeys(user, (key) => key !== 'id')
export const someKeysInPipe: Partial<User> = R.pipe(
  user,
  filterKeys((key) => key !== 'id')
)
export const someValues: Partial<User> = filterValues(user, (value) => value !== undefined)
export const labels: Record<keyof User, string> = mapValues(user, (value, key) => `${key}=${String(value)}`)

// Functions whose result has new keys
export const flat: FlatObject = flatten(user)
export const flatInPipe: FlatObject = R.pipe(user, flatten())
export const nested: PlainObject = unflatten(settings)
export const renamed: PlainObject = rename(user, { name: 'fullName' })
export const renamedInPipe: PlainObject = R.pipe(user, rename({ name: 'fullName' }))
export const upperKeys: PlainObject = mapKeys(user, (key) => key.toUpperCase())
export const snakeKeys: PlainObject = transformKeys(user, 'snakeCase')
export const snakeKeysInPipe: PlainObject = R.pipe(user, transformKeys('snakeCase'))
export const cleaned: PlainObject = stripEmpty(user)
export const merged: PlainObject = deepMerge([user, { name: 'Ada' }])
export const mergedInPipe: PlainObject = R.pipe([user, user], deepMerge())

// A schema for an interface
const userSchema: ObjectSchema<User> = {
  id: (value): value is number => typeof value === 'number',
  name: (value): value is string => typeof value === 'string',
  address: {
    city: (value: unknown): value is string => typeof value === 'string',
  },
}
export const validated: Result<User, ObjectError> = validateShape<User>({}, userSchema)

// Plain records still work as before
declare const record: Record<string, unknown>
export const recordPath: Option<unknown> = getPath(['a'], record)
export const recordSet: Record<string, unknown> = setPath(['a'], 1, record)

// @ts-expect-error a string is not an object
getPath(['length'], 'text')
// @ts-expect-error neither is a number
flatten(42)
