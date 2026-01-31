/**
 * Demo file showing vanilla code BEFORE eslint-plugin-receta autofix
 *
 * This file intentionally uses anti-patterns that the plugin will detect and fix:
 * - try-catch blocks instead of Result
 * - T | null | undefined instead of Option
 * - Method chaining instead of R.pipe
 */

// ❌ Anti-pattern 1: try-catch for JSON parsing
function parseConfig(json: string) {
  try {
    return JSON.parse(json)
  } catch (e) {
    throw e
  }
}

// ❌ Anti-pattern 2: Nullable return type
function findUserById(id: string): User | undefined {
  const users = [
    { id: '1', name: 'Alice', age: 30 },
    { id: '2', name: 'Bob', age: 25 },
  ]
  return users.find(u => u.id === id)
}

type User = { id: string; name: string; age: number }

// ❌ Anti-pattern 3: Method chaining
function processUsers(users: User[]) {
  return users
    .filter(u => u.age >= 18)
    .map(u => u.name.toUpperCase())
    .sort()
}

// ❌ Anti-pattern 4: try-catch in async function
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}

// ❌ Anti-pattern 5: Nullable with complex logic
function getConfigValue(key: string): string | null {
  const config: Record<string, string> = {
    apiUrl: 'https://api.example.com',
    timeout: '5000',
  }

  const value = config[key]
  return value || null
}

// ❌ Anti-pattern 6: Combined - try-catch + method chaining
async function processApiData(ids: string[]) {
  const results = []

  for (const id of ids) {
    try {
      const response = await fetch(`/api/data/${id}`)
      const data = await response.json()

      if (data && data.items) {
        const processed = data.items
          .filter((item: any) => item.active)
          .map((item: any) => item.value)

        results.push(...processed)
      }
    } catch (e) {
      console.error(`Failed to process ${id}:`, e)
    }
  }

  return results
}

// Usage examples (showing the problems)
console.log('--- Demo: Before ESLint Plugin ---')

// Problem 1: parseConfig throws instead of returning Result
try {
  const config = parseConfig('{"key":"value"}')
  console.log('Config:', config)
} catch (e) {
  console.error('Parse error:', e)
}

// Problem 2: findUserById returns undefined (easy to forget null check)
const user = findUserById('1')
console.log(user?.name) // Easy to forget the ?

// Problem 3: Method chaining is hard to refactor
const names = processUsers([
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 17 },
])
console.log('Names:', names)

// Problem 4: Async errors are hidden
fetchUserData('123').catch(e => console.error(e))

// Problem 5: getConfigValue returns null (implicit)
const apiUrl = getConfigValue('apiUrl')
if (apiUrl) {
  console.log('API URL:', apiUrl)
}

console.log('\n✅ Run: npx eslint --fix examples/before-eslint-plugin.ts')
console.log('✅ This file will be transformed to use Receta/Remeda patterns!')
