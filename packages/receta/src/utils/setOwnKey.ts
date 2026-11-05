/**
 * Writes a key as an ordinary own property.
 *
 * `target['__proto__'] = value` would swap the prototype instead, so data such as
 * parsed JSON could change what a result inherits. The key is coerced first, because
 * `['__proto__']` becomes `'__proto__'` on assignment.
 *
 * @internal
 */
export const setOwnKey = (target: object, key: unknown, value: unknown): void => {
  const name = typeof key === 'symbol' ? key : String(key)

  if (name === '__proto__') {
    Object.defineProperty(target, name, { value, writable: true, enumerable: true, configurable: true })
  } else {
    ;(target as Record<PropertyKey, unknown>)[name] = value
  }
}
