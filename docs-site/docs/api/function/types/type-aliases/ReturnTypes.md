# Type Alias: ReturnTypes\<Fns\>

> **ReturnTypes**\<`Fns`\> = `{ readonly [K in keyof Fns]: Fns[K] extends (args: any[]) => infer R ? R : never }`

Defined in: [function/types.ts:31](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/types.ts#L31)

Extracts the return types of a tuple of functions.

## Type Parameters

### Fns

`Fns` *extends* readonly (...`args`) => `any`[]
