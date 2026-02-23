# Debounce and Throttle

> Control function execution frequency for performance and better UX

## Overview

Debounce and throttle are essential techniques for controlling how often functions execute in response to high-frequency events. They prevent performance issues and reduce unnecessary API calls while maintaining responsive user experiences.

**Key differences:**
- **Debounce**: Wait for a pause in events before executing (last call wins)
- **Throttle**: Execute at most once per time interval (first call wins)

Both patterns are critical for production applications dealing with user input, scroll events, window resizing, and API rate limits.

---

## Debounce

### What is Debouncing?

Debouncing delays function execution until a specified time has passed since the last invocation. It's like waiting for someone to finish typing before acting on their input.

**Mental Model:**
```
Events:     a---b-c-d-----e-f-g-h---------i------
Debounce:                     ^           ^
(500ms)                   Execute     Execute
```

The function only executes when events stop arriving for the specified delay period.

### Leading vs Trailing Edge

```typescript
import { debounce } from 'receta/async'

// Trailing edge (default) - execute AFTER silence
const searchTrailing = debounce(
  async (query: string) => {
    return searchAPI(query)
  },
  { delay: 300 }
)

// Leading edge - execute IMMEDIATELY on first call, then silence
const searchLeading = debounce(
  async (query: string) => {
    return searchAPI(query)
  },
  { delay: 300, leading: true }
)

// Both edges - execute on first AND last
const searchBoth = debounce(
  async (query: string) => {
    return searchAPI(query)
  },
  { delay: 300, leading: true, trailing: true }
)
```

**Visual comparison:**
```
Input:       a-b-c-d------e-f-g----------h-i-j-k----

Trailing:               ^          ^              ^
Leading:     ^                     ^              ^
Both:        ^          ^          ^          ^   ^
```

### Real-World Examples

#### 1. Search Autocomplete (Algolia-style)

```typescript
import { debounce } from 'receta/async'
import { Result } from 'receta/result'

interface SearchResult {
  id: string
  title: string
  description: string
  score: number
}

// Debounced search prevents API spam while typing
const debouncedSearch = debounce(
  async (query: string): Promise<Result<SearchResult[], string>> => {
    if (query.trim().length < 2) {
      return Result.ok([])
    }

    return Result.tryCatch(
      async () => {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error(`Search failed: ${response.statusText}`)
        return response.json()
      },
      (error) => `Search error: ${error}`
    )
  },
  { delay: 300 }
)

// React/Vue component usage
function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setQuery(value)
    setLoading(true)

    const result = await debouncedSearch(value)

    Result.match(result, {
      ok: (data) => {
        setResults(data)
        setLoading(false)
      },
      err: (error) => {
        console.error(error)
        setResults([])
        setLoading(false)
      }
    })
  }

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

**Why 300ms?** Research shows users perceive responses under 300ms as instantaneous. This delay strikes a balance between responsiveness and reducing API calls.

#### 2. Form Auto-Save (Google Docs-style)

```typescript
import { debounce } from 'receta/async'
import { Result } from 'receta/result'

interface Document {
  id: string
  content: string
  lastSaved: Date
}

interface AutoSaveOptions {
  onSaving?: () => void
  onSaved?: (doc: Document) => void
  onError?: (error: string) => void
}

