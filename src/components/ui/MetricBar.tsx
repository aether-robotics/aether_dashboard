type BarColor = 'primary' | 'green' | 'amber' | 'red'

interface Props {
  label: string
  value: number
  displayValue: string
  color?: BarColor
}

const COLOR_MAP: Record<BarColor, string> = {
  primary: 'bg-primary',
  green:   'bg-green-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
}

export function MetricBar({ label, value, displayValue, color = 'primary' }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[10px] font-bold">
        <span className="text-slate-500 uppercase">{label}</span>
        <span className="text-slate-900">{displayValue}</span>
      </div>
      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${COLOR_MAP[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}
