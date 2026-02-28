/**
 * Composes async functions from left to right.
 *
 * Like Remeda's `pipe`, but handles async functions by awaiting each step
 * before passing the result to the next function. Useful for chaining
 * async transformations in a readable, sequential manner.
 *
 * **Note**: All functions are executed sequentially (not in parallel).
 * For parallel execution, use `parallel` or `mapAsync`.
 *
 * @example
 * ```typescript
 * // Sequential API calls
 * const result = await pipeAsync(
 *   userId,
 *   (id) => fetchUser(id),
 *   (user) => fetchUserPosts(user.id),
 *   (posts) => posts.filter(p => p.published),
 *   (posts) => posts.map(p => p.title)
 * )
 * // => ['Post 1', 'Post 2', ...]
 * ```
 *
 * @example
 * ```typescript
 * // Mix sync and async functions
 * const processOrder = await pipeAsync(
 *   orderId,
 *   (id) => fetchOrder(id),          // async
 *   (order) => order.items,          // sync
 *   async (items) => {               // async
 *     const prices = await Promise.all(items.map(getPriceAsync))
 *     return prices
 *   },
 *   (prices) => prices.reduce((a, b) => a + b, 0)  // sync
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Error handling with Result pattern
 * import { tryCatchAsync, map, unwrapOr } from 'receta/result'
 *
 * const safeResult = await pipeAsync(
 *   userId,
 *   (id) => tryCatchAsync(() => fetchUser(id)),
 *   (userResult) => map(userResult, u => u.email)
 * )
 * const email = unwrapOr(safeResult, 'unknown@example.com')
 * ```
 *
 * @example
 * ```typescript
 * // Data transformation pipeline
 * const report = await pipeAsync(
 *   'raw-data.json',
 *   (file) => fs.readFile(file, 'utf-8'),
 *   (content) => JSON.parse(content),
 *   async (data) => {
 *     const enriched = await enrichData(data)
 *     return enriched
 *   },
 *   (data) => generateReport(data)
 * )
 * ```
 *
 * @see sequential - for executing an array of async tasks in order
 * @see https://remedajs.com/docs#pipe - Remeda's sync pipe function
 */
export function pipeAsync<A, B>(
  value: A,
  fn1: (a: A) => B | Promise<B>
): Promise<B>

export function pipeAsync<A, B, C>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>
): Promise<C>

export function pipeAsync<A, B, C, D>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>
): Promise<D>

export function pipeAsync<A, B, C, D, E>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>
): Promise<E>

export function pipeAsync<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>
): Promise<F>

export function pipeAsync<A, B, C, D, E, F, G>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>
): Promise<G>

export function pipeAsync<A, B, C, D, E, F, G, H>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>
): Promise<H>

export function pipeAsync<A, B, C, D, E, F, G, H, I>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>
): Promise<I>

export function pipeAsync<A, B, C, D, E, F, G, H, I, J>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>,
  fn9: (i: I) => J | Promise<J>
): Promise<J>

export function pipeAsync<A, B, C, D, E, F, G, H, I, J, K>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>,
  fn9: (i: I) => J | Promise<J>,
  fn10: (j: J) => K | Promise<K>
): Promise<K>

// Implementation
export async function pipeAsync(
  initialValue: any,
  ...fns: Array<(arg: any) => any>
): Promise<any> {
  let result = initialValue

  for (const fn of fns) {
    result = await fn(result)
  }

  return result
}
