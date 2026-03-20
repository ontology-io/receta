import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { withTrace } from '@ontologyio/receta-trace'
import { isOk } from '@ontologyio/receta/result'
import { processOrder } from './handlers/order'
import type { ServerWebSocket } from 'bun'

// Track connected WebSocket clients
const clients = new Set<ServerWebSocket<unknown>>()

const app = new Elysia()
  .use(cors())

  // WebSocket endpoint for real-time trace streaming
  .ws('/ws/trace', {
    open(ws) {
      clients.add(ws.raw)
      console.log(`[ws] client connected (${clients.size} total)`)
    },
    close(ws) {
      clients.delete(ws.raw)
      console.log(`[ws] client disconnected (${clients.size} total)`)
    },
    message(_ws, _message) {
      // No incoming messages expected from UI
    },
  })

  // REST endpoint: process an order with full tracing
  .get('/api/order/:id', ({ params }) => {
    const { result, trace } = withTrace(
      {
        onEvent: (event) => {
          const json = JSON.stringify(event)
          for (const ws of clients) {
            ws.send(json)
          }
        },
      },
      () => processOrder(params.id),
    )

    return {
      success: isOk(result),
      data: isOk(result) ? result.value : undefined,
      error: !isOk(result) ? result.error : undefined,
      traceId: trace.id,
      spans: trace.spans.length,
    }
  })

  // Health check
  .get('/health', () => ({ status: 'ok', clients: clients.size }))

  .listen(3000)

console.log(`
  Elysia + Receta Trace Example
  ──────────────────────────────
  Server:    http://localhost:3000
  WebSocket: ws://localhost:3000/ws/trace

  Try:
    curl http://localhost:3000/api/order/123   (success)
    curl http://localhost:3000/api/order/999   (not found)
    curl http://localhost:3000/health

  Open receta-trace-ui and click "Connect" to see real-time traces!
`)
