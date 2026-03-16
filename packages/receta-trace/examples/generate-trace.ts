/**
 * Generate real trace JSON from actual traced function execution.
 *
 * Run with: cd packages/receta-trace && bun run examples/generate-trace.ts
 *
 * Outputs JSON files to ../receta-trace-ui/src/lib/generated/
 * which the UI loads automatically.
 */

import * as R from 'remeda'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  traced,
  createTracer,
  tracedPipeAsync,
  toJSON,
  toTreeString,
  emitEvent,
  setTag,
  annotate,
} from '../src/index'
import { ok, err, tryCatch, map, flatMap, isOk, type Result } from '@ontologyio/receta/result'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ─────────────────────────────────────────────────
// Real functions that simulate an order pipeline
// ─────────────────────────────────────────────────

interface User {
  id: string
  name: string
  email: string
  tier: 'basic' | 'premium'
}

interface Product {
  sku: string
  name: string
  price: number
  stock: number
}

interface OrderItem {
  sku: string
  qty: number
}

interface Order {
  id: string
  userId: string
  items: OrderItem[]
}

// Simulated database
const users: Record<string, User> = {
  'user-101': { id: 'user-101', name: 'Alice Chen', email: 'alice@example.com', tier: 'premium' },
  'user-202': { id: 'user-202', name: 'Bob Smith', email: 'bob@example.com', tier: 'basic' },
}

const products: Record<string, Product> = {
  'SKU-LAPTOP': { sku: 'SKU-LAPTOP', name: 'MacBook Pro', price: 2499.99, stock: 12 },
  'SKU-MOUSE': { sku: 'SKU-MOUSE', name: 'Magic Mouse', price: 79.99, stock: 45 },
  'SKU-KB': { sku: 'SKU-KB', name: 'Mechanical Keyboard', price: 149.99, stock: 0 },
}

// ── Traced functions ──

const fetchUser = traced({ name: 'fetchUser', module: 'users' }, async (userId: string) => {
  setTag('userId', userId)
  emitEvent('cache-check', { key: `user:${userId}` })
  await sleep(15)

  const user = users[userId]
  if (!user) {
    emitEvent('cache-miss')
    return err({ code: 'USER_NOT_FOUND', userId })
  }

  emitEvent('cache-hit')
  annotate('userName', user.name)
  annotate('tier', user.tier)
  return ok(user)
})

const lookupProduct = traced({ name: 'lookupProduct', module: 'catalog' }, async (sku: string) => {
  setTag('sku', sku)
  await sleep(5)
  const product = products[sku]
  if (!product) return err({ code: 'PRODUCT_NOT_FOUND', sku })
  return ok(product)
})

const checkInventory = traced({ name: 'checkInventory', module: 'inventory' }, async (items: OrderItem[]) => {
  setTag('itemCount', items.length)
  await sleep(10)

  for (const item of items) {
    const product = products[item.sku]
    emitEvent('stock-check', { sku: item.sku, requested: item.qty, available: product?.stock ?? 0 })
    if (!product || product.stock < item.qty) {
      return err({ code: 'OUT_OF_STOCK', sku: item.sku, requested: item.qty, available: product?.stock ?? 0 })
    }
  }

  return ok({ verified: true, items: items.length })
})

const calculatePricing = traced({ name: 'calculatePricing', module: 'pricing' }, async (items: OrderItem[], user: User) => {
  await sleep(8)

  const subtotal = R.pipe(
    items,
    R.map((item) => (products[item.sku]?.price ?? 0) * item.qty),
    R.reduce((a, b) => a + b, 0),
  )

  const discount = user.tier === 'premium' ? subtotal * 0.1 : 0
  const tax = (subtotal - discount) * 0.08
  const total = subtotal - discount + tax

  setTag('subtotal', Math.round(subtotal * 100) / 100)
  setTag('discount', Math.round(discount * 100) / 100)
  setTag('total', Math.round(total * 100) / 100)
  annotate('discountReason', user.tier === 'premium' ? 'premium_member_10pct' : 'none')

  return ok({ subtotal, discount, tax, total: Math.round(total * 100) / 100 })
})

const chargePayment = traced({ name: 'chargePayment', module: 'payments' }, async (amount: number, method: string) => {
  setTag('provider', 'stripe')
  setTag('amount', amount)
  setTag('method', method)

  emitEvent('gateway-connect', { provider: 'stripe', endpoint: 'charges/create' })
  await sleep(30)

  if (amount > 5000) {
    emitEvent('fraud-check', { result: 'flagged', reason: 'high_value' })
    await sleep(20)
  }

  emitEvent('charge-authorized')
  const txnId = `txn_${Date.now()}`
  annotate('transactionId', txnId)
  return ok({ transactionId: txnId, status: 'approved' })
})

