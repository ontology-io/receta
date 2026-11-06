import type { ReactNode } from 'react'
import * as R from 'remeda'
import { cx } from '@/lib/cx'
import { Arrow, Block, Figure, type FigureWordsProps, type Tone } from './figure'

// One small drawing per mental model. The labels are part of the drawing, like the text in an
// image, and each figure's words for the plain-text docs are its MDX children.

/** Some is a box with something in it, None is the same box empty. */
export const OptionBoxes = () => {
  const box = 'grid h-24 place-items-center rounded-lg font-mono text-2xl'
  return (
    <Figure>
      <div className="mx-auto grid max-w-md grid-cols-2 gap-5 text-center">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-sm">Some(42)</p>
          <div className={cx(box, 'border border-ok/40 bg-ok-soft text-ok')}>42</div>
          <p className="text-fd-muted-foreground">full</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-sm">None</p>
          <div className={cx(box, 'border border-dashed border-fd-muted-foreground/50')} />
          <p className="text-fd-muted-foreground">empty</p>
        </div>
      </div>
    </Figure>
  )
}

type LayerProps = {
  readonly name: string
  readonly note?: string
  readonly children: ReactNode
}

const Layer = ({ name, note, children }: LayerProps) => (
  <div className="rounded-lg border border-dashed border-fd-muted-foreground/40 p-3 pt-2">
    <p className="mb-2 flex items-baseline gap-2">
      <span className="font-mono text-sm">{name}</span>
      {note ? <span className="text-fd-muted-foreground">{note}</span> : null}
    </p>
    {children}
  </div>
)

/** A lens looks through the layers around a value, and only the value is in focus. */
export const LensFocus = ({ children }: FigureWordsProps) => (
  <Figure alt={children}>
    <Layer name="UserProfile" note="the whole">
      <Layer name="address">
        <Block tone="ok" className="flex flex-wrap items-baseline justify-between gap-x-3">
          city
          <span className="font-sans">Lens focuses here</span>
        </Block>
      </Layer>
    </Layer>
  </Figure>
)

type ObjectPathProps = {
  readonly title: string
  readonly operations: string
  readonly quality: string
  readonly tone: Tone
  readonly result: ReactNode
}

const ObjectPath = ({ title, operations, quality, tone, result }: ObjectPathProps) => (
  <div className="flex flex-col items-center gap-2 text-center">
    <p className="font-medium">{title}</p>
    <Block className="w-full">Raw object</Block>
    <Arrow direction="down" />
    <p className="leading-tight">
      {operations}
      <span className="block text-fd-muted-foreground">{quality}</span>
    </p>
    <Arrow direction="down" />
    <Block tone={tone} className="w-full">
      {result}
    </Block>
  </div>
)

/** The same raw object, handled by hand and handled by Receta. */
export const ObjectPaths = ({ children }: FigureWordsProps) => (
  <Figure alt={children}>
    <div className="grid grid-cols-2 gap-5">
      <ObjectPath title="Traditional" operations="Manual ops" quality="error-prone" tone="err" result="Hope it works! 🤞" />
      <ObjectPath title="Receta" operations="Safe ops" quality="type-safe" tone="ok" result="Validated Result<T>" />
    </div>
  </Figure>
)

type BlockGroupProps = { readonly title: string; readonly names: readonly string[] }

const BlockGroup = ({ title, names }: BlockGroupProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-center font-medium">{title}</p>
    {R.map(names, (name) => (
      <Block key={name} className="text-center">
        {name}
      </Block>
    ))}
  </div>
)

/** Simple blocks and combinators snap together into one comparator. */
export const ComparatorBlocks = ({ children }: FigureWordsProps) => (
  <Figure alt={children}>
    <div className="flex flex-col items-center gap-3">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <BlockGroup title="Simple blocks" names={['ascending()', 'byDate()', 'natural()']} />
        <span aria-hidden className="font-mono text-xl text-fd-muted-foreground">
          +
        </span>
        <BlockGroup title="Combinators" names={['compose()', 'reverse()', 'nullsFirst()']} />
      </div>
      <Arrow direction="down" />
      <Block tone="ok" className="w-full text-center">
        Final comparator
        <span className="block font-sans text-[0.9375rem]">What you pass to R.sort()</span>
      </Block>
    </div>
  </Figure>
)

type CallPartProps = {
  readonly label: string
  readonly className: string
  readonly children: ReactNode
}

const CallPart = ({ label, className, children }: CallPartProps) => (
  <span className="flex flex-col">
    <code className={cx('border-b-2 pb-1 whitespace-pre', className)}>{children}</code>
    {/* takes the width of the code above it, rather than widening it */}
    <span className="mt-1.5 w-0 min-w-full text-center font-sans text-sm leading-tight text-fd-muted-foreground @md:w-auto @md:whitespace-nowrap">
      {label}
    </span>
  </span>
)

/** One call, split into how it compares and what it compares. */
export const ExtractionCall = ({ children }: FigureWordsProps) => (
  <Figure caption={children}>
    <div className="flex justify-center font-mono text-xs @md:text-lg">
      <CallPart label="how to compare" className="border-fd-muted-foreground">
        ascending
      </CallPart>
      <span>(</span>
      <CallPart label="extracts the value to compare" className="border-ok text-ok">
        {'(user: User) => user.age'}
      </CallPart>
      <span>)</span>
    </div>
  </Figure>
)

type GuardrailProps = { readonly names: readonly string[] }

const Guardrail = ({ names }: GuardrailProps) => (
  <ul className="flex flex-wrap justify-center gap-2 font-mono text-[0.8125rem] text-ok">
    {R.map(names, (name) => (
      <li key={name} className="rounded-full bg-ok-soft px-2.5 py-0.5">
        {name}
      </li>
    ))}
  </ul>
)

/** The async utilities run alongside the road from input to output, and keep it safe. */
export const AsyncGuardrails = ({ children }: FigureWordsProps) => (
  <Figure alt={children}>
    <div className="relative mb-2 flex flex-col gap-4 border-y-2 border-ok px-1 py-4">
      <Guardrail names={['concurrency', 'retry', 'throttle']} />
      {/* runs down a narrow column rather than leaving an arrow at the end of a line */}
      <div className="flex flex-col items-center justify-center gap-2 @md:flex-row">
        <Block>Input</Block>
        <Arrow className="rotate-90 @md:rotate-0" />
        <Block tone="ok">Async operation</Block>
        <Arrow className="rotate-90 @md:rotate-0" />
        <Block>Output</Block>
      </div>
      <Guardrail names={['timeout', 'debounce', 'poll']} />
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-fd-card px-2 font-mono text-sm text-ok">Safe</span>
    </div>
  </Figure>
)
