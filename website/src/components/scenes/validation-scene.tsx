import * as R from 'remeda'
import { CodeBlock } from '@/components/primitives/code-block'
import { Rail } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { validationContent } from '@/content/home.content'
import type { CodeLine } from '@/lib/code/tokenize'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

const RESULT_X = 150
const VALIDATION_X = 300
const GATE_Y = [250, 400, 550] as const

/** The dotted rest of the Result lane: the gates it never reaches. */
const NEVER_REACHED = R.pipe(
  R.range(0, 22),
  R.map((index) => `M ${RESULT_X} ${272 + index * 16} v 4`),
  R.join(' '),
)

type ValidationSceneProps = {
  readonly copy: typeof validationContent
  readonly code: readonly CodeLine[]
}

/** Result stops at the first failure. Validation keeps going and hands back the whole list. */
export const ValidationScene = ({ copy, code }: ValidationSceneProps) => (
  <Scene block="validation" tone="paper-2" height={SCENE_HEIGHT.validation}>
    {/* both lanes through the same gates */}
    <Rail path={RAIL.validation} height={SCENE_HEIGHT.validation} base="paper" paint="ok" token={{ x: VALIDATION_X, y: 700, size: 30 }}>
      <path d={`M ${RESULT_X} 150 V 250`} className="fill-none stroke-on-paper stroke-3" />
      <path d={NEVER_REACHED} className="fill-none stroke-paper-line stroke-3" strokeLinecap="round" />
      {copy.gates.map((gate, index) => (
        <g key={gate.rule}>
          <path d={`M 72 ${GATE_Y[index]} H 352`} className="stroke-on-paper stroke-5" strokeLinecap="round" />
          <text x={66} y={(GATE_Y[index] ?? 0) - 12} className="fill-on-paper-2 font-machine text-[14px]">
            {gate.rule}
          </text>
          <circle cx={VALIDATION_X} cy={GATE_Y[index]} r={10} className="fill-err" />
        </g>
      ))}
      <circle cx={RESULT_X} cy={GATE_Y[0]} r={10} className="fill-err" />
      <text x={RESULT_X} y={132} textAnchor="middle" className="fill-on-paper font-machine text-[16px] font-medium">
        {copy.lanes.result}
      </text>
      <text x={VALIDATION_X + 16} y={132} className="fill-on-paper font-machine text-[16px] font-medium">
        {copy.lanes.validation}
      </text>
      <text x={RESULT_X} y={656} textAnchor="middle" className="fill-on-paper font-machine text-[16px] font-medium">
        {copy.counts.result}
      </text>
      <text x={VALIDATION_X + 16} y={656} className="fill-err-text font-machine text-[16px] font-medium">
        {copy.counts.validation}
      </text>
    </Rail>

    {/* heading */}
    <div className="flex flex-col gap-10 lg:absolute lg:top-118 lg:left-790">
      <Eyebrow className="text-on-paper-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={copy.headline} className="text-display-4" />
    </div>
    <p className="font-human text-lede text-on-paper-2 lg:absolute lg:top-340 lg:left-790 lg:w-560">{copy.body}</p>

    {/* every error, collected */}
    <ul className="flex flex-col gap-10 lg:absolute lg:top-229 lg:left-372 lg:gap-108">
      {copy.gates.map((gate) => (
        <li
          key={gate.rule}
          className="w-fit bg-err px-14 py-10 font-machine text-[0.9375rem] font-medium text-ink lg:reveal-in"
        >
          {gate.message}
        </li>
      ))}
    </ul>

    {/* the code */}
    <CodeBlock lines={code} tone="paper" className="overflow-x-auto text-code-5 leading-[2] lg:absolute lg:top-510 lg:left-790" />
  </Scene>
)
