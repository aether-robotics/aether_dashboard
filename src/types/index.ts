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

export interface EnvVar {
  key: string
  value: string
}

export interface TopicEntry {
  name: string
  messageType: string
  rateHz?: number
}

export interface CommNode {
  name: string
  publishers: TopicEntry[]
  subscribers: TopicEntry[]
  services?: string[]
  actions?: string[]
}

export interface CommGraph {
  middleware?: string   // e.g. "ROS 2 Humble", "MQTT", "DDS/Cyclone"
  nodes: CommNode[]
}

export interface NodeParam {
  key: string
  value: string
}

export interface ServiceNode {
  name: string
  params: NodeParam[]
}

export interface Service {
  id: string
  name: string
  version: string
  image: string
  command?: string
  restartPolicy: 'always' | 'on-failure' | 'unless-stopped' | 'no'
  status: ServiceStatus
  cpuPercent: number
  memoryMB: number
  envVars: EnvVar[]
  nodes?: ServiceNode[]
  commGraph?: CommGraph
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

// ── FK / Kinematics ────────────────────────────────────────────────────────────

export type ModelFormat = 'sdf' | 'urdf'

export interface JointState {
  /** joint name → angle in radians (or metres for prismatic) */
  angles: Map<string, number>
  stamp?: number
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
