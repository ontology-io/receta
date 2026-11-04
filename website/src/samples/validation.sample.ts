import { fromPredicate, validate } from '@ontologyio/receta/validation'

const isLong = (password: string): boolean => password.length >= 8
const hasUpper = (password: string): boolean => /[A-Z]/.test(password)
const hasDigit = (password: string): boolean => /[0-9]/.test(password)

export const checkPassword = () =>
// #region sample
validate('abc', [
  fromPredicate(isLong, 'At least 8 characters'),
  fromPredicate(hasUpper, 'One uppercase letter'),
  fromPredicate(hasDigit, 'One number'),
])
// #endregion