function createAutoSave(
  documentId: string,
  options: AutoSaveOptions = {}
) {
  // Debounce with 2 second delay - wait for user to pause typing
  const saveDocument = debounce(
    async (content: string): Promise<Result<Document, string>> => {
      options.onSaving?.()

      return Result.tryCatch(
        async () => {
          const response = await fetch(`/api/documents/${documentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
          })

          if (!response.ok) {
            throw new Error(`Save failed: ${response.statusText}`)
          }

          return response.json()
        },
        (error) => `Failed to save document: ${error}`
      )
    },
    { delay: 2000 }
  )

  return {
    save: async (content: string) => {
      const result = await saveDocument(content)

      Result.match(result, {
        ok: (doc) => options.onSaved?.(doc),
        err: (error) => options.onError?.(error)
      })
    },

    // Force immediate save (e.g., on window close)
    flush: () => saveDocument.flush()
  }
}

// Usage
const autoSave = createAutoSave('doc-123', {
  onSaving: () => console.log('Saving...'),
  onSaved: (doc) => console.log('Saved at', doc.lastSaved),
  onError: (err) => console.error(err)
})

// User types - auto-saves after 2s of inactivity
editor.onChange((content) => autoSave.save(content))

// User closes window - force save immediately
window.addEventListener('beforeunload', () => autoSave.flush())
```

#### 3. API Call Optimization

```typescript
import { debounce } from 'receta/async'
import { Result } from 'receta/result'

// Prevent duplicate API calls when user rapidly changes filters
interface ProductFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
}

const fetchProducts = debounce(
  async (filters: ProductFilters): Promise<Result<Product[], string>> => {
    const params = new URLSearchParams()

    if (filters.category) params.set('category', filters.category)
    if (filters.priceMin) params.set('price_min', String(filters.priceMin))
    if (filters.priceMax) params.set('price_max', String(filters.priceMax))
    if (filters.inStock) params.set('in_stock', 'true')

    return Result.tryCatch(
      async () => {
        const response = await fetch(`/api/products?${params}`)
        if (!response.ok) throw new Error('Failed to fetch products')
        return response.json()
      },
      (error) => `Product fetch failed: ${error}`
    )
  },
  { delay: 500 }
)

// User adjusts multiple filters rapidly
// Only makes ONE API call 500ms after they stop
updateFilter('category', 'electronics')  // Scheduled
updateFilter('priceMax', 1000)            // Cancels previous, reschedules
updateFilter('inStock', true)             // Cancels previous, reschedules
// ... 500ms pause ...
// NOW executes with all filters
```

---

## Throttle

### What is Throttling?

Throttling ensures a function executes at most once per specified time interval. It's like a rate limiter that guarantees regular execution during continuous events.

**Mental Model:**
```
Events:     a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p
Throttle:   ^       ^       ^       ^       ^
(200ms)   Exec    Exec    Exec    Exec    Exec
```

Unlike debounce, throttle executes periodically during ongoing events.

### Leading vs Trailing Edge

```typescript
import { throttle } from 'receta/async'

// Leading edge (default) - execute FIRST call immediately
const trackScrollLeading = throttle(
  (position: number) => {
    analytics.track('scroll', { position })
  },
  { interval: 1000 }
)

// Trailing edge - execute LAST call in interval
const trackScrollTrailing = throttle(
  (position: number) => {
    analytics.track('scroll', { position })
  },
  { interval: 1000, trailing: true }
)

// Both edges - execute first AND last
const trackScrollBoth = throttle(
  (position: number) => {
    analytics.track('scroll', { position })
  },
  { interval: 1000, leading: true, trailing: true }
)
```

**Visual comparison:**
```
Input:       a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p

Leading:     ^       ^       ^       ^       ^
Trailing:            ^       ^       ^       ^
Both:        ^   ^   ^   ^   ^   ^   ^   ^   ^
```

### Real-World Examples

#### 1. Scroll Event Tracking (Analytics)

```typescript
import { throttle } from 'receta/async'

interface ScrollMetrics {
  scrollY: number
  scrollPercent: number
  viewportHeight: number
  documentHeight: number
}

// Track scroll position for analytics (Segment/Mixpanel style)
const trackScrollPosition = throttle(
  (metrics: ScrollMetrics) => {
    // Send to analytics only once per second
    window.analytics?.track('Page Scrolled', {
      scroll_depth: metrics.scrollPercent,
      position_y: metrics.scrollY,
      viewport_height: metrics.viewportHeight,
      document_height: metrics.documentHeight
    })
  },
  { interval: 1000 }
)

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY
  const viewportHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollPercent = Math.round((scrollY / (documentHeight - viewportHeight)) * 100)

  trackScrollPosition({
    scrollY,
    scrollPercent,
    viewportHeight,
    documentHeight
  })
})
```

#### 2. Progress Updates (Real-time Dashboards)

```typescript
import { throttle } from 'receta/async'

interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

// Update UI only every 100ms to prevent excessive re-renders
const updateProgressUI = throttle(
  (progress: UploadProgress) => {
    // Update progress bar
    document.querySelector('.progress-bar')?.style.width = `${progress.percent}%`
    document.querySelector('.progress-text')?.textContent =
      `${progress.loaded.toLocaleString()} / ${progress.total.toLocaleString()} bytes`
  },
  { interval: 100 }
)

async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      updateProgressUI({
        loaded: e.loaded,
        total: e.total,
        percent: Math.round((e.loaded / e.total) * 100)
      })
    }
  })

  return new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => resolve(xhr.response))
    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}
```

#### 3. Rate-Limited Webhooks

```typescript
import { throttle } from 'receta/async'
import { Result } from 'receta/result'

interface WebhookPayload {
  event: string
  data: Record<string, unknown>
  timestamp: Date
}

// Send webhooks at most once per 5 seconds to respect rate limits
const sendWebhook = throttle(
  async (payload: WebhookPayload): Promise<Result<void, string>> => {
    return Result.tryCatch(
      async () => {
        const response = await fetch(process.env.WEBHOOK_URL!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': process.env.WEBHOOK_SECRET!
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`)
        }
      },
      (error) => `Webhook delivery failed: ${error}`
    )
  },
  { interval: 5000 }
)

