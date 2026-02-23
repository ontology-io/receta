# compare

Compare module - Comparator builders for sorting and ordering.

Provides composable comparators for sorting arrays of complex objects with
type-safe, reusable comparison logic.

## Example

```typescript
import { ascending, compose, byDate } from 'receta/compare'

interface Issue {
  status: string
  priority: number
  createdAt: Date
}

// Multi-level sorting
issues.sort(
  compose(
    ascending(i => i.status),
    ascending(i => i.priority),
    byDate(i => i.createdAt)
  )
)
```

## References

### ascending

Re-exports [ascending](basic/functions/ascending.md)

***

### byBoolean

Re-exports [byBoolean](typed/functions/byBoolean.md)

***

### byDate

Re-exports [byDate](typed/functions/byDate.md)

***

### byKey

Re-exports [byKey](basic/functions/byKey.md)

***

### byNumber

Re-exports [byNumber](typed/functions/byNumber.md)

***

### byString

Re-exports [byString](typed/functions/byString.md)

***

### caseInsensitive

Re-exports [caseInsensitive](advanced/functions/caseInsensitive.md)

***

### ComparableExtractor

Re-exports [ComparableExtractor](types/type-aliases/ComparableExtractor.md)

***

### Comparator

Re-exports [Comparator](types/type-aliases/Comparator.md)

***

### compose

Re-exports [compose](combinators/functions/compose.md)

***

### descending

Re-exports [descending](basic/functions/descending.md)

***

### localeCompare

Re-exports [localeCompare](advanced/functions/localeCompare.md)

***

### natural

Re-exports [natural](basic/functions/natural.md)

***

### Nullable

Re-exports [Nullable](types/type-aliases/Nullable.md)

***

### nullsFirst

Re-exports [nullsFirst](combinators/functions/nullsFirst.md)

***

### nullsLast

Re-exports [nullsLast](combinators/functions/nullsLast.md)

***

### reverse

Re-exports [reverse](combinators/functions/reverse.md)

***

### StringCompareOptions

Re-exports [StringCompareOptions](types/interfaces/StringCompareOptions.md)

***

### withTiebreaker

Re-exports [withTiebreaker](combinators/functions/withTiebreaker.md)
