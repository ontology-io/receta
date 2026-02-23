# Type Alias: PollError

> **PollError** = \{ `attempts`: `number`; `type`: `"max_attempts"`; \} \| \{ `elapsed`: `number`; `type`: `"timeout"`; \} \| \{ `attempt`: `number`; `type`: `"stopped"`; \}

Defined in: [async/poll/index.ts:9](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/poll/index.ts#L9)

Error type returned when polling fails.