// Events fire rapidly, but webhook sends at most every 5s
eventEmitter.on('user.updated', (user) => {
  sendWebhook({
    event: 'user.updated',
    data: { userId: user.id, email: user.email },
    timestamp: new Date()
  })
})
```

#### 4. Window Resize Handling

```typescript
import { throttle } from 'receta/async'

interface ViewportSize {
  width: number
  height: number
  breakpoint: 'mobile' | 'tablet' | 'desktop'
}

const getBreakpoint = (width: number): ViewportSize['breakpoint'] => {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Recalculate layout only once per 200ms during resize
const handleResize = throttle(
  () => {
    const viewport: ViewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
      breakpoint: getBreakpoint(window.innerWidth)
    }

    // Update responsive components
    store.dispatch({ type: 'viewport/update', payload: viewport })

    // Re-render charts, grids, etc.
    chartManager.resize(viewport)
  },
  { interval: 200 }
)

window.addEventListener('resize', handleResize)
```

---

## Debounce vs Throttle Comparison

### Side-by-Side Behavior

```
User Action: Typing "hello world"
Timeline:    h-e-l-l-o- -w-o-r-l-d--------

Debounce (300ms):
             Cancel each time until pause
                                  ^ Execute (after typing stops)

Throttle (300ms):
             ^       ^       ^     Execute periodically
```

### Visual Comparison

```
Event Stream: ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●--------
              (continuous events)           (silence)

DEBOUNCE (500ms):
              wait  wait  wait  wait  wait  EXECUTE!
              └─────────────────────────────┘
              "Let me finish first"

THROTTLE (500ms):
              EXEC        EXEC        EXEC
              └───┘       └───┘       └───┘
              "Regular updates please"
```

### Feature Comparison Table

| Feature | Debounce | Throttle |
|---------|----------|----------|
| **Execution** | After silence | During activity |
| **Frequency** | Once after pause | Regular intervals |
| **Use Case** | Wait for completion | Rate limiting |
| **Example** | Search input | Scroll tracking |
| **User feels** | Responsive after action | Continuous feedback |
| **API calls** | Minimized drastically | Controlled rate |
| **Best for** | Intentional actions | Continuous events |

### When to Use Which

#### Use Debounce When:
✅ User needs to "finish" an action (typing, dragging, resizing)
✅ You want to wait for a pause before responding
✅ Final state is what matters, not intermediate states
✅ Examples: search, auto-save, form validation

#### Use Throttle When:
✅ Continuous events need periodic sampling
✅ You want guaranteed execution during activity
✅ Intermediate states matter for feedback
✅ Examples: scroll tracking, progress updates, analytics

---

## Real-World Patterns

### Pattern 1: Search with Loading States

```typescript
import { debounce } from 'receta/async'
import { Result } from 'receta/result'

