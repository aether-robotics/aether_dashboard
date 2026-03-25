import { useState } from 'react'
import type { RobotNode } from '../types'

const MOCK_NODE: RobotNode = {
  id: 'node-b-01',
  name: 'ROBOTIC_CORE_01',
  release: 'v2.4.1-stable',
  uptime: '142h 22m',
  heartbeat: true,
  identity: {
    supervisorVersion: 'v12.11.0',
    nodeType: 'EDGE_GATEWAY_X1',
    deviceType: 'NVIDIA_ORIN',
    ipAddresses: ['192.168.1.144', '10.0.0.22'],
    macAddresses: ['00:1A:2B:3C:4D:5E', 'A4:C3:F0:12:34:56'],
    uuid: '8f2a1c4e-9d3b-4a7f-b821-6c0e5d1af92b',
    fleet: 'FLEET_ALPHA_01',
    osVersion: 'Ubuntu 22.04.3 LTS',
    lastSeen: 'Just now',
    tags: ['ROBOT_X4'],
  },
  metrics: {
    cpuPercent: 42,
    memoryPercent: 65,
    memoryTotalGB: 12.4,
    thermalCelsius: 54,
    batteryPercent: 85,
    storagePercent: 42,
  },
  apps: {
    operational: 'executing',
    safety: 'normal',
    health: 'degraded',
    state: 'WAIT_FOR_MAP',
    lastTransition: 'Ready → Executing at 08:42:11',
    nextExpected: 'Executing → Ready',
    services: [
      { id: 'slam-nav', name: 'SLAM_NAV', version: 'v2.4.1', status: 'active', cpuPercent: 14.2, memoryMB: 1228 },
      { id: 'lidar-sense', name: 'LIDAR_SENSE', version: 'latest', status: 'warning', cpuPercent: 4.8, memoryMB: 244 },
      { id: 'control-core', name: 'CONTROL_CORE', version: 'stable', status: 'inactive', cpuPercent: 0, memoryMB: 0 },
    ],
  },
  logs: [
    { id: '1', level: 'info', message: 'Handshake success with controller.' },
    { id: '2', level: 'warn', message: 'Frame dropped at sensor ingress.' },
    { id: '3', level: 'info', message: 'Global map updated (0.98c).' },
    { id: '4', level: 'info', message: 'Activating hydraulic loop B-02.', timestamp: '08:42:12' },
    { id: '5', level: 'info', message: 'Syncing with remote cluster.' },
    { id: '6', level: 'info', message: 'Health check: All subsystems nominal.' },
    { id: '7', level: 'info', message: 'Heartbeat signal acknowledged by Master.' },
    { id: '8', level: 'info', message: 'Encoder recalibration complete.', timestamp: '08:42:15' },
  ],
}

export function useRobotNode() {
  const [node] = useState<RobotNode>(MOCK_NODE)
  return { node }
}
