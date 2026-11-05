/**
 * Writes a key as an ordinary own property.
 *
 * `target['__proto__'] = value` would swap the prototype instead, so data such as
 * parsed JSON could change what a result inherits.
 *
 * @internal
 */
export const setOwnKey = (target: object, key: PropertyKey, value: unknown): void => {
  if (key === '__proto__') {
    Object.defineProperty(target, key, { value, writable: true, enumerable: true, configurable: true })
  } else {
    ;(target as Record<PropertyKey, unknown>)[key] = value
  }
}
