# Function: sleep()

> **sleep**(`ms`): `Promise`\<`void`\>

Defined in: [async/retry/index.ts:154](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/retry/index.ts#L154)

Sleep for a specified duration.

## Parameters

### ms

`number`

Duration in milliseconds

## Returns

`Promise`\<`void`\>

Promise that resolves after the duration

## Example

```typescript
// Wait 1 second
await sleep(1000)

// Use in sequence
console.log('Starting...')
await sleep(2000)
console.log('2 seconds later')
```
