type DocsWordmarkProps = { readonly text: string }

/** The name with its full stop, drawn at the docs' scale. */
export const DocsWordmark = ({ text }: DocsWordmarkProps) => (
  <span className="flex flex-row items-end gap-0.5 font-sans text-[1.375rem] leading-none tracking-tight">
    {text}
    <span aria-hidden className="mb-1 size-1.5 rounded-full bg-(--stop)" />
  </span>
)
