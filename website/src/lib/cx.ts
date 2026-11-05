import * as R from 'remeda'

type ClassName = string | false | undefined

/** Joins class names, dropping anything falsy. */
export const cx = (...classNames: readonly ClassName[]): string =>
  R.pipe(classNames, R.filter(R.isTruthy), R.join(' '))