const sendConfirmation = traced({ name: 'sendConfirmation', module: 'notifications' }, async (email: string, orderId: string) => {
  setTag('channel', 'email')
  setTag('recipient', email)
  emitEvent('template-render', { template: 'order-confirmation', orderId })
  await sleep(12)
  emitEvent('email-sent', { messageId: `msg_${Date.now()}` })
  return ok({ sent: true })
})

const processOrder = traced({ name: 'processOrder', module: 'orders' }, async (order: Order) => {
  setTag('orderId', order.id)
  setTag('userId', order.userId)

  // Step 1: Fetch user
  const userResult = await fetchUser(order.userId)
  if (!isOk(userResult)) return userResult

  // Step 2: Check inventory
  const inventoryResult = await checkInventory(order.items)
  if (!isOk(inventoryResult)) return inventoryResult

  // Step 3: Calculate pricing
  const pricingResult = await calculatePricing(order.items, userResult.value)
  if (!isOk(pricingResult)) return pricingResult

  // Step 4: Charge payment
  const paymentResult = await chargePayment(pricingResult.value.total, 'credit_card')
  if (!isOk(paymentResult)) return paymentResult

  // Step 5: Send confirmation
  const confirmResult = await sendConfirmation(userResult.value.email, order.id)
  if (!isOk(confirmResult)) return confirmResult

  annotate('totalCharged', pricingResult.value.total)
  return ok({
    orderId: order.id,
    status: 'completed',
    total: pricingResult.value.total,
    transactionId: paymentResult.value.transactionId,
  })
})

// ── Parallel / concurrent functions ──

const fetchProductDetails = traced({ name: 'fetchProductDetails', module: 'catalog' }, async (skus: string[]) => {
  setTag('skuCount', skus.length)
  emitEvent('parallel-fetch-start', { skus })

  // Fetch all products in parallel
  const results = await Promise.all(
    skus.map((sku) => lookupProduct(sku)),
  )

  emitEvent('parallel-fetch-done', { fetched: results.filter(isOk).length })
  const products = results.filter(isOk).map((r) => r.value)
  return ok(products)
})

const sendNotifications = traced({ name: 'sendNotifications', module: 'notifications' }, async (user: User, orderId: string) => {
  setTag('channels', 3)

  // Send email, SMS, and push notification in parallel
  const [emailResult, smsResult, pushResult] = await Promise.all([
    sendEmail(user.email, orderId),
    sendSms(user.id, orderId),
    sendPush(user.id, orderId),
  ])

  return ok({
    email: isOk(emailResult),
    sms: isOk(smsResult),
    push: isOk(pushResult),
  })
})

const sendEmail = traced({ name: 'sendEmail', module: 'notifications' }, async (email: string, orderId: string) => {
  setTag('channel', 'email')
  setTag('recipient', email)
  emitEvent('template-render', { template: 'order-confirmation' })
  await sleep(18)
  emitEvent('delivered')
  return ok({ sent: true, messageId: `email_${Date.now()}` })
})

const sendSms = traced({ name: 'sendSms', module: 'notifications' }, async (userId: string, orderId: string) => {
  setTag('channel', 'sms')
  setTag('userId', userId)
  await sleep(25)
  emitEvent('delivered')
  return ok({ sent: true, messageId: `sms_${Date.now()}` })
})

const sendPush = traced({ name: 'sendPush', module: 'notifications' }, async (userId: string, orderId: string) => {
  setTag('channel', 'push')
  setTag('userId', userId)
  await sleep(8)
  emitEvent('delivered')
  return ok({ sent: true, messageId: `push_${Date.now()}` })
})

const enrichOrder = traced({ name: 'enrichOrder', module: 'orders' }, async (order: Order, user: User) => {
  // Fetch product details and check inventory in parallel
  const [productsResult, inventoryResult] = await Promise.all([
    fetchProductDetails(order.items.map((i) => i.sku)),
    checkInventory(order.items),
  ])

  if (!isOk(productsResult)) return productsResult
  if (!isOk(inventoryResult)) return inventoryResult

  return ok({
    products: productsResult.value,
    inventory: inventoryResult.value,
  })
})

