import { useState } from 'react'

interface Props {
  value: string
}

export function CopyButton({ value }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="group shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-primary/50 leading-none transition-all duration-150 hover:bg-slate-100 hover:text-primary active:scale-95 active:bg-slate-200/80"
      title="Copy"
    >
      <span className="material-symbols-outlined transition-transform duration-150 group-hover:scale-105" style={{ fontSize: '13px' }}>
        {copied ? 'done' : 'content_copy'}
      </span>
    </button>
  )
}
