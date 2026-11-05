import * as R from 'remeda'

/** Each option's name and the `typeof` its value must have. */
export type OptionTypes = Readonly<Record<string, 'string' | 'number' | 'boolean'>>

/**
 * Decides whether a lone argument is options rather than data.
 *
 * It is options only when every key is a known option of the right type, so data
 * that merely shares a key name stays data. An empty object counts as data.
 *
 * @internal
 */
export const isOptionsObject = (value: unknown, optionTypes: OptionTypes): boolean =>
  R.isPlainObject(value) &&
  Object.keys(value).length > 0 &&
  Object.entries(value).every(
    ([key, option]) =>
      key in optionTypes && (option === undefined || typeof option === optionTypes[key])
  )
