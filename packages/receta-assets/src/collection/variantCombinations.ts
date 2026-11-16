import * as R from 'remeda'
import { cartesianProduct } from '@ontologyio/receta/collection'

export type VariantCombinationsOptions = { readonly [option: string]: readonly string[] }

export type VariantCombinationsVariant<O extends VariantCombinationsOptions> = {
  readonly [K in keyof O]: O[K][number]
}

/**
 * Lists every combination of product options, such as each size with each colour, as one record per variant.
 *
 * Use when: generating the SKUs or variant rows for a product with options, a test matrix of
 * browsers and screen sizes, or every price plan with every billing period. The first option
 * changes slowest. An option with no values means no variant can exist, so the result is `[]`.
 * A product without options has exactly one variant, `{}`.
 *
 * @example
 * ```ts
 * variantCombinations({ size: ['S', 'M'], colour: ['red', 'blue'] })
 * // => [
 * //   { size: 'S', colour: 'red' },
 * //   { size: 'S', colour: 'blue' },
 * //   { size: 'M', colour: 'red' },
 * //   { size: 'M', colour: 'blue' },
 * // ]
 *
 * R.pipe(
 *   variantCombinations({ plan: ['basic', 'pro'], billing: ['monthly', 'yearly'] }),
 *   R.map((variant) => `${variant.plan}-${variant.billing}`),
 * )
 * // => ['basic-monthly', 'basic-yearly', 'pro-monthly', 'pro-yearly']
 *
 * variantCombinations({ size: ['S', 'M'], colour: [] })
 * // => []
 *
 * variantCombinations({})
 * // => [{}]
 * ```
 *
 * @tags variants, sku, combinations, product options, matrix, cartesian product, permutations, ecommerce
 * @see cartesianProduct - @ontologyio/receta/collection, the combinations of plain lists underneath
 */
export function variantCombinations<const O extends VariantCombinationsOptions>(
  options: O,
): readonly VariantCombinationsVariant<O>[] {
  const names: readonly string[] = R.keys(options)
  // With no options there is nothing to combine, and the product's one variant has no fields.
  if (names.length === 0) return [{} as VariantCombinationsVariant<O>]
  const combinations = cartesianProduct(...R.map(names, (name) => options[name] ?? []))
  return R.map(
    combinations,
    (values) => R.fromEntries(R.zip(names, values)) as VariantCombinationsVariant<O>,
  )
}
