type Variant = 'online' | 'active' | 'warning' | 'inactive' | 'error'

interface Props {
  variant: Variant
  label: string
  pulse?: boolean
}

const STYLES: Record<Variant, string> = {
  online:   'bg-green-50 text-green-600 border-green-200',
  active:   'bg-green-50 text-green-600 border-green-200',
  warning:  'bg-amber-50 text-amber-600 border-amber-200',
  inactive: 'bg-slate-50 text-slate-400 border-slate-200',
  error:    'bg-red-50 text-red-600 border-red-200',
}

const DOT_STYLES: Record<Variant, string> = {
  online:   'bg-green-500',
  active:   'bg-green-500',
  warning:  'bg-amber-500',
  inactive: 'bg-slate-300',
  error:    'bg-red-500',
}

export function StatusBadge({ variant, label, pulse = false }: Props) {
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border flex items-center gap-1.5 ${STYLES[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}
