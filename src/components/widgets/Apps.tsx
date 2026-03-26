import { useState } from 'react'
import { WidgetCard } from '../ui/WidgetCard'
import { ServiceSettingsModal } from '../ui/ServiceSettingsModal'
import type { AppsState, Service, ServiceStatus } from '../../types'

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ServiceStatus, { text: string; dot: string; label: string }> = {
  active:   { text: 'text-green-600', dot: 'bg-green-500', label: 'ACTIVE' },
  warning:  { text: 'text-amber-600', dot: 'bg-amber-500', label: 'WARNING' },
  inactive: { text: 'text-slate-400', dot: 'bg-slate-300', label: 'INACTIVE' },
  error:    { text: 'text-red-600',   dot: 'bg-red-500',   label: 'ERROR' },
}

// ── Action button ──────────────────────────────────────────────────────────────

function ActionBtn({
  icon, title, onClick, color = 'text-slate-400',
}: { icon: string; title: string; onClick: () => void; color?: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`group inline-flex h-7 w-7 items-center justify-center rounded-md ${color} transition-all duration-150 hover:-translate-y-px hover:bg-slate-100 hover:text-primary active:translate-y-0 active:scale-95 active:bg-slate-200/80`}
    >
      <span className="material-symbols-outlined transition-transform duration-150 group-hover:scale-105" style={{ fontSize: '15px' }}>{icon}</span>
    </button>
  )
}

// ── Service row ────────────────────────────────────────────────────────────────

function ServiceRow({
  service,
  onOpenSettings,
}: {
  service: Service
  onOpenSettings: (s: Service) => void
}) {
  const isInitiallyRunning = service.status === 'active' || service.status === 'warning'
  const [running, setRunning] = useState(isInitiallyRunning)
  const s = STATUS_STYLES[service.status]

  const memDisplay = service.memoryMB >= 1024
    ? `${(service.memoryMB / 1024).toFixed(1)}GB`
    : `${service.memoryMB}MB`

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-4 py-2.5 border-b border-slate-100">
        <div className="text-[11px] font-bold text-slate-900">{service.name}</div>
        <div className="text-[9px] text-slate-500 font-mono">{service.version}</div>
      </td>
      <td className="px-4 py-2.5 border-b border-slate-100">
        <span className={`flex items-center gap-1.5 text-[10px] font-bold ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </td>
      <td className="px-4 py-2.5 border-b border-slate-100 text-slate-600 font-medium text-[11px]">
        {service.cpuPercent}% / {memDisplay}
      </td>
      <td className="px-4 py-2 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <ActionBtn icon="terminal"    title="Logs"    onClick={() => { /* TODO: open logs */ }} />
          <ActionBtn icon="restart_alt" title="Restart" onClick={() => { /* TODO: restart */ }} />
          {running ? (
            <ActionBtn
              icon="stop" title="Stop" color="text-red-400"
              onClick={() => { setRunning(false) /* TODO: stop service */ }}
            />
          ) : (
            <ActionBtn
              icon="play_arrow" title="Start" color="text-green-500"
              onClick={() => { setRunning(true) /* TODO: start service */ }}
            />
          )}
          <ActionBtn icon="settings" title="Settings" onClick={() => onOpenSettings(service)} />
        </div>
      </td>
    </tr>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  apps: AppsState
}

export function Apps({ apps }: Props) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  return (
    <>
      <WidgetCard className="w-full flex flex-col h-[400px] overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 flex-none">
          <span className="text-[11px] font-bold text-slate-900 tracking-widest uppercase">Apps</span>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-4 bg-slate-50/50 border-b border-slate-200 flex-none">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Operational</div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-900 capitalize">{apps.operational}</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Safety</div>
              <div className={`text-xs font-bold uppercase ${apps.safety === 'normal' ? 'text-green-600' : apps.safety === 'warning' ? 'text-amber-500' : 'text-red-600'}`}>
                {apps.safety}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Health</div>
              <div className={`text-xs font-bold uppercase ${apps.health === 'nominal' ? 'text-green-600' : apps.health === 'degraded' ? 'text-amber-500' : 'text-red-600'}`}>
                {apps.health}
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/50">
            <div className="flex gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase w-24 shrink-0">State</span>
              <span className="text-xs font-bold text-slate-900 uppercase">{apps.state}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase w-24 shrink-0">Last Transition</span>
              <span className="text-[11px] font-mono text-slate-600">{apps.lastTransition}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase w-24 shrink-0">Next Expected</span>
              <span className="text-[11px] font-mono text-slate-600">{apps.nextExpected}</span>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-slate-50/80 sticky top-0 z-10">
              <tr>
                {['Service', 'Status', 'CPU/MEM', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {apps.services.map((service) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  onOpenSettings={setSelectedService}
                />
              ))}
            </tbody>
          </table>
        </div>
      </WidgetCard>

      <ServiceSettingsModal
        key={selectedService?.id ?? ''}
        service={selectedService}
        onSave={(updated) => { /* TODO: POST /api/services/:id */ console.log('save', updated) }}
        onClose={() => setSelectedService(null)}
      />
    </>
  )
}
