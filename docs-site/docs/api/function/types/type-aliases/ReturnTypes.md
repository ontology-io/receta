# Type Alias: ReturnTypes\<Fns\>

> **ReturnTypes**\<`Fns`\> = `{ readonly [K in keyof Fns]: Fns[K] extends (args: any[]) => infer R ? R : never }`

Defined in: [function/types.ts:31](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/types.ts#L31)

Extracts the return types of a tuple of functions.

## Type Parameters

### Fns

`Fns` *extends* readonly (...`args`) => `any`[]
