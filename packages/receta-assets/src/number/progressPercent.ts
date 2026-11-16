import * as R from 'remeda'
import { clamp } from '@ontologyio/receta/number'

/**
 * Turns done-of-total into a whole percent for a progress bar that never misleads: 0 to 100.
 *
 * Use when: showing upload, onboarding, import or quiz progress. The percent rounds down,
 * `100` appears only when everything is done and `0` only when nothing is, so a bar never
 * looks finished early or stuck at the start: 999 of 1000 reads `99`, 1 of 1000 reads `1`.
 * Done above total reads `100`; a total of zero or less reads `0`.
 *
 * @example
 * ```ts
 * progressPercent(37, 120)
 * // => 30
 *
 * progressPercent(999, 1000)
 * // => 99
 *
 * progressPercent(1, 1000)
 * // => 1
 *
 * R.pipe(5, progressPercent(0))
 * // => 0
 * ```
 *
 * @tags progress, percent, progress bar, completion, upload, onboarding, steps
 * @see clamp - @ontologyio/receta/number, keeps a started, unfinished task between 1 and 99
 */
export function progressPercent(done: number, total: number): number
export function progressPercent(total: number): (done: number) => number
export function progressPercent(...args: unknown[]): unknown {
  return R.purry(progressPercentImplementation, args)
}

const progressPercentImplementation = (done: number, total: number): number => {
  if (total <= 0 || done <= 0) return 0
  if (done >= total) return 100
  // Multiplying first keeps 29 of 100 at 29, where 29 / 100 * 100 gives 28.999….
  return clamp(Math.floor((done * 100) / total), 1, 99)
}
