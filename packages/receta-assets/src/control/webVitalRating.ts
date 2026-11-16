import * as R from 'remeda'
import { switchCase } from '@ontologyio/receta/function'
import { lte } from '@ontologyio/receta/predicate'

export type WebVitalRatingName = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB'

export type WebVitalRatingLabel = 'good' | 'needs-improvement' | 'poor'

/** Google's thresholds: at or below the first is good, above the second is poor. */
const THRESHOLDS: Readonly<Record<WebVitalRatingName, readonly [good: number, poor: number]>> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
}

/**
 * Rates a Core Web Vitals measurement as good, needs-improvement or poor, using Google's thresholds.
 *
 * Use when: real-user monitoring or a lab run reports metrics and a dashboard, an alert or a CI
 * budget needs the rating. Takes the `{ name, value }` shape the `web-vitals` library reports;
 * times are in milliseconds and CLS has no unit. Thresholds: LCP 2500/4000, INP 200/500, CLS
 * 0.1/0.25, FCP 1800/3000, TTFB 800/1800. A value equal to a threshold gets the better rating.
 *
 * @example
 * ```ts
 * webVitalRating({ name: 'LCP', value: 2500 })
 * // => 'good'
 *
 * webVitalRating({ name: 'INP', value: 350 })
 * // => 'needs-improvement'
 *
 * R.map([{ name: 'CLS', value: 0.31 }, { name: 'TTFB', value: 120 }] as const, webVitalRating)
 * // => ['poor', 'good']
 * ```
 *
 * @tags web vitals, lcp, inp, cls, performance, rum, lighthouse, rating, threshold
 * @see switchCase - @ontologyio/receta/function, the two thresholds and the fallback
 * @see bandOf - the same idea with thresholds you choose
 */
export function webVitalRating(metric: {
  readonly name: WebVitalRatingName
  readonly value: number
}): WebVitalRatingLabel {
  const [good, poor] = THRESHOLDS[metric.name]
  return switchCase<number, WebVitalRatingLabel>(
    [
      [lte(good), R.constant('good')],
      [lte(poor), R.constant('needs-improvement')],
    ],
    'poor',
    metric.value,
  )
}
