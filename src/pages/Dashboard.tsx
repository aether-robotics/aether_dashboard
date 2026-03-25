import { useState } from 'react'
import { SideNav } from '../components/layout/SideNav'
import { BottomNav } from '../components/layout/BottomNav'
import { Header } from '../components/layout/Header'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { DeviceIdentity } from '../components/widgets/DeviceIdentity'
import { SystemMetrics } from '../components/widgets/SystemMetrics'
import { Viewport3D } from '../components/widgets/Viewport3D'
import { Apps } from '../components/widgets/Apps'
import { RealtimeLogs } from '../components/widgets/RealtimeLogs'
import { useRobotNode } from '../hooks/useRobotNode'
import type { NavPage } from '../components/layout/navItems'

export function Dashboard() {
  const { node } = useRobotNode()
  const [activePage, setActivePage] = useState<NavPage>('dashboard')

  return (
    <>
      <SideNav activePage={activePage} onNavigate={setActivePage} />
      <BottomNav activePage={activePage} onNavigate={setActivePage} />
      <DashboardLayout
        header={
          <Header
            nodeName={node.name}
            release={node.release}
            uptime={node.uptime}
            heartbeat={node.heartbeat}
            online={true}
            onShutdown={() => { /* TODO: POST /api/device/shutdown */ }}
            onRestart={() => { /* TODO: POST /api/device/restart */ }}
          />
        }
        leftPanel={
          <>
            <DeviceIdentity identity={node.identity} />
            <SystemMetrics metrics={node.metrics} />
          </>
        }
        centerPanel={
          <>
            <Viewport3D />
            <Apps apps={node.apps} />
          </>
        }
        rightPanel={
          <RealtimeLogs logs={node.logs} />
        }
      />
    </>
  )
}