const processOrderParallel = traced({ name: 'processOrder', module: 'orders' }, async (order: Order) => {
  setTag('orderId', order.id)
  setTag('userId', order.userId)
  setTag('pattern', 'parallel')

  // Step 1: Fetch user
  const userResult = await fetchUser(order.userId)
  if (!isOk(userResult)) return userResult

  // Step 2: Enrich order (product details + inventory check IN PARALLEL)
  const enrichResult = await enrichOrder(order, userResult.value)
  if (!isOk(enrichResult)) return enrichResult

  // Step 3: Calculate pricing
  const pricingResult = await calculatePricing(order.items, userResult.value)
  if (!isOk(pricingResult)) return pricingResult

  // Step 4: Charge payment
  const paymentResult = await chargePayment(pricingResult.value.total, 'credit_card')
  if (!isOk(paymentResult)) return paymentResult

  // Step 5: Send all notifications IN PARALLEL (email + sms + push)
  const notifResult = await sendNotifications(userResult.value, order.id)
  if (!isOk(notifResult)) return notifResult

  annotate('totalCharged', pricingResult.value.total)
  return ok({
    orderId: order.id,
    status: 'completed',
    total: pricingResult.value.total,
    transactionId: paymentResult.value.transactionId,
    notifications: notifResult.value,
  })
})

// ── Failure scenario ──

const processOrderFail = traced({ name: 'processOrder', module: 'orders' }, async (order: Order) => {
  setTag('orderId', order.id)
  setTag('userId', order.userId)

  const userResult = await fetchUser(order.userId)
  if (!isOk(userResult)) return userResult

  // This order has an out-of-stock item
  const inventoryResult = await checkInventory(order.items)
  if (!isOk(inventoryResult)) return inventoryResult

  return ok({ orderId: order.id, status: 'completed' })
})

// ─────────────────────────────────────────────────
// Execute and generate traces
// ─────────────────────────────────────────────────

async function main() {
  const outDir = join(import.meta.dir, '../../receta-trace-ui/src/lib/generated')
  mkdirSync(outDir, { recursive: true })

  // Success trace
  console.log('Generating success trace...')
  const tracer = createTracer()
  const { result: successResult, trace: successTrace } = await tracer.runAsync(() =>
    processOrder({
      id: 'ORD-2024-001',
      userId: 'user-101',
      items: [
        { sku: 'SKU-LAPTOP', qty: 1 },
        { sku: 'SKU-MOUSE', qty: 2 },
      ],
    }),
  )
  console.log(toTreeString(successTrace))
  console.log('\nResult:', successResult)

  const successJson = toJSON(successTrace)
  writeFileSync(join(outDir, 'success-trace.json'), JSON.stringify(successJson, null, 2))
  console.log(`\nWrote: ${outDir}/success-trace.json`)

  // Failure trace (out of stock)
  console.log('\n\nGenerating failure trace...')
  const { result: failResult, trace: failTrace } = await tracer.runAsync(() =>
    processOrderFail({
      id: 'ORD-2024-002',
      userId: 'user-101',
      items: [
        { sku: 'SKU-KB', qty: 1 }, // stock = 0 → out of stock
      ],
    }),
  )
  console.log(toTreeString(failTrace))
  console.log('\nResult:', failResult)

  const failJson = toJSON(failTrace)
  writeFileSync(join(outDir, 'error-trace.json'), JSON.stringify(failJson, null, 2))
  console.log(`\nWrote: ${outDir}/error-trace.json`)

  // Parallel trace
  console.log('\n\nGenerating parallel trace...')
  const { result: parallelResult, trace: parallelTrace } = await tracer.runAsync(() =>
    processOrderParallel({
      id: 'ORD-2024-003',
      userId: 'user-101',
      items: [
        { sku: 'SKU-LAPTOP', qty: 1 },
        { sku: 'SKU-MOUSE', qty: 2 },
      ],
    }),
  )
  console.log(toTreeString(parallelTrace))
  console.log('\nResult:', parallelResult)

  const parallelJson = toJSON(parallelTrace)
  writeFileSync(join(outDir, 'parallel-trace.json'), JSON.stringify(parallelJson, null, 2))
  console.log(`\nWrote: ${outDir}/parallel-trace.json`)

  // Write an index that exports all
  writeFileSync(
    join(outDir, 'index.ts'),
    `// Auto-generated by examples/generate-trace.ts
// Re-run: cd packages/receta-trace && bun run examples/generate-trace.ts

import type { TraceJSON } from '../../types'

import successData from './success-trace.json'
import errorData from './error-trace.json'
import parallelData from './parallel-trace.json'

export const generatedSuccessTrace: TraceJSON = successData as unknown as TraceJSON
export const generatedErrorTrace: TraceJSON = errorData as unknown as TraceJSON
export const generatedParallelTrace: TraceJSON = parallelData as unknown as TraceJSON
`,
  )
  console.log(`Wrote: ${outDir}/index.ts`)
}

main().catch(console.error)
