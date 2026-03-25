import { WidgetCard } from '../ui/WidgetCard'
import { MetricBar } from '../ui/MetricBar'
import type { SystemMetrics as SystemMetricsType } from '../../types'

interface Props {
  metrics: SystemMetricsType
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
          color="primary"
        />
        <MetricBar
          label={`Memory (${metrics.memoryTotalGB}GB)`}
          value={metrics.memoryPercent}
          displayValue={`${metrics.memoryPercent}%`}
          color="green"
        />
        <MetricBar
          label="Thermal Load"
          value={metrics.thermalCelsius}
          displayValue={`${metrics.thermalCelsius}°C`}
          color="amber"
        />
        <MetricBar
          label="Battery Level"
          value={metrics.batteryPercent}
          displayValue={`${metrics.batteryPercent}%`}
          color="primary"
        />
        <MetricBar
          label="Storage"
          value={metrics.storagePercent}
          displayValue={`${metrics.storagePercent}%`}
          color="amber"
        />
      </div>
    </WidgetCard>
  )
}
