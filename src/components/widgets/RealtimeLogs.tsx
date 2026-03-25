import { WidgetCard } from '../ui/WidgetCard'
import type { LogEntry, LogLevel } from '../../types'

const LEVEL_STYLES: Record<LogLevel, string> = {
  info:  'text-blue-400',
  warn:  'text-amber-400',
  error: 'text-red-400',
  debug: 'text-slate-500',
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  info:  '[INFO]',
  warn:  '[WARN]',
  error: '[ERROR]',
  debug: '[DEBUG]',
}

interface Props {
  logs: LogEntry[]
}

export function RealtimeLogs({ logs }: Props) {
  return (
    <WidgetCard className="flex flex-col flex-1 overflow-hidden min-h-[200px] md:min-h-[400px]">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between flex-none">
        <h3 className="text-[10px] font-bold text-slate-900 tracking-widest uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-xs">terminal</span>
          REAL_TIME_LOGS
        </h3>
        <span className="text-[9px] text-slate-500 font-bold uppercase">LIVE</span>
      </div>

      {/* Log output */}
      <div className="p-4 font-mono text-[11px] leading-relaxed space-y-2 overflow-y-auto flex-1 bg-[#0f172a]">
        {logs.map((entry) => (
          <div key={entry.id} className="flex gap-3">
            {entry.timestamp ? (
              <span className="text-slate-500 font-medium shrink-0">{entry.timestamp}</span>
            ) : (
              <span className={`font-bold shrink-0 ${LEVEL_STYLES[entry.level]}`}>
                {LEVEL_LABELS[entry.level]}
              </span>
            )}
            <span className="text-slate-300">{entry.message}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
