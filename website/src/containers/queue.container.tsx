import { QueueScene } from '@/components/scenes/queue-scene'
import { queueContent } from '@/content/home.content'
import { QUEUE_PLANES } from '@/lib/queue'

/** The funnel of agent output, with its tiles laid out at build time. */
export const QueueContainer = () => <QueueScene copy={queueContent} planes={QUEUE_PLANES} />
