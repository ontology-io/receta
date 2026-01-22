import * as R from 'remeda'

/**
 * Linearly interpolates between two numbers.
 *
 * Given a progress value between 0 and 1, returns the interpolated value
 * between from and to. Useful for animations, transitions, and gradients.
 *
 * @param from - Starting value
 * @param to - Ending value
 * @param progress - Progress between 0 and 1
 * @returns The interpolated value
 *
 * @example
 * ```typescript
 * // Data-first
 * interpolate(0, 100, 0.5) // => 50
 * interpolate(0, 100, 0) // => 0
 * interpolate(0, 100, 1) // => 100
 * interpolate(10, 20, 0.25) // => 12.5
 *
 * // Data-last (in pipe)
 * pipe(
 *   progress,
 *   interpolate(startValue, endValue)
 * )
 *
 * // Real-world: Animation easing
 * const animateValue = (start: number, end: number, duration: number) => {
 *   const startTime = Date.now()
 *   return () => {
 *     const elapsed = Date.now() - startTime
 *     const progress = Math.min(elapsed / duration, 1)
 *     return interpolate(start, end, progress)
 *   }
 * }
 * ```
 */
export function interpolate(
  from: number,
  to: number,
  progress: number
): number
export function interpolate(
  from: number,
  to: number
): (progress: number) => number
export function interpolate(...args: any[]): any {
  // Data-first: interpolate(from, to, progress) - needs 3 args
  if (args.length >= 3) {
    return interpolateImpl(args[0], args[1], args[2])
  }

  // Data-last: interpolate(from, to) - needs 2 args
  if (args.length === 2) {
    const [from, to] = args
    return (progress: number) => interpolateImpl(from, to, progress)
  }

  throw new Error('interpolate requires 2 or 3 arguments')
}

function interpolateImpl(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}
