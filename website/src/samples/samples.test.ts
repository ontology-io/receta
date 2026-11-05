// Every result the page claims, checked against the published package.
import { describe, expect, it } from 'bun:test'
import { emailOf } from './option.sample'
import { placeOrder, renderOrder } from './railway.sample'
import { parseOrder } from './story.sample'
import { checkPassword } from './validation.sample'

describe('story', () => {
  it('declares a syntax failure as a value', () => {
    const order = parseOrder('not json')
    expect(order._tag).toBe('Err')
  })

  it('keeps only the lines that were ordered', () => {
    const order = parseOrder('{"id":"a1","lines":[{"sku":"x","qty":1},{"sku":"y","qty":0}]}')
    expect(order).toEqual({
      _tag: 'Ok',
      value: { id: 'a1', lines: [{ sku: 'x', qty: 1 }] },
    })
  })
})

describe('railway', () => {
  it('takes a valid order to the end of the Ok track', () => {
    expect(placeOrder('{"id":"a1","lines":[{"sku":"x","qty":2}]}')._tag).toBe('Ok')
  })

  it('drops an empty order to the Err track at checkStock', () => {
    expect(renderOrder('{"id":"a2","lines":[{"sku":"x","qty":0}]}')).toBe('OUT_OF_STOCK')
  })
})

describe('option', () => {
  it('unwraps a value that is present', () => {
    expect(emailOf('1')).toBe('ada@example.com')
  })

  it('falls back when the value is absent', () => {
    expect(emailOf('2')).toBe('no email on file')
  })
})

describe('validation', () => {
  it('collects every error in one pass', () => {
    expect(checkPassword()).toEqual({
      _tag: 'Invalid',
      errors: ['At least 8 characters', 'One uppercase letter', 'One number'],
    })
  })
})
