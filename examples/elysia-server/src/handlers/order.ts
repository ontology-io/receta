import * as R from 'remeda'
import { ok, err, map, flatMap, type Result } from '@ontologyio/receta/result'
import { emitEvent } from '@ontologyio/receta-trace'

// ---------- Domain Types ----------

interface Order {
  id: string
  customerId: string
  items: Array<{ name: string; price: number; quantity: number }>
  status: 'pending' | 'validated' | 'calculated'
}

interface OrderSummary {
  orderId: string
  customerId: string
  subtotal: number
  discount: number
  tax: number
  total: number
  itemCount: number
}

interface OrderError {
  code: string
  message: string
}

// ---------- Simulated DB / Service Calls ----------

const orders: Record<string, Order> = {
  '123': {
    id: '123',
    customerId: 'cust-001',
    items: [
      { name: 'TypeScript Handbook', price: 39.99, quantity: 1 },
      { name: 'Functional Programming Stickers', price: 12.50, quantity: 3 },
    ],
    status: 'pending',
  },
  '456': {
    id: '456',
    customerId: 'cust-002',
    items: [
      { name: 'Remeda T-Shirt', price: 24.99, quantity: 2 },
    ],
    status: 'pending',
  },
}

// ---------- Pipeline Steps ----------

function lookupOrder(id: string): Result<Order, OrderError> {
  emitEvent('db-query', { table: 'orders', id })
  const order = orders[id]
  if (!order) {
    return err({ code: 'NOT_FOUND', message: `Order ${id} not found` })
  }
  emitEvent('db-hit', { orderId: order.id })
  return ok(order)
}

function validateOrder(order: Order): Result<Order, OrderError> {
  emitEvent('validation-start', { itemCount: order.items.length })

  if (order.items.length === 0) {
    return err({ code: 'EMPTY_ORDER', message: 'Order has no items' })
  }

  const hasInvalidPrice = order.items.some((item) => item.price <= 0)
  if (hasInvalidPrice) {
    return err({ code: 'INVALID_PRICE', message: 'Item has invalid price' })
  }

  emitEvent('validation-passed')
  return ok({ ...order, status: 'validated' as const })
}

function calculateTotal(order: Order): Order & { subtotal: number } {
  emitEvent('calculating', { items: order.items.length })

  const subtotal = R.pipe(
    order.items,
    R.map((item) => item.price * item.quantity),
    R.reduce((acc, val) => acc + val, 0),
  )

  emitEvent('subtotal-computed', { subtotal })
  return { ...order, subtotal, status: 'calculated' as const }
}

function applyDiscount(
  order: Order & { subtotal: number },
): Result<OrderSummary, OrderError> {
  const discountRate = order.subtotal > 50 ? 0.1 : 0
  const discount = order.subtotal * discountRate
  const afterDiscount = order.subtotal - discount
  const tax = afterDiscount * 0.08
  const total = afterDiscount + tax

  emitEvent('discount-applied', { rate: discountRate, discount })

  return ok({
    orderId: order.id,
    customerId: order.customerId,
    subtotal: Math.round(order.subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: order.items.length,
  })
}

// ---------- Main Pipeline ----------

export function processOrder(id: string): Result<OrderSummary, OrderError> {
  return R.pipe(
    ok(id),
    flatMap((id) => lookupOrder(id)),
    flatMap((order) => validateOrder(order)),
    map((order) => calculateTotal(order)),
    flatMap((order) => applyDiscount(order)),
  )
}
