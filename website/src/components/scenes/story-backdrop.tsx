/** Ink, with paper rising through it as the story takes over. Only exists while scrubbing. */
export const StoryBackdrop = () => (
  <div aria-hidden className="absolute inset-0 hidden bg-ink scrub:block">
    <div className="absolute inset-0 origin-bottom bg-paper rise" />
  </div>
)
