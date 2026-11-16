import { Check, Copy } from 'lucide-react'
import { cx } from '@/lib/cx'

type ChipTone = 'err' | 'paper'

const CHIP_CLASS: Record<ChipTone, string> = {
  err: 'bg-err text-ink',
  paper: 'bg-paper text-ink',
}

type CommandChipProps = {
  readonly command: string
  readonly tone: ChipTone
  /** Lets a command too long for a phone break across lines below the stage layout. */
  readonly shouldWrap?: boolean
  readonly isCopied: boolean
  readonly copyLabel: string
  readonly copiedLabel: string
  readonly onCopy: () => void
}

/** A command as one button: press it to copy. */
export const CommandChip = ({
  command,
  tone,
  shouldWrap = false,
  isCopied,
  copyLabel,
  copiedLabel,
  onCopy,
}: CommandChipProps) => (
  <button
    type="button"
    onClick={onCopy}
    aria-label={isCopied ? copiedLabel : copyLabel}
    className={cx(
      'flex w-full cursor-pointer flex-row items-center justify-between gap-12 px-14 py-15 font-machine text-[0.8125rem] font-medium whitespace-nowrap lg:w-auto lg:gap-20 lg:px-24 lg:py-18 lg:text-code-5',
      shouldWrap && 'text-left max-lg:whitespace-normal max-lg:wrap-anywhere',
      CHIP_CLASS[tone],
    )}
  >
    {/* the command */}
    <span>{command}</span>

    {/* copy state */}
    {isCopied ? (
      <Check className="size-16 shrink-0 lg:size-18" />
    ) : (
      <Copy className="size-16 shrink-0 lg:size-18" />
    )}
  </button>
)
