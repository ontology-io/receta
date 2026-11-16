import * as R from 'remeda'
import { flatMap, fromNullable, unwrapOr } from '@ontologyio/receta/option'
import { and, by, isDefined, lte } from '@ontologyio/receta/predicate'

export type ResponsiveValueBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type ResponsiveValueMap<T> = { readonly base: T } & {
  readonly [K in ResponsiveValueBreakpoint]?: T
}

type Breakpoint = readonly [name: ResponsiveValueBreakpoint, minWidth: number]

/** Tailwind's default minimum widths, in CSS pixels. */
const BREAKPOINTS: readonly Breakpoint[] = [
  ['sm', 640],
  ['md', 768],
  ['lg', 1024],
  ['xl', 1280],
  ['2xl', 1536],
]

/**
 * Picks the value for a screen width from a mobile-first map such as `{ base: 1, md: 2, lg: 4 }`.
 *
 * Use when: code outside CSS needs a value per breakpoint, such as grid columns for a
 * virtualized list, chart ticks, page size or image width, and should follow the same
 * breakpoints as the stylesheet. Breakpoints are Tailwind's defaults (sm 640, md 768, lg 1024,
 * xl 1280, 2xl 1536), each a minimum width. The largest breakpoint the width reaches that has a
 * value wins; `base` covers everything below and any gap.
 *
 * @example
 * ```ts
 * const columns = { base: 1, md: 2, xl: 4 }
 *
 * responsiveValue(390, columns)
 * // => 1
 *
 * responsiveValue(1100, columns)
 * // => 2
 *
 * R.map([768, 1280, 2560], responsiveValue(columns))
 * // => [2, 4, 4]
 * ```
 *
 * @tags responsive, breakpoint, media query, screen width, mobile first, tailwind, layout
 * @see bandOf - the same "highest threshold reached" rule with your own thresholds
 * @see unwrapOr - @ontologyio/receta/option, falls back to `base`
 */
export function responsiveValue<T>(width: number, values: ResponsiveValueMap<T>): T
export function responsiveValue<T>(values: ResponsiveValueMap<T>): (width: number) => T
export function responsiveValue(...args: unknown[]): unknown {
  return R.purry(responsiveValueImplementation, args)
}

const responsiveValueImplementation = <T>(width: number, values: ResponsiveValueMap<T>): T => {
  const reached = by(([, minWidth]: Breakpoint) => minWidth, lte(width))
  const hasValue = by(([name]: Breakpoint) => values[name], isDefined)
  return R.pipe(
    fromNullable(R.findLast(BREAKPOINTS, and(reached, hasValue))),
    flatMap(([name]) => fromNullable(values[name])),
    unwrapOr(values.base),
  )
}
