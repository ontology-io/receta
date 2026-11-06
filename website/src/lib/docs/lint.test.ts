import { describe, expect, it } from 'bun:test'
import { lintExample, usesReceta } from './lint'

const lint = (code: string, isTsx = false) => lintExample({ code, isTsx })
const messages = (code: string): readonly string[] => lint(code).map(({ message }) => message)

describe('lintExample', () => {
  it.each([
    ['a native array method', 'const a = users.map((u) => u.name)', 'R.map'],
    ['a native sort', 'users.sort(ascending((u) => u.age))', 'R.sort'],
    ['a loop', 'for (const u of users) log(u)', 'not a loop'],
    ['a while loop', 'while (more()) step()', 'not a loop'],
    ['Promise.all', 'await Promise.all(tasks)', 'Promise.all'],
    ['.catch', 'load().catch(report)', 'tryCatchAsync'],
    ['a hand-made sleep', 'await new Promise((r) => setTimeout(r, 10))', 'sleep'],
    ['Object.keys', 'const k = Object.keys(a)', 'R.keys'],
    ['a bare JSON.parse', 'const a = JSON.parse(text)', 'parseJSON'],
    ['an inline comparison', 'R.filter(users, (u) => u.age > 18)', 'predicate'],
    ['an inline comparison in a pipe', 'R.pipe(users, R.find((u) => u.id === id))', 'predicate'],
    ['an inline conjunction', 'R.filter(users, (u) => u.a && u.b)', 'predicate'],
    ['a sort whose result is dropped', 'R.sort(users, byAge)', 'Keep the result'],
    ['a sort with only a note after it', 'R.sort(users, byAge) // sorted', 'Keep the result'],
    ['a reverse whose result is dropped', 'R.reverse(users)', 'Keep the result'],
  ])('rejects %s', (_, code, expected) => {
    expect(messages(code).join(' ')).toContain(expected)
  })

  it('runs the published plugin', () => {
    expect(messages('try { a() } catch (e) { b(e) }').join(' ')).toContain('tryCatch')
    expect(messages('function f(a: string): string | null { return null }').join(' ')).toContain('Option')
  })

  it.each([
    ['Remeda', 'const a = R.map(users, (u) => u.name)'],
    ['a namespace import', 'const a = Result.map(r, (x) => x)'],
    ['a Receta predicate', 'R.filter(users, where({ age: gt(18) }))'],
    ['a named predicate', 'R.filter(users, isAdult)'],
    ['JSON.parse inside tryCatch', 'tryCatch(() => JSON.parse(text))'],
    ['.some, which Remeda lacks', 'const a = users.some(isAdult)'],
    ['.every, which Remeda lacks', 'const a = users.every(isAdult)'],
    ['a throw, which is how retry is told to go again', 'retry(async () => { throw new Error("x") })'],
    ['for await, which has no replacement', 'for await (const a of stream) log(a)'],
    ['path.join', "const a = path.join('a', 'b')"],
    ['sleep', 'await sleep(10)'],
    ['a sort that keeps its result', 'const sorted = R.sort(users, byAge)'],
    ['a sort in a pipe', 'R.pipe(users, R.sort(byAge))'],
    ['a sort with a claim beside it', 'R.sort([2, 1], byNumber) // => [1, 2]'],
    ['a sort with a claim below it', 'R.sort([2, 1], byNumber)\n// => [1, 2]'],
  ])('accepts %s', (_, code) => {
    expect(lint(code)).toEqual([])
  })

  it('reports the line inside the example', () => {
    expect(lint('const a = 1\nconst b = c.map(f)')[0]?.line).toBe(2)
  })

  it('reads TSX', () => {
    expect(lint('const a = <ul>{items.map((i) => <li />)}</ul>', true)[0]?.message).toContain('R.map')
  })

  it('leaves a syntax error to the compiler', () => {
    expect(lint('const = ')).toEqual([])
  })
})

describe('usesReceta', () => {
  it('sees an import the author wrote or the checker resolved', () => {
    expect(usesReceta("import { ok } from '@ontologyio/receta/result'")).toBe(true)
    expect(usesReceta("import * as R from 'remeda'")).toBe(true)
  })

  it('ignores other modules', () => {
    expect(usesReceta("import _ from 'lodash'\ndeclare const fetchUser: any")).toBe(false)
  })
})
