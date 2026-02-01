import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import {
  ifElse,
  when,
  unless,
  cond,
  compose,
  converge,
  juxt,
  tap,
  partial,
  flip,
  unary,
} from '../index'
import { some, unwrapOr } from '../../option'
import { ok, isOk } from '../../result'

describe('function/integration', () => {
  describe('real-world scenarios', () => {
    it('API response processing with cond and converge', () => {
      interface ApiResponse {
        status: number
        data?: any
        error?: string
      }

      const handleResponse = (response: ApiResponse) =>
        R.pipe(
          response,
          cond<ApiResponse, string>([
            [
              (r) => r.status >= 200 && r.status < 300,
              (r) => `Success: ${JSON.stringify(r.data)}`,
            ],
            [(r) => r.status >= 400 && r.status < 500, (r) => `Client Error: ${r.error}`],
            [(r) => r.status >= 500, (r) => `Server Error: ${r.error}`],
          ]),
          unwrapOr('Unknown error')
        )

      expect(handleResponse({ status: 200, data: { id: 1 } })).toBe('Success: {"id":1}')
      expect(handleResponse({ status: 404, error: 'Not found' })).toBe('Client Error: Not found')
      expect(handleResponse({ status: 500, error: 'Internal error' })).toBe(
        'Server Error: Internal error'
      )
    })

    it('form validation with when/unless chains', () => {
      interface FormData {
        email: string
        username: string
        password: string
      }

      const validateForm = (data: FormData) =>
        R.pipe(
          data,
          when(
            (data: FormData) => !data.email.includes('@'),
            (data) => ({ ...data, email: 'invalid@example.com' })
          ),
          unless((data: FormData) => data.username.length > 0, (data) => ({
            ...data,
            username: 'anonymous',
          })),
          when(
            (data: FormData) => data.password.length < 8,
            (data) => ({ ...data, password: 'default-password-12345' })
          )
        )

      const result = validateForm({
        email: 'notanemail',
        username: '',
        password: 'short',
      })

      expect(result).toEqual({
        email: 'invalid@example.com',
        username: 'anonymous',
        password: 'default-password-12345',
      })
    })

    it('data transformation pipeline with tap for debugging', () => {
      const logs: string[] = []

      const processData = R.pipe(
        [1, 2, 3, 4, 5],
        tap((arr) => logs.push(`Input: [${arr}]`)),
        R.map((x) => x * 2),
        tap((arr) => logs.push(`After doubling: [${arr}]`)),
        R.filter((x) => x > 5),
        tap((arr) => logs.push(`After filtering: [${arr}]`)),
        converge(
          (sum: number, count: number, max: number) => ({
            sum,
            count,
            max,
            average: sum / count,
          }),
          [
            (nums) => nums.reduce((a, b) => a + b, 0),
            (nums) => nums.length,
            (nums) => Math.max(...nums),
          ]
        )
      )

      const result = processData

      expect(result).toEqual({
        sum: 24,
        count: 3,
        max: 10,
        average: 8,
      })

      expect(logs).toEqual([
        'Input: [1,2,3,4,5]',
        'After doubling: [2,4,6,8,10]',
        'After filtering: [6,8,10]',
      ])
    })

    it('building complex objects with converge', () => {
      interface RawData {
        firstName: string
        lastName: string
        email: string
        scores: number[]
      }

      interface ProcessedProfile {
        fullName: string
        username: string
        domain: string
        stats: {
          totalScore: number
          averageScore: number
          maxScore: number
        }
      }

      const processProfile = converge(
        (fullName: string, username: string, domain: string, stats: any): ProcessedProfile => ({
          fullName,
          username,
          domain,
          stats,
        }),
        [
          (data: RawData) => `${data.firstName} ${data.lastName}`,
          (data: RawData) => data.email.split('@')[0]!,
          (data: RawData) => data.email.split('@')[1]!,
          (data: RawData) =>
            converge(
              (total: number, avg: number, max: number) => ({
                totalScore: total,
                averageScore: avg,
                maxScore: max,
              }),
              [
                (d: RawData) => d.scores.reduce((a, b) => a + b, 0),
                (d: RawData) => d.scores.reduce((a, b) => a + b, 0) / d.scores.length,
                (d: RawData) => Math.max(...d.scores),
              ]
            )(data),
        ]
      )

      const result = processProfile({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        scores: [85, 90, 95],
      })

      expect(result).toEqual({
        fullName: 'Alice Smith',
        username: 'alice.smith',
        domain: 'example.com',
        stats: {
          totalScore: 270,
          averageScore: 90,
          maxScore: 95,
        },
      })
    })

    it('combining partial application with composition', () => {
      const log = (level: string, module: string, message: string) =>
        `[${level}] ${module}: ${message}`

      const logError = partial(log, 'ERROR')
      const logUserError = partial(logError, 'UserModule')

      const errors = ['Invalid input', 'User not found', 'Permission denied']

      const result = R.pipe(errors, R.map(logUserError))

      expect(result).toEqual([
        '[ERROR] UserModule: Invalid input',
        '[ERROR] UserModule: User not found',
        '[ERROR] UserModule: Permission denied',
      ])
    })

    it('using flip for better partial application', () => {
      const divide = (a: number, b: number) => a / b
      const divideBy = flip(divide)

      const divideBy10 = partial(divideBy, 10)

      const values = [100, 50, 20]
      const result = values.map(divideBy10)

      expect(result).toEqual([10, 5, 2])
    })

    it('array processing with unary to fix callbacks', () => {
      const processIds = R.pipe(
        ['1', '2', '3', '10', '20'],
        R.map(unary(parseInt)),
        R.filter((n) => n > 5)
      )

      expect(processIds).toEqual([10, 20])
    })

    it('multi-way conditional with cond for state machine', () => {
      type State = 'idle' | 'loading' | 'success' | 'error'

      interface StateData {
        state: State
        data?: any
        error?: string
      }

      const getStateMessage = cond<StateData, string>([
        [(s) => s.state === 'idle', () => 'Waiting for action'],
        [(s) => s.state === 'loading', () => 'Loading...'],
        [(s) => s.state === 'success', (s) => `Success! Data: ${JSON.stringify(s.data)}`],
        [(s) => s.state === 'error', (s) => `Error: ${s.error}`],
      ])

      expect(unwrapOr(getStateMessage({ state: 'idle' }), '')).toBe('Waiting for action')
      expect(unwrapOr(getStateMessage({ state: 'loading' }), '')).toBe('Loading...')
      expect(unwrapOr(getStateMessage({ state: 'success', data: { id: 1 } }), '')).toBe(
        'Success! Data: {"id":1}'
      )
      expect(unwrapOr(getStateMessage({ state: 'error', error: 'Network failure' }), '')).toBe(
        'Error: Network failure'
      )
    })

    it('building transformation pipelines with juxt', () => {
      interface User {
        id: string
        name: string
        email: string
        age: number
      }

      const extractMetrics = juxt([
        (users: User[]) => users.length,
        (users: User[]) => users.filter((u) => u.age >= 18).length,
        (users: User[]) => R.pipe(
  users,
  R.map((u) => u.age),
  R.reduce((a, b) => a + b, 0)
) / users.length,
        (users: User[]) => Math.max(...users.map((u) => u.age)),
        (users: User[]) => Math.min(...users.map((u) => u.age)),
      ])

      const users: User[] = [
        { id: '1', name: 'Alice', email: 'alice@example.com', age: 25 },
        { id: '2', name: 'Bob', email: 'bob@example.com', age: 17 },
        { id: '3', name: 'Charlie', email: 'charlie@example.com', age: 30 },
      ]

      const [total, adults, avgAge, maxAge, minAge] = extractMetrics(users)

      expect(total).toBe(3)
      expect(adults).toBe(2)
      expect(avgAge).toBe(24)
      expect(maxAge).toBe(30)
      expect(minAge).toBe(17)
    })
  })
})
