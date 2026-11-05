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
  readonly isCopied: boolean
  readonly copyLabel: string
  readonly copiedLabel: string
  readonly onCopy: () => void
}

/** The install command as one button: press it to copy. */
export const CommandChip = ({ command, tone, isCopied, copyLabel, copiedLabel, onCopy }: CommandChipProps) => (
  <button
    type="button"
    onClick={onCopy}
    aria-label={isCopied ? copiedLabel : copyLabel}
    className={cx(
      'flex w-full cursor-pointer flex-row items-center justify-between gap-12 px-14 py-15 font-machine text-[0.8125rem] font-medium whitespace-nowrap lg:w-auto lg:gap-20 lg:px-24 lg:py-18 lg:text-code-5',
      CHIP_CLASS[tone],
    )}
  >
    {/* the command */}
    <span>{command}</span>

    {/* copy state */}
    {isCopied ? <Check className="size-16 lg:size-18" /> : <Copy className="size-16 lg:size-18" />}
  </button>
)
