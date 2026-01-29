/**
 * Generates the Cartesian product of multiple arrays.
 *
 * Creates all possible combinations by taking one element from each input array.
 * Useful for generating test matrices, A/B test variants, configuration combinations,
 * or any scenario requiring all possible combinations.
 *
 * Type-safe for 2-5 arrays with specific tuple types, falls back to generic array
 * for more than 5 arrays.
 *
 * @param arrays - Two or more arrays to combine
 * @returns Array of tuples containing all combinations
 *
 * @example
 * ```typescript
 * // Two arrays
 * cartesianProduct(['a', 'b'], [1, 2, 3])
 * // => [['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['b', 3]]
 *
 * // Three arrays (A/B test variants)
 * const sizes = ['S', 'M', 'L']
 * const colors = ['red', 'blue']
 * const materials = ['cotton', 'polyester']
 *
 * cartesianProduct(sizes, colors, materials)
 * // => [
 * //   ['S', 'red', 'cotton'],
 * //   ['S', 'red', 'polyester'],
 * //   ['S', 'blue', 'cotton'],
 * //   ['S', 'blue', 'polyester'],
 * //   ['M', 'red', 'cotton'],
 * //   ...
 * // ]
 *
 * // Test matrix generation
 * const browsers = ['chrome', 'firefox', 'safari']
 * const platforms = ['mac', 'windows', 'linux']
 * const versions = ['v1', 'v2']
 *
 * cartesianProduct(browsers, platforms, versions)
 * // => [
 * //   ['chrome', 'mac', 'v1'],
 * //   ['chrome', 'mac', 'v2'],
 * //   ['chrome', 'windows', 'v1'],
 * //   ...
 * // ]
 *
 * // Configuration combinations
 * pipe(
 *   cartesianProduct(['dev', 'prod'], ['us', 'eu'], ['v1', 'v2']),
 *   R.map(([env, region, version]) => ({
 *     env,
 *     region,
 *     version,
 *     url: `https://${env}-${region}.example.com/${version}`
 *   }))
 * )
 * ```
 *
 * @see zip - for pairing elements at same index
 */

// Type-safe overloads for 2-5 arrays
export function cartesianProduct<A, B>(
  arr1: readonly A[],
  arr2: readonly B[]
): readonly [A, B][]

export function cartesianProduct<A, B, C>(
  arr1: readonly A[],
  arr2: readonly B[],
  arr3: readonly C[]
): readonly [A, B, C][]

export function cartesianProduct<A, B, C, D>(
  arr1: readonly A[],
  arr2: readonly B[],
  arr3: readonly C[],
  arr4: readonly D[]
): readonly [A, B, C, D][]

export function cartesianProduct<A, B, C, D, E>(
  arr1: readonly A[],
  arr2: readonly B[],
  arr3: readonly C[],
  arr4: readonly D[],
  arr5: readonly E[]
): readonly [A, B, C, D, E][]

// Generic fallback for 6+ arrays
export function cartesianProduct<T>(
  ...arrays: readonly (readonly T[])[]
): readonly T[][]

export function cartesianProduct(...arrays: readonly (readonly unknown[])[]): readonly unknown[][] {
  return cartesianProductImplementation(arrays)
}

function cartesianProductImplementation(arrays: readonly (readonly unknown[])[]): readonly unknown[][] {
  if (arrays.length === 0) {
    return []
  }

  if (arrays.length === 1) {
    return arrays[0]!.map((item) => [item])
  }

  // Start with first array as single-element tuples
  let result: unknown[][] = arrays[0]!.map((item) => [item])

  // For each remaining array, combine with existing results
  for (let i = 1; i < arrays.length; i++) {
    const currentArray = arrays[i]!
    const newResult: unknown[][] = []

    for (const existingTuple of result) {
      for (const item of currentArray) {
        newResult.push([...existingTuple, item])
      }
    }

    result = newResult
  }

  return result
}