interface SearchState {
  query: string
  results: SearchResult[]
  loading: boolean
  error: string | null
}

const createSearchManager = () => {
  let state: SearchState = {
    query: '',
    results: [],
    loading: false,
    error: null
  }

  const performSearch = debounce(
    async (query: string): Promise<Result<SearchResult[], string>> => {
      // Don't search empty queries
      if (query.trim().length === 0) {
        return Result.ok([])
      }

      const result = await Result.tryCatch(
        async () => {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
          if (!response.ok) throw new Error('Search failed')
          return response.json()
        },
        (error) => String(error)
      )

      return result
    },
    { delay: 300 }
  )

  return {
    search: async (query: string) => {
      state.query = query
      state.loading = true
      state.error = null
      updateUI(state)

      const result = await performSearch(query)

      Result.match(result, {
        ok: (results) => {
          state.results = results
          state.loading = false
          updateUI(state)
        },
        err: (error) => {
          state.error = error
          state.loading = false
          state.results = []
          updateUI(state)
        }
      })
    }
  }
}
```

### Pattern 2: Form Auto-Save with Conflict Detection

```typescript
import { debounce } from 'receta/async'
import { Result } from 'receta/result'

interface DocumentVersion {
  id: string
  content: string
  version: number
  lastModified: Date
}

