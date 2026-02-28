/**
 * Error returned when number parsing fails.
 */
export interface ParseNumberError {
  readonly _tag: 'ParseNumberError'
  readonly input: string
  readonly reason: 'not_a_number' | 'infinite' | 'invalid_integer' | 'out_of_radix_range'
  readonly message: string
}

/**
 * Creates a ParseNumberError.
 */
export function createParseNumberError(
  input: string,
  reason: ParseNumberError['reason'],
  message: string
): ParseNumberError {
  return {
    _tag: 'ParseNumberError',
    input,
    reason,
    message,
  }
}
