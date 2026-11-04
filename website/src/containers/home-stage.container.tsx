'use client'

import { useRef, type ReactNode } from 'react'
import { useScrollStage } from '@/hooks/use-scroll-stage'

type HomeStageContainerProps = { readonly children: ReactNode }

/** Connects the page to scroll. Everything inside stays server-rendered. */
export const HomeStageContainer = ({ children }: HomeStageContainerProps) => {
  const stage = useRef<HTMLElement>(null)
  useScrollStage(stage)
  return <main ref={stage}>{children}</main>
}
