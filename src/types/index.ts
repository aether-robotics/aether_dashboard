// ── Device ────────────────────────────────────────────────────────────────────

export interface DeviceIdentity {
  supervisorVersion: string
  nodeType: string
  deviceType: string
  ipAddresses: string[]
  macAddresses: string[]
  uuid: string
  fleet: string
  osVersion: string
  lastSeen: string
  tags: string[]
}

// ── System Metrics ─────────────────────────────────────────────────────────────

export interface SystemMetrics {
  cpuPercent: number
  memoryPercent: number
  memoryTotalGB: number
  thermalCelsius: number
  batteryPercent: number
  storagePercent: number
}

// ── Services / Apps ────────────────────────────────────────────────────────────

export type ServiceStatus = 'active' | 'warning' | 'inactive' | 'error'

export interface Service {
  id: string
  name: string
  version: string
  status: ServiceStatus
  cpuPercent: number
  memoryMB: number
}

export type OperationalStatus = 'executing' | 'idle' | 'error' | 'paused'
export type SafetyStatus = 'normal' | 'warning' | 'critical'
export type HealthStatus = 'nominal' | 'degraded' | 'critical'

export interface AppsState {
  operational: OperationalStatus
  safety: SafetyStatus
  health: HealthStatus
  state: string
  lastTransition: string
  nextExpected: string
  services: Service[]
}

// ── Logs ───────────────────────────────────────────────────────────────────────

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  timestamp?: string
}

// ── Robot / Node ────────────────────────────────────────────────────────────────

export interface RobotNode {
  id: string
  name: string
  release: string
  uptime: string
  heartbeat: boolean
  identity: DeviceIdentity
  metrics: SystemMetrics
  apps: AppsState
  logs: LogEntry[]
}
