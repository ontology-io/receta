import { describe, it, expect } from 'bun:test'
import { ascending, descending, natural, byKey } from '../basic'

describe('Compare.basic', () => {
  describe('ascending', () => {
    it('sorts numbers in ascending order', () => {
      const numbers = [3, 1, 4, 1, 5, 9, 2, 6]
      const sorted = [...numbers].sort(ascending(x => x))
      expect(sorted).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts strings in ascending order', () => {
      const strings = ['zebra', 'apple', 'mango', 'banana']
      const sorted = [...strings].sort(ascending(x => x))
      expect(sorted).toEqual(['apple', 'banana', 'mango', 'zebra'])
    })

    it('sorts dates in ascending order (oldest first)', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-01-10'),
        new Date('2024-01-20')
      ]
      const sorted = [...dates].sort(ascending(x => x))
      expect(sorted[0]).toEqual(new Date('2024-01-10'))
      expect(sorted[2]).toEqual(new Date('2024-01-20'))
    })

    it('sorts objects by extracted number value', () => {
      interface User {
        name: string
        age: number
      }

      const users: User[] = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 }
      ]

      const sorted = [...users].sort(ascending(u => u.age))
      expect(sorted.map(u => u.name)).toEqual(['Bob', 'Alice', 'Charlie'])
    })

    it('sorts objects by extracted string value', () => {
      interface Product {
        name: string
        price: number
      }

      const products: Product[] = [
        { name: 'Keyboard', price: 80 },
        { name: 'Mouse', price: 25 },
        { name: 'Monitor', price: 300 }
      ]

      const sorted = [...products].sort(ascending(p => p.name))
      expect(sorted.map(p => p.name)).toEqual(['Keyboard', 'Monitor', 'Mouse'])
    })

    it('handles equal values', () => {
      const numbers = [2, 1, 2, 3, 1]
      const sorted = [...numbers].sort(ascending(x => x))
      expect(sorted).toEqual([1, 1, 2, 2, 3])
    })

    it('handles empty arrays', () => {
      const empty: number[] = []
      const sorted = [...empty].sort(ascending(x => x))
      expect(sorted).toEqual([])
    })

    it('handles single element', () => {
      const single = [42]
      const sorted = [...single].sort(ascending(x => x))
      expect(sorted).toEqual([42])
    })
  })

  describe('descending', () => {
    it('sorts numbers in descending order', () => {
      const numbers = [3, 1, 4, 1, 5, 9, 2, 6]
      const sorted = [...numbers].sort(descending(x => x))
      expect(sorted).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
    })

    it('sorts strings in descending order', () => {
      const strings = ['zebra', 'apple', 'mango', 'banana']
      const sorted = [...strings].sort(descending(x => x))
      expect(sorted).toEqual(['zebra', 'mango', 'banana', 'apple'])
    })

    it('sorts dates in descending order (most recent first)', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-01-10'),
        new Date('2024-01-20')
      ]
      const sorted = [...dates].sort(descending(x => x))
      expect(sorted[0]).toEqual(new Date('2024-01-20'))
      expect(sorted[2]).toEqual(new Date('2024-01-10'))
    })

    it('sorts objects by extracted value descending', () => {
      interface Transaction {
        id: string
        amount: number
      }

      const transactions: Transaction[] = [
        { id: 'a', amount: 100 },
        { id: 'b', amount: 500 },
        { id: 'c', amount: 200 }
      ]

      const sorted = [...transactions].sort(descending(t => t.amount))
      expect(sorted.map(t => t.amount)).toEqual([500, 200, 100])
    })
  })

  describe('natural', () => {
    it('sorts strings with numbers naturally', () => {
      const files = ['file10.txt', 'file2.txt', 'file1.txt', 'file20.txt']
      const sorted = [...files].sort(natural(x => x))
      expect(sorted).toEqual(['file1.txt', 'file2.txt', 'file10.txt', 'file20.txt'])
    })

    it('handles mixed alphanumeric strings', () => {
      const versions = ['v1.10.0', 'v1.2.0', 'v1.20.0', 'v1.9.0']
      const sorted = [...versions].sort(natural(x => x))
      expect(sorted).toEqual(['v1.2.0', 'v1.9.0', 'v1.10.0', 'v1.20.0'])
    })

    it('sorts objects by natural string order', () => {
      interface File {
        name: string
        size: number
      }

      const files: File[] = [
        { name: 'image10.png', size: 1024 },
        { name: 'image2.png', size: 2048 },
        { name: 'image1.png', size: 512 },
        { name: 'image20.png', size: 4096 }
      ]

      const sorted = [...files].sort(natural(f => f.name))
      expect(sorted.map(f => f.name)).toEqual([
        'image1.png',
        'image2.png',
        'image10.png',
        'image20.png'
      ])
    })

    it('handles strings without numbers', () => {
      const words = ['banana', 'apple', 'cherry']
      const sorted = [...words].sort(natural(x => x))
      expect(sorted).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('byKey', () => {
    it('sorts by object key (number)', () => {
      interface Product {
        id: string
        name: string
        price: number
      }

      const products: Product[] = [
        { id: 'c', name: 'Keyboard', price: 80 },
        { id: 'a', name: 'Mouse', price: 25 },
        { id: 'b', name: 'Monitor', price: 300 }
      ]

      const sorted = [...products].sort(byKey('price'))
      expect(sorted.map(p => p.price)).toEqual([25, 80, 300])
    })

    it('sorts by object key (string)', () => {
      interface Product {
        id: string
        name: string
        price: number
      }

      const products: Product[] = [
        { id: 'c', name: 'Keyboard', price: 80 },
        { id: 'a', name: 'Mouse', price: 25 },
        { id: 'b', name: 'Monitor', price: 300 }
      ]

      const sorted = [...products].sort(byKey('name'))
      expect(sorted.map(p => p.name)).toEqual(['Keyboard', 'Monitor', 'Mouse'])
    })

    it('sorts by object key (date)', () => {
      interface Event {
        name: string
        date: Date
      }

      const events: Event[] = [
        { name: 'Meeting', date: new Date('2024-01-15') },
        { name: 'Launch', date: new Date('2024-01-10') },
        { name: 'Review', date: new Date('2024-01-20') }
      ]

      const sorted = [...events].sort(byKey('date'))
      expect(sorted.map(e => e.name)).toEqual(['Launch', 'Meeting', 'Review'])
    })

    it('handles equal key values', () => {
      interface Item {
        category: string
        value: number
      }

      const items: Item[] = [
        { category: 'A', value: 10 },
        { category: 'B', value: 10 },
        { category: 'C', value: 10 }
      ]

      const sorted = [...items].sort(byKey('value'))
      expect(sorted.every(item => item.value === 10)).toBe(true)
    })
  })
})
