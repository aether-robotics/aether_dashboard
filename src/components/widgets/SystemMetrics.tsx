import { WidgetCard } from '../ui/WidgetCard'
import { MetricBar } from '../ui/MetricBar'
import type { SystemMetrics as SystemMetricsType } from '../../types'

interface Props {
  metrics: SystemMetricsType
}

function getMetricColor(value: number) {
  if (value < 50) return 'green' as const
  if (value < 75) return 'orange' as const
  return 'red' as const
}

export function SystemMetrics({ metrics }: Props) {
  return (
    <WidgetCard className="w-full flex flex-col h-[400px] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 flex-none">
        <span className="text-[11px] font-bold text-slate-900 tracking-widest uppercase">System Metrics</span>
      </div>
      <div className="p-4 space-y-4">
        <MetricBar
          label="CPU Utilization"
          value={metrics.cpuPercent}
          displayValue={`${metrics.cpuPercent}%`}
          color={getMetricColor(metrics.cpuPercent)}
        />
        <MetricBar
          label={`Memory (${metrics.memoryTotalGB}GB)`}
          value={metrics.memoryPercent}
          displayValue={`${metrics.memoryPercent}%`}
          color={getMetricColor(metrics.memoryPercent)}
        />
        <MetricBar
          label="Thermal Load"
          value={metrics.thermalCelsius}
          displayValue={`${metrics.thermalCelsius}°C`}
          color={getMetricColor(metrics.thermalCelsius)}
        />
        <MetricBar
          label="Storage"
          value={metrics.storagePercent}
          displayValue={`${metrics.storagePercent}%`}
          color={getMetricColor(metrics.storagePercent)}
        />
      </div>
    </WidgetCard>
  )
}
