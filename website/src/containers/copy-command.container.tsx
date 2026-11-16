'use client'

import { useState } from 'react'
import * as R from 'remeda'
import { match, tryCatchAsync } from '@ontologyio/receta/result'
import { CommandChip } from '@/components/primitives/command-chip'

const COPIED_FEEDBACK_MS = 1600

type CommandCopy = {
  readonly command: string
  readonly copyLabel: string
  readonly copiedLabel: string
}

type CopyCommandContainerProps = {
  readonly copy: CommandCopy
  readonly tone: 'err' | 'paper'
  readonly shouldWrap?: boolean
}

/** Connects a command to the clipboard. */
export const CopyCommandContainer = ({ copy, tone, shouldWrap = false }: CopyCommandContainerProps) => {
  const [isCopied, setIsCopied] = useState(false)

  const showCopied = (): void => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS)
  }

  const copyCommand = async (): Promise<void> =>
    R.pipe(
      await tryCatchAsync(() => navigator.clipboard.writeText(copy.command)),
      // A blocked clipboard changes nothing: the command is still on screen to select.
      match({ onOk: showCopied, onErr: R.doNothing() }),
    )

  return (
    <CommandChip
      command={copy.command}
      tone={tone}
      shouldWrap={shouldWrap}
      isCopied={isCopied}
      copyLabel={copy.copyLabel}
      copiedLabel={copy.copiedLabel}
      onCopy={copyCommand}
    />
  )
}
