import * as R from 'remeda'
import { fromNullable, map, type Option } from '@ontologyio/receta/option'
import { lte } from '@ontologyio/receta/predicate'

export type ScoreToGradeBand<G> = {
  /** The lowest score that earns this grade. */
  readonly min: number
  readonly grade: G
}

/**
 * Finds the grade, tier or band a score falls into, from a list of minimum scores.
 *
 * Use when: turning a test score into a letter grade, loyalty points into a tier, or a
 * credit or risk score into a label. A score earns the band with the highest `min` that it
 * reaches, and the bands may be listed in any order. Returns `None` when the score is
 * below every band or isn't a number, so a missing band shows up instead of a wrong label.
 *
 * @example
 * ```ts
 * const letters = [
 *   { min: 90, grade: 'A' },
 *   { min: 80, grade: 'B' },
 *   { min: 70, grade: 'C' },
 *   { min: 0, grade: 'F' },
 * ]
 *
 * scoreToGrade(84, letters)
 * // => Some('B')
 *
 * scoreToGrade(-5, letters)
 * // => None
 *
 * R.pipe(1500, scoreToGrade([{ min: 5000, grade: 'gold' }, { min: 1000, grade: 'silver' }, { min: 0, grade: 'bronze' }]))
 * // => Some('silver')
 * ```
 *
 * @tags grade, tier, band, threshold, level, score, bucket, classify, loyalty
 * @see lte - @ontologyio/receta/predicate, whether a band's minimum is reached
 * @see fromNullable - @ontologyio/receta/option, None when no band matches
 */
export function scoreToGrade<G>(score: number, bands: readonly ScoreToGradeBand<G>[]): Option<G>
export function scoreToGrade<G>(bands: readonly ScoreToGradeBand<G>[]): (score: number) => Option<G>
export function scoreToGrade(...args: unknown[]): unknown {
  return R.purry(scoreToGradeImplementation, args)
}

const scoreToGradeImplementation = <G>(score: number, bands: readonly ScoreToGradeBand<G>[]): Option<G> => {
  const reached = lte(score)
  return R.pipe(
    bands,
    R.sortBy([R.prop('min'), 'desc']),
    R.find((band) => reached(band.min)),
    fromNullable,
    map((band) => band.grade),
  )
}
