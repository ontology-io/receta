import { Rail, Station } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow } from '@/components/primitives/text'
import type { queueContent } from '@/content/home.content'
import { cx } from '@/lib/cx'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'
import type { QueueRect, QueueRectTone } from '@/lib/queue'

const RECT_CLASS: Record<QueueRectTone, string> = {
  far: 'fill-ink-2',
  mid: 'fill-ink-3',
  near: 'fill-ink-4',
  'bar-mid': 'fill-ink-5',
  'bar-near': 'fill-on-ink-3',
  'bar-hot': 'fill-err',
}

type TilePlaneProps = { readonly rects: readonly QueueRect[]; readonly className: string }

/** One depth of change requests in the funnel. */
const TilePlane = ({ rects, className }: TilePlaneProps) => (
  <svg
    aria-hidden
    viewBox="0 0 1440 620"
    preserveAspectRatio="xMidYMin slice"
    className={cx('absolute top-0 left-0 size-full lg:overflow-visible', className)}
  >
    {rects.map((rect, index) => (
      <rect key={index} x={rect.x} y={rect.y} width={rect.width} height={rect.height} className={RECT_CLASS[rect.tone]} />
    ))}
  </svg>
)

type SideNoteProps = {
  readonly copy: typeof queueContent.write | typeof queueContent.wait
  readonly className: string
}

/** A caption beside the funnel. */
const SideNote = ({ copy, className }: SideNoteProps) => (
  <div className={cx('hidden lg:absolute lg:top-338 lg:flex lg:flex-col lg:gap-6', className)}>
    <Eyebrow className="text-on-ink-3">{copy.label}</Eyebrow>
    <p className="font-human text-[2.375rem] leading-[1.1] text-on-ink">{copy.title}</p>
    <p className="font-human text-[1.3125rem] text-on-ink-2 italic">{copy.note}</p>
  </div>
)

type QueueSceneProps = {
  readonly copy: typeof queueContent
  readonly planes: {
    readonly far: readonly QueueRect[]
    readonly mid: readonly QueueRect[]
    readonly near: readonly QueueRect[]
  }
}

/** Why now: everything agents write pours through one narrow neck, a person verifying. */
export const QueueScene = ({ copy, planes }: QueueSceneProps) => (
  <Scene id="why" block="queue" tone="ink" height={SCENE_HEIGHT.queue} mobileTokenClassName="bg-err">
    {/* the funnel of waiting changes */}
    <div className="relative h-240 w-full overflow-clip lg:absolute lg:inset-x-0 lg:top-0 lg:h-620 lg:overflow-visible">
      <TilePlane rects={planes.far} className="lg:parallax-35" />
      <TilePlane rects={planes.mid} className="lg:parallax-65" />
      <TilePlane rects={planes.near} className="lg:parallax-125" />
    </div>

    {/* rail through the neck */}
    <Rail path={RAIL.queue} height={SCENE_HEIGHT.queue} base="ink" paint="err" token={{ x: 710, y: 446, size: 24 }}>
      <path d="M 158 0 L 688 556 V 600" className="fill-none stroke-on-ink-3 stroke-2" />
      <path d="M 1282 0 L 732 556 V 600" className="fill-none stroke-on-ink-3 stroke-2" />
      <Station x={710} y={600} size={22} className="fill-ink stroke-on-ink" />
      <text x={740} y={606} className="fill-on-ink font-machine text-[15px]">
        {copy.station}
      </text>
    </Rail>

    {/* captions either side of the funnel */}
    <SideNote copy={copy.write} className="lg:left-64" />
    <SideNote copy={copy.wait} className="lg:left-1118" />

    {/* the argument, split by the rail */}
    <div className="flex flex-col gap-20 lg:absolute lg:top-672 lg:left-64 lg:flex-row lg:gap-110">
      <h2 className="font-human text-display-6 text-on-ink lg:w-600">{copy.headline}</h2>
      <p className="font-human text-lede text-on-ink-2 lg:mt-12 lg:w-560">{copy.body}</p>
    </div>
  </Scene>
)
