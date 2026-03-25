import { WidgetCard } from '../ui/WidgetCard'
import { CopyButton } from '../ui/CopyButton'
import type { DeviceIdentity as DeviceIdentityType } from '../../types'

interface Props {
  identity: DeviceIdentityType
}

export function DeviceIdentity({ identity }: Props) {
  return (
    <WidgetCard className="w-full flex flex-col h-[400px] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 flex-none">
        <span className="text-[11px] font-bold text-slate-900 tracking-widest uppercase">Device Identity</span>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <div>
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Supervisor</div>
            <div className="text-xs font-mono text-slate-900">{identity.supervisorVersion}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Node Type</div>
            <div className="text-xs font-medium text-slate-900 truncate">{identity.nodeType}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Device Type</div>
            <div className="text-xs font-medium text-slate-900">{identity.deviceType}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Fleet</div>
            <div className="text-xs font-medium text-slate-900 truncate">{identity.fleet}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">OS Version</div>
            <div className="text-xs font-mono text-slate-900 truncate">{identity.osVersion}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Last Seen</div>
            <div className="text-xs text-slate-900">{identity.lastSeen}</div>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">UUID</div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded">
            <span className="text-xs font-mono text-slate-900 flex-1 truncate">
              {identity.uuid.slice(0, 8)}...{identity.uuid.slice(-4)}
            </span>
            <CopyButton value={identity.uuid} />
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-x-3 mb-1.5">
            <div className="text-[9px] text-slate-500 uppercase font-bold">IP Address</div>
            <div className="text-[9px] text-slate-500 uppercase font-bold">MAC Address</div>
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: Math.max(identity.ipAddresses.length, identity.macAddresses.length) }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-x-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-xs font-mono text-slate-900 flex-1 truncate">{identity.ipAddresses[i] ?? '—'}</span>
                  {identity.ipAddresses[i] && <CopyButton value={identity.ipAddresses[i]} />}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-xs font-mono text-slate-900 flex-1 truncate">{identity.macAddresses[i] ?? '—'}</span>
                  {identity.macAddresses[i] && <CopyButton value={identity.macAddresses[i]} />}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1.5">Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {identity.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-white rounded text-[9px] text-slate-600 font-bold border border-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
