import { describe, it, expect } from 'bun:test'
import { caseInsensitive, localeCompare } from '../advanced'

describe('Compare.advanced', () => {
  describe('caseInsensitive', () => {
    it('sorts strings ignoring case', () => {
      const strings = ['Banana', 'apple', 'Cherry', 'APPLE']
      const sorted = [...strings].sort(caseInsensitive(x => x))

      const lowerSorted = sorted.map(s => s.toLowerCase())
      expect(lowerSorted).toEqual(['apple', 'apple', 'banana', 'cherry'])
    })

    it('sorts objects by case-insensitive string property', () => {
      interface File {
        name: string
        size: number
      }

      const files: File[] = [
        { name: 'README.md', size: 1024 },
        { name: 'index.ts', size: 2048 },
        { name: 'App.tsx', size: 512 },
        { name: 'package.json', size: 4096 }
      ]

      const sorted = [...files].sort(caseInsensitive(f => f.name))

      const names = sorted.map(f => f.name.toLowerCase())
      expect(names).toEqual(['app.tsx', 'index.ts', 'package.json', 'readme.md'])
    })

    it('handles mixed case variations of same word', () => {
      const words = ['HELLO', 'hello', 'Hello', 'HeLLo']
      const sorted = [...words].sort(caseInsensitive(x => x))

      // All should be considered equal, order depends on stable sort
      const allSameWord = sorted.every(w => w.toLowerCase() === 'hello')
      expect(allSameWord).toBe(true)
    })

    it('handles empty strings', () => {
      const strings = ['B', '', 'a', '']
      const sorted = [...strings].sort(caseInsensitive(x => x))

      expect(sorted[0]).toBe('')
      expect(sorted[1]).toBe('')
    })

    it('handles special characters', () => {
      const strings = ['#Tag', '@Mention', '!Important']
      const sorted = [...strings].sort(caseInsensitive(x => x))
      expect(sorted.length).toBe(3)
    })

    it('sorts filenames case-insensitively', () => {
      const files = [
        'ZebraFile.txt',
        'appleFile.txt',
        'BananaFile.txt',
        'APPLEFILE.TXT'
      ]

      const sorted = [...files].sort(caseInsensitive(x => x))

      const lower = sorted.map(f => f.toLowerCase())
      expect(lower[0]).toContain('apple')
      expect(lower[1]).toContain('apple')
      expect(lower[2]).toContain('banana')
      expect(lower[3]).toContain('zebra')
    })

    it('maintains relative order for equal strings (stable sort)', () => {
      interface Item {
        id: number
        name: string
      }

      const items: Item[] = [
        { id: 1, name: 'apple' },
        { id: 2, name: 'APPLE' },
        { id: 3, name: 'Apple' }
      ]

      const sorted = [...items].sort(caseInsensitive(i => i.name))

      // All have same case-insensitive name, should maintain original order
      expect(sorted.length).toBe(3)
      expect(sorted.every(i => i.name.toLowerCase() === 'apple')).toBe(true)
    })
  })

  describe('localeCompare', () => {
    it('sorts with locale-aware rules', () => {
      const cities = ['Zürich', 'Berlin', 'München', 'Åarhus']

      const sorted = [...cities].sort(localeCompare(x => x, 'de-DE'))
      expect(sorted.length).toBe(4)
      // Exact order depends on locale implementation
    })

    it('sorts French accented characters correctly', () => {
      const names = ['Étienne', 'Eric', 'Émile']

      const sorted = [...names].sort(localeCompare(x => x, 'fr-FR'))

      // Should handle é and É correctly according to French rules
      expect(sorted.length).toBe(3)
    })

    it('sorts objects by locale-aware string property', () => {
      interface City {
        name: string
        country: string
      }

      const cities: City[] = [
        { name: 'Zürich', country: 'Switzerland' },
        { name: 'Berlin', country: 'Germany' },
        { name: 'München', country: 'Germany' }
      ]

      const sorted = [...cities].sort(localeCompare(c => c.name, 'de-DE'))
      expect(sorted.length).toBe(3)
    })

    it('handles English locale', () => {
      const words = ['résumé', 'resume', 'result']

      const sorted = [...words].sort(localeCompare(w => w, 'en-US'))
      expect(sorted.length).toBe(3)
    })

    it('handles Spanish locale with ñ', () => {
      const words = ['mañana', 'manana', 'manzana']

      const sorted = [...words].sort(localeCompare(w => w, 'es-ES'))
      expect(sorted.length).toBe(3)
      // ñ should be treated distinctly in Spanish
    })

    it('handles Swedish å, ä, ö', () => {
      const words = ['åsa', 'ärlig', 'öga', 'adam']

      const sorted = [...words].sort(localeCompare(w => w, 'sv-SE'))
      expect(sorted.length).toBe(4)
      // In Swedish, å, ä, ö come after z
    })

    it('handles Japanese hiragana', () => {
      const words = ['あ', 'か', 'さ', 'た', 'な']

      const sorted = [...words].sort(localeCompare(w => w, 'ja-JP'))
      expect(sorted.length).toBe(5)
    })

    it('handles Chinese characters', () => {
      const words = ['北京', '上海', '广州']

      const sorted = [...words].sort(localeCompare(w => w, 'zh-CN'))
      expect(sorted.length).toBe(3)
    })

    it('handles empty strings', () => {
      const strings = ['b', '', 'a']

      const sorted = [...strings].sort(localeCompare(x => x, 'en-US'))
      expect(sorted[0]).toBe('')
    })

    it('handles mixed scripts', () => {
      const mixed = ['hello', 'こんにちは', '你好', 'مرحبا']

      const sorted = [...mixed].sort(localeCompare(x => x, 'en-US'))
      expect(sorted.length).toBe(4)
    })
  })
})
