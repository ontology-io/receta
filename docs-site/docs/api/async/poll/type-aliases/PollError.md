# Type Alias: PollError

> **PollError** = \{ `attempts`: `number`; `type`: `"max_attempts"`; \} \| \{ `elapsed`: `number`; `type`: `"timeout"`; \} \| \{ `attempt`: `number`; `type`: `"stopped"`; \}

Defined in: [async/poll/index.ts:9](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/poll/index.ts#L9)

Error type returned when polling fails.
