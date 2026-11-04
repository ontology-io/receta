'use client'

import { useState } from 'react'
import * as R from 'remeda'
import { match, tryCatchAsync } from '@ontologyio/receta/result'
import { CommandChip } from '@/components/primitives/command-chip'
import { installContent } from '@/content/home.content'

const COPIED_FEEDBACK_MS = 1600

type CopyCommandContainerProps = { readonly tone: 'err' | 'paper' }

/** Connects the install command to the clipboard. */
export const CopyCommandContainer = ({ tone }: CopyCommandContainerProps) => {
  const [isCopied, setIsCopied] = useState(false)

  const showCopied = (): void => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS)
  }

  const copyCommand = async (): Promise<void> =>
    R.pipe(
      await tryCatchAsync(() => navigator.clipboard.writeText(installContent.command)),
      // A blocked clipboard changes nothing: the command is still on screen to select.
      match({ onOk: showCopied, onErr: R.doNothing() }),
    )

  return (
    <CommandChip
      command={installContent.command}
      tone={tone}
      isCopied={isCopied}
      copyLabel={installContent.copyLabel}
      copiedLabel={installContent.copiedLabel}
      onCopy={copyCommand}
    />
  )
}
