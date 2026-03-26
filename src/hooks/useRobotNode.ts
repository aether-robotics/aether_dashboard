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
    deviceType: 'Nvidia Jetson Orin',
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
      {
        id: 'slam-nav', name: 'SLAM_NAV', version: 'v2.4.1',
        image: 'ghcr.io/aether/slam_nav:v2.4.1',
        command: 'ros2 launch slam_nav bringup.launch.py',
        restartPolicy: 'always',
        status: 'active', cpuPercent: 14.2, memoryMB: 1228,
        envVars: [
          { key: 'MAP_RESOLUTION', value: '0.05' },
          { key: 'SCAN_TOPIC', value: '/scan' },
          { key: 'LOG_LEVEL', value: 'INFO' },
        ],
        nodes: [
          {
            name: '/slam_nav_node',
            params: [
              { key: 'map_resolution', value: '0.05' },
              { key: 'scan_topic', value: '/scan' },
              { key: 'max_iterations', value: '100' },
              { key: 'loop_closure_enabled', value: 'true' },
            ],
          },
          {
            name: '/map_server_node',
            params: [
              { key: 'map_file', value: '/maps/floor1.yaml' },
              { key: 'frame_id', value: 'map' },
            ],
          },
        ],
        commGraph: {
          middleware: 'ROS 2 Humble',
          nodes: [{
            name: '/slam_nav_node',
            publishers: [
              { name: '/map',             messageType: 'nav_msgs/OccupancyGrid',     rateHz: 1  },
              { name: '/slam_nav/pose',   messageType: 'geometry_msgs/PoseStamped',  rateHz: 10 },
              { name: '/slam_nav/status', messageType: 'std_msgs/String',            rateHz: 5  },
            ],
            subscribers: [
              { name: '/scan', messageType: 'sensor_msgs/LaserScan', rateHz: 20 },
              { name: '/odom', messageType: 'nav_msgs/Odometry',     rateHz: 50 },
            ],
            services: ['/slam_nav/save_map', '/slam_nav/reset', '/slam_nav/get_status'],
            actions:  ['/slam_nav/navigate_to_pose'],
          }],
        },
      },
      {
        id: 'lidar-sense', name: 'LIDAR_SENSE', version: 'latest',
        image: 'ghcr.io/aether/lidar_sense:latest',
        command: 'ros2 run lidar_sense lidar_node --ros-args -p port:=/dev/ttyUSB0',
        restartPolicy: 'on-failure',
        status: 'warning', cpuPercent: 4.8, memoryMB: 244,
        envVars: [
          { key: 'FRAME_ID', value: 'laser' },
          { key: 'PORT', value: '/dev/ttyUSB0' },
        ],
        nodes: [
          {
            name: '/lidar_node',
            params: [
              { key: 'baud_rate', value: '115200' },
              { key: 'scan_frequency', value: '20' },
              { key: 'angle_min', value: '-3.14159' },
              { key: 'angle_max', value: '3.14159' },
            ],
          },
        ],
        commGraph: {
          middleware: 'ROS 2 Humble',
          nodes: [{
            name: '/lidar_node',
            publishers: [
              { name: '/scan',              messageType: 'sensor_msgs/LaserScan',           rateHz: 20 },
              { name: '/lidar/point_cloud', messageType: 'sensor_msgs/PointCloud2',         rateHz: 10 },
              { name: '/lidar/diagnostics', messageType: 'diagnostic_msgs/DiagnosticArray', rateHz: 1  },
            ],
            subscribers: [],
            services: ['/lidar/start_scan', '/lidar/stop_scan'],
            actions:  [],
          }],
        },
      },
      {
        id: 'control-core', name: 'CONTROL_CORE', version: 'stable',
        image: 'ghcr.io/aether/control_core:stable',
        command: 'ros2 launch control_core control.launch.py',
        restartPolicy: 'unless-stopped',
        status: 'inactive', cpuPercent: 0, memoryMB: 0,
        envVars: [
          { key: 'CONTROL_FREQ', value: '100' },
          { key: 'SAFETY_TIMEOUT', value: '500' },
        ],
      },
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