const createAutoSaveManager = (documentId: string) => {
  let currentVersion = 0

  const saveDocument = debounce(
    async (
      content: string,
      expectedVersion: number
    ): Promise<Result<DocumentVersion, string>> => {
      return Result.tryCatch(
        async () => {
          const response = await fetch(`/api/documents/${documentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content,
              version: expectedVersion
            })
          })

          if (response.status === 409) {
            throw new Error('Document was modified by another user')
          }

          if (!response.ok) {
            throw new Error('Save failed')
          }

          const saved: DocumentVersion = await response.json()
          currentVersion = saved.version
          return saved
        },
        (error) => String(error)
      )
    },
    { delay: 2000 }
  )

  return {
    save: async (content: string) => {
      const result = await saveDocument(content, currentVersion)

      return Result.match(result, {
        ok: (doc) => ({
          success: true,
          message: `Saved at ${doc.lastModified.toLocaleTimeString()}`
        }),
        err: (error) => ({
          success: false,
          message: error
        })
      })
    },

    forceFlush: () => saveDocument.flush()
  }
}
```

### Pattern 3: Infinite Scroll with Throttled Loading

```typescript
import { throttle } from 'receta/async'
import { Result } from 'receta/result'

interface PaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

const createInfiniteScroll = <T>(
  fetchPage: (cursor: string | null) => Promise<Result<PaginatedResponse<T>, string>>
) => {
  let loading = false
  let cursor: string | null = null
  let hasMore = true

  const checkAndLoad = throttle(
    async () => {
      // Don't load if already loading or no more data
      if (loading || !hasMore) return

      // Check if near bottom (within 200px)
      const scrollBottom = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (documentHeight - scrollBottom < 200) {
        loading = true

        const result = await fetchPage(cursor)

        Result.match(result, {
          ok: (response) => {
            // Append new items to DOM
            renderItems(response.items)

            cursor = response.nextCursor
            hasMore = response.hasMore
            loading = false
          },
          err: (error) => {
            console.error('Failed to load more:', error)
            loading = false
          }
        })
      }
    },
    { interval: 200 }
  )

  window.addEventListener('scroll', checkAndLoad)

  return {
    destroy: () => window.removeEventListener('scroll', checkAndLoad)
  }
}
```

---

## Performance Impact

### Debounce Performance Benefits

```typescript
// WITHOUT debounce
// User types "macbook pro 16" (15 characters)
// = 15 API calls = ~750ms total time
input.addEventListener('input', (e) => {
  searchAPI(e.target.value) // Fires 15 times!
})

// WITH debounce (300ms)
// User types "macbook pro 16" (15 characters)
// = 1 API call = ~50ms total time
const debouncedSearch = debounce(searchAPI, { delay: 300 })
input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value) // Fires once!
})

// Savings: 93% fewer API calls, 10x faster
```

### Throttle Performance Benefits

```typescript
// WITHOUT throttle
// User scrolls 1000px in 2 seconds
// Scroll fires ~200 times per second
// = 400 analytics events
window.addEventListener('scroll', () => {
  trackScrollPosition() // Fires 400 times!
})

// WITH throttle (100ms)
// User scrolls 1000px in 2 seconds
// = 20 analytics events (one per 100ms)
const throttledTracker = throttle(trackScrollPosition, { interval: 100 })
window.addEventListener('scroll', throttledTracker) // Fires 20 times

// Savings: 95% fewer events, much smoother UI
```

### Memory and CPU Impact

```typescript
import { debounce, throttle } from 'receta/async'

// BAD: Creates new debounced function on every render
function Component() {
  const handleSearch = debounce((q) => search(q), { delay: 300 })
  // ❌ New instance each render = memory leak
}

// GOOD: Stable reference
function Component() {
  const handleSearch = useMemo(
    () => debounce((q) => search(q), { delay: 300 }),
    []
  )
  // ✅ Single instance = efficient
}

// Or with cleanup
function Component() {
  const handleSearchRef = useRef(
    debounce((q) => search(q), { delay: 300 })
  )

  useEffect(() => {
    return () => handleSearchRef.current.cancel()
  }, [])

  return <input onChange={(e) => handleSearchRef.current(e.target.value)} />
}
```

---

## Best Practices

### 1. Choose Appropriate Delays

```typescript
// Search input: 200-400ms (feels instant, reduces API calls)
const search = debounce(searchAPI, { delay: 300 })

// Auto-save: 1-3s (balance between data loss and API load)
const autoSave = debounce(saveDocument, { delay: 2000 })

// Scroll tracking: 100-200ms (smooth but not excessive)
const trackScroll = throttle(analytics.track, { interval: 100 })

// Window resize: 100-200ms (responsive layout updates)
const handleResize = throttle(updateLayout, { interval: 150 })

// Analytics: 500-1000ms (batch events, reduce data volume)
const trackEvent = throttle(sendAnalytics, { interval: 1000 })
```

### 2. Provide User Feedback

```typescript
import { debounce } from 'receta/async'

const searchWithFeedback = debounce(
  async (query: string) => {
    // Show searching state
    setSearching(true)

    const result = await searchAPI(query)

    // Show results or error
    Result.match(result, {
      ok: (data) => {
        setResults(data)
        setSearching(false)
      },
      err: (error) => {
        setError(error)
        setSearching(false)
      }
    })
  },
  { delay: 300 }
)

// UI shows: "Searching..." → "Found 42 results" or "No results"
```

### 3. Handle Cleanup Properly

```typescript
import { debounce, throttle } from 'receta/async'

// React example
function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) {
  const debouncedFn = useMemo(
    () => debounce(fn, { delay }),
    [fn, delay]
  )

  useEffect(() => {
    // Cancel pending calls on unmount
    return () => debouncedFn.cancel()
  }, [debouncedFn])

  return debouncedFn
}

// Vue example
export default {
  setup() {
    const handleSearch = debounce(search, { delay: 300 })

    onUnmounted(() => {
      handleSearch.cancel()
    })

    return { handleSearch }
  }
}
```

---

## Summary

### Debounce
- **Purpose**: Wait for user to finish before acting
- **Best for**: Search, auto-save, form validation, API calls
- **Typical delays**: 200-400ms (input), 1-3s (save)
- **Mental model**: "Let them finish typing first"

### Throttle
- **Purpose**: Limit execution rate during continuous events
- **Best for**: Scroll, resize, progress, analytics
- **Typical intervals**: 100-200ms (UI), 500-1000ms (analytics)
- **Mental model**: "Regular updates, not overwhelming"

### Key Takeaway
Both patterns are essential tools for production applications. Use debounce when the final value matters, use throttle when you need regular updates during continuous activity. Always consider user experience and API load when choosing delays and intervals.
