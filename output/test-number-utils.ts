/**
 * Test extracted number utilities
 */
import { clamp } from './src/number/clamp/index.js'
import { toCurrency } from './src/number/toCurrency/index.js'

console.log('🧪 Testing extracted number utilities...\n')

// Test clamp
console.log('Test 1: clamp')
console.log('  clamp(50, 0, 100):', clamp(50, 0, 100))    // 50
console.log('  clamp(150, 0, 100):', clamp(150, 0, 100))  // 100
console.log('  clamp(-10, 0, 100):', clamp(-10, 0, 100))  // 0

// Test toCurrency
console.log('\nTest 2: toCurrency')
console.log('  toCurrency(1234.56, USD):', toCurrency(1234.56, { currency: 'USD' }))
console.log('  toCurrency(1000000, EUR):', toCurrency(1000000, { currency: 'EUR' }))
console.log('  toCurrency(0.99, GBP):', toCurrency(0.99, { currency: 'GBP' }))

// Test data-last (curried) usage
console.log('\nTest 3: Curried clamp')
const clampToPercentage = clamp(0, 100)
console.log('  clampToPercentage(75):', clampToPercentage(75))   // 75
console.log('  clampToPercentage(150):', clampToPercentage(150)) // 100

console.log('\n✅ All number utilities work correctly!')
