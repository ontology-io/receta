# Interface: CurrencyOptions

Defined in: [number/types.ts:61](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/types.ts#L61)

Options for currency formatting.

## Properties

### currency

> `readonly` **currency**: `string`

Defined in: [number/types.ts:66](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/types.ts#L66)

Currency code (ISO 4217).

#### Example

```ts
'USD', 'EUR', 'GBP'
```

***

### decimals?

> `readonly` `optional` **decimals**: `number`

Defined in: [number/types.ts:84](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/types.ts#L84)

Number of decimal places.

#### Default

```ts
2
```

***

### locale?

> `readonly` `optional` **locale**: `string`

Defined in: [number/types.ts:72](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/types.ts#L72)

Locale to use for formatting.

#### Default

```ts
'en-US'
```

***

### showSymbol?

> `readonly` `optional` **showSymbol**: `boolean`

Defined in: [number/types.ts:78](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/types.ts#L78)

Whether to display the currency symbol.

#### Default

```ts
true
```
