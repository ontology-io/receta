import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { cartesianProduct } from '../cartesianProduct'

describe('Collection.cartesianProduct', () => {
  describe('two arrays', () => {
    it('generates all combinations', () => {
      const result = cartesianProduct(['a', 'b'], [1, 2, 3])

      expect(result).toEqual([
        ['a', 1],
        ['a', 2],
        ['a', 3],
        ['b', 1],
        ['b', 2],
        ['b', 3],
      ])
    })

    it('handles empty first array', () => {
      const result = cartesianProduct([], [1, 2])

      expect(result).toEqual([])
    })

    it('handles empty second array', () => {
      const result = cartesianProduct(['a', 'b'], [])

      expect(result).toEqual([])
    })

    it('handles single element arrays', () => {
      const result = cartesianProduct(['x'], [5])

      expect(result).toEqual([['x', 5]])
    })
  })

  describe('three arrays', () => {
    it('generates all combinations', () => {
      const result = cartesianProduct(['S', 'M'], ['red', 'blue'], ['cotton'])

      expect(result).toEqual([
        ['S', 'red', 'cotton'],
        ['S', 'blue', 'cotton'],
        ['M', 'red', 'cotton'],
        ['M', 'blue', 'cotton'],
      ])
    })

    it('handles varied sizes', () => {
      const result = cartesianProduct([1, 2], ['a'], [true, false])

      expect(result).toEqual([
        [1, 'a', true],
        [1, 'a', false],
        [2, 'a', true],
        [2, 'a', false],
      ])
    })
  })

  describe('four arrays', () => {
    it('generates all combinations', () => {
      const result = cartesianProduct([1], ['a'], [true], ['x'])

      expect(result).toEqual([[1, 'a', true, 'x']])
    })

    it('handles larger combinations', () => {
      const result = cartesianProduct([1, 2], ['a', 'b'], [true, false], ['x'])

      expect(result).toHaveLength(8) // 2 * 2 * 2 * 1
    })
  })

  describe('five arrays', () => {
    it('generates all combinations', () => {
      const result = cartesianProduct([1], [2], [3], [4], [5])

      expect(result).toEqual([[1, 2, 3, 4, 5]])
    })
  })

  describe('usage patterns', () => {
    it('generates test matrix', () => {
      const browsers = ['chrome', 'firefox']
      const platforms = ['mac', 'windows']
      const versions = ['v1', 'v2']

      const matrix = cartesianProduct(browsers, platforms, versions)

      expect(matrix).toHaveLength(8) // 2 * 2 * 2
      expect(matrix[0]).toEqual(['chrome', 'mac', 'v1'])
      expect(matrix[matrix.length - 1]).toEqual(['firefox', 'windows', 'v2'])
    })

    it('generates product variants', () => {
      const sizes = ['S', 'M', 'L']
      const colors = ['red', 'blue']

      const variants = cartesianProduct(sizes, colors)

      expect(variants).toHaveLength(6)
      expect(variants).toContainEqual(['S', 'red'])
      expect(variants).toContainEqual(['L', 'blue'])
    })

    it('works with pipe for transformation', () => {
      const result = R.pipe(
        cartesianProduct(['dev', 'prod'], ['us', 'eu']),
        R.map(([env, region]) => ({ env, region, url: `${env}-${region}.example.com` }))
      )

      expect(result).toEqual([
        { env: 'dev', region: 'us', url: 'dev-us.example.com' },
        { env: 'dev', region: 'eu', url: 'dev-eu.example.com' },
        { env: 'prod', region: 'us', url: 'prod-us.example.com' },
        { env: 'prod', region: 'eu', url: 'prod-eu.example.com' },
      ])
    })
  })

  describe('edge cases', () => {
    it('handles one array', () => {
      const result = cartesianProduct([1, 2, 3])

      expect(result).toEqual([[1], [2], [3]])
    })

    it('handles empty array call', () => {
      const result = cartesianProduct()

      expect(result).toEqual([])
    })

    it('preserves type information', () => {
      const result = cartesianProduct([1, 2] as const, ['a', 'b'] as const)

      // TypeScript should infer readonly [1 | 2, 'a' | 'b'][]
      expect(result).toHaveLength(4)
    })

    it('handles large combinations efficiently', () => {
      const result = cartesianProduct(
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 5]
      )

      expect(result).toHaveLength(125) // 5 * 5 * 5
    })

    it('handles mixed types', () => {
      const result = cartesianProduct([1, 2], ['a', 'b'], [true, false])

      expect(result[0]).toEqual([1, 'a', true])
      expect(result[result.length - 1]).toEqual([2, 'b', false])
    })
  })
})
