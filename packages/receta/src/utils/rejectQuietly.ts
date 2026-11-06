/**
 * Rejects for a caller who awaits, without crashing a process that ignores the promise.
 *
 * @internal
 */
export const rejectQuietly = (message: string): Promise<never> => {
  const rejected = Promise.reject(new Error(message))
  rejected.catch(() => undefined)
  return rejected
}
