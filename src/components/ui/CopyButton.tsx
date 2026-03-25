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
      className="shrink-0 text-primary/50 hover:text-primary transition-colors leading-none"
      title="Copy"
    >
      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
        {copied ? 'done' : 'content_copy'}
      </span>
    </button>
  )
}
