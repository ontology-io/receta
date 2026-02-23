# Function: ttlCache()

> **ttlCache**\<`K`, `V`\>(`ttlMs`): [`Cache`](../../../types/interfaces/Cache.md)\<`K`, `V`\>

Defined in: [memo/caches/ttlCache.ts:32](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/caches/ttlCache.ts#L32)

Creates a time-to-live (TTL) cache that automatically expires entries.

Entries are removed after the specified TTL duration.
Useful for caching data that becomes stale (API responses, weather, prices, etc.).

## Type Parameters

### K

`K`

### V

`V`

## Parameters

### ttlMs

`number`

Time-to-live in milliseconds

## Returns

[`Cache`](../../../types/interfaces/Cache.md)\<`K`, `V`\>

## Example

```typescript
import { memoize, ttlCache } from 'receta/memo'

// Cache weather data for 5 minutes
const getWeather = memoize(fetchWeather, {
  cache: ttlCache(5 * 60 * 1000)
})

getWeather('NYC') // fetches from API
getWeather('NYC') // cached
// ... 5 minutes later ...
getWeather('NYC') // fetches from API again
```
