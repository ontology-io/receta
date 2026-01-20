1. Async/Promise Utilities

pipeAsync — async-aware pipe
mapAsync — parallel map with concurrency limit
mapSerial — sequential async map
filterAsync — async predicate filter
retry — retry with backoff strategy
timeout — wrap promise with timeout
debounceAsync — debounce that returns promise of latest call
throttleAsync — throttle async functions
promiseAll — typed Promise.all wrapper
promiseAllSettled — with result extraction helpers
tryCatchAsync — Result/Either pattern for async

2. Result/Error Handling (Either/Option Pattern)

Result<T, E> type — Ok<T> | Err<E>
Option<T> type — Some<T> | None
tryCatch — wrap throwing function into Result
fromNullable — convert nullable to Option
mapResult / mapOption — functor map
flatMapResult — chain Results
unwrapOr — extract with default
match — pattern match on Result/Option
collectResults — array of Results → Result of array
partitionResults — split Ok/Err

3. Validation & Parsing

validate — run validators, collect errors
validatePipe — chain validators with early exit
parseNumber / parseInt / parseFloat — safe parsing to Option
parseDate — string to Date with validation
parseJSON — safe JSON.parse to Result
parseUrl — safe URL parsing
coerce — type coercion with fallback
assertNever — exhaustiveness check helper

4. Collection Transformations (Beyond Remeda)

groupByMultiple — item can belong to multiple groups
nest — flat array → tree structure by parent reference
flatten — tree → flat array with depth/path
diffArrays — added/removed/unchanged
diffObjects — deep diff with paths
patch — apply diff to object
reorder — move item by index/predicate
paginate — chunk with metadata (page, total, hasNext)
batchBy — group consecutive items by predicate
windowSliding — sliding window over array
cartesianProduct — all combinations of arrays
combinations / permutations

5. Object Manipulation

renameKeys — bulk key renaming
transformKeys — camelCase ↔ snake_case deep
flattenObject — nested → flat with dot paths
unflattenObject — flat with dot paths → nested
defaults — deep defaults (inverse of merge)
stripNullish — remove null/undefined values deep
stripEmpty — remove empty strings/arrays/objects
diffPatch — generate JSON Patch (RFC 6902)
applyPatch — apply JSON Patch
mask — redact sensitive fields
project — GraphQL-style field selection

6. String Utilities

template — simple string interpolation
pluralize — count-aware pluralization
truncateWords — truncate by word count
slugify — URL-safe slug
highlight — wrap matches in string
parseTemplate — extract values from pattern
escapeHtml / unescapeHtml
escapeRegex
normalizeWhitespace
initials — "John Doe" → "JD"

7. Number/Math Utilities

percentage — calculate percentage
ratio — a / b with zero handling
clampPercentage — 0-100 or 0-1
interpolate — linear interpolation
normalize — scale to 0-1 range
roundTo — round to nearest step (e.g., 0.25)
formatNumber — locale-aware formatting
formatCurrency
formatBytes — 1024 → "1 KB"
formatDuration — ms → "2h 30m"
parseFormattedNumber — "1,234.56" → 1234.56

8. Date/Time Utilities

formatRelative — "2 hours ago"
isWithinRange — date within start/end
isSameDay / isSameWeek / isSameMonth
startOf / endOf — day/week/month/year
addDuration — add days/hours/etc
diffDuration — difference in units
parseISOSafe — safe ISO parsing
toISODate — date only string
overlap — check if two ranges overlap
mergeRanges — merge overlapping date ranges

9. Predicate Builders & Combinators

where — build predicate from spec { age: gt(18), active: eq(true) }
and / or / not — predicate combinators
gt / gte / lt / lte / eq / neq — comparators
between — range check
matches — regex predicate
hasKey / hasPath — object predicates
oneOf — value in set
satisfies — schema-like predicate

10. Memoization & Caching

memoize — with custom key function
memoizeWeak — WeakMap-based for object keys
memoizeAsync — async with deduplication
memoizeWithTTL — time-based expiration
memoizeLRU — LRU cache
clearMemo — clear specific memoized function

11. State & Immutable Updates

lens — focus on nested path
over — modify at lens
set — set at lens
view — get at lens
produce — immer-like draft updates
toggle — boolean toggle at path
increment / decrement — number at path
append / prepend — array at path
removeAt — remove from array at path
updateWhere — update items matching predicate

12. Comparators & Sorting

compareBy — build comparator from accessor
compareAsc / compareDesc
compareMultiple — chain comparators
naturalCompare — "item2" < "item10"
localeCompare — locale-aware string compare

13. ID & Random Generation

uuid — UUID v4
nanoid — shorter unique ID
randomElement — pick random from array
randomElements — pick n random (no repeat)
weightedRandom — weighted selection
shuffle (already in Remeda)

14. Function Composition & Control Flow

ifElse — (pred, onTrue, onFalse) as function
unless — run unless predicate
attempt — try/catch as value
guard — early return pattern
switchCase — pattern matching helper
trampoline — tail-call optimization
compose — right-to-left composition
converge — apply multiple fns, combine results
juxt — apply multiple fns, return array

15. Event/Stream Patterns

createEmitter — typed event emitter
fromEvent — event to async iterator
buffer — collect events over time window
distinctUntilChanged — skip consecutive duplicates
scan — running reduction over events
takeUntil — stop on signal

16. API/Network Patterns

fetchJSON — fetch + JSON parse + error handling
withBaseUrl — create fetch with base URL
withHeaders — create fetch with default headers
withRetry — fetch with retry
withTimeout — fetch with timeout
batchRequests — combine multiple requests
dedupeRequests — dedupe concurrent identical requests

17. Array Index Utilities

moveIndex — move item from index to index
insertAt — insert at index
updateAt — update at index
removeAtIndex — remove at index
swapAt (already in Remeda as swapIndices)
rotateLeft / rotateRight
findIndexAll — all indices matching predicate

18. Type Narrowing Helpers

assertType<T> — runtime type assertion
exhaustive — exhaustiveness helper
narrow — narrow union with predicate
brand — branded type helpers
opaque — opaque type helpers

Want me to prioritize and spec out any of these categories? I'd suggest starting with:

Result/Option — foundational for error handling
Async utilities — you'll need these constantly
Predicate builders — compose complex filters cleanly
Validation — pairs with Result pattern