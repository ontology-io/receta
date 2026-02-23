# Function: template()

## Call Signature

> **template**(`templateStr`, `vars`): [`Result`](../../../result/types/type-aliases/Result.md)\<`string`, [`TemplateError`](../../types/type-aliases/TemplateError.md)\>

Defined in: [string/template/index.ts:34](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/template/index.ts#L34)

Safely interpolates variables into a template string.

Uses `{{variable}}` syntax for interpolation. Returns an error if any
variables are missing from the provided values.

### Parameters

#### templateStr

`string`

The template string with {{variable}} placeholders

#### vars

[`TemplateVars`](../../types/type-aliases/TemplateVars.md)

Object containing variable values

### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`string`, [`TemplateError`](../../types/type-aliases/TemplateError.md)\>

Result with interpolated string or template error

### Example

```typescript
// Data-first
template('Hello {{name}}!', { name: 'Alice' })
// => Ok('Hello Alice!')

template('Hello {{name}}!', {})
// => Err({ type: 'missing_variable', variable: 'name' })

// Data-last (in pipe)
pipe(
  'Welcome {{user}}, you have {{count}} messages',
  template({ user: 'Bob', count: 5 })
)
// => Ok('Welcome Bob, you have 5 messages')
```

### See

parseTemplate - to extract variable names from a template

## Call Signature

> **template**(`vars`): (`templateStr`) => [`Result`](../../../result/types/type-aliases/Result.md)\<`string`, [`TemplateError`](../../types/type-aliases/TemplateError.md)\>

Defined in: [string/template/index.ts:38](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/template/index.ts#L38)

Safely interpolates variables into a template string.

Uses `{{variable}}` syntax for interpolation. Returns an error if any
variables are missing from the provided values.

### Parameters

#### vars

[`TemplateVars`](../../types/type-aliases/TemplateVars.md)

Object containing variable values

### Returns

Result with interpolated string or template error

> (`templateStr`): [`Result`](../../../result/types/type-aliases/Result.md)\<`string`, [`TemplateError`](../../types/type-aliases/TemplateError.md)\>

#### Parameters

##### templateStr

`string`

#### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`string`, [`TemplateError`](../../types/type-aliases/TemplateError.md)\>

### Example

```typescript
// Data-first
template('Hello {{name}}!', { name: 'Alice' })
// => Ok('Hello Alice!')

template('Hello {{name}}!', {})
// => Err({ type: 'missing_variable', variable: 'name' })

// Data-last (in pipe)
pipe(
  'Welcome {{user}}, you have {{count}} messages',
  template({ user: 'Bob', count: 5 })
)
// => Ok('Welcome Bob, you have 5 messages')
```

### See

parseTemplate - to extract variable names from a template
