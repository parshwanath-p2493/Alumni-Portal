"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, Wifi, HardDrive, Cpu, MemoryStick, Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface SystemStatus {
  service: string
  status: "healthy" | "warning" | "error"
  uptime: string
  lastCheck: string
  details?: string
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
}

export function SystemMonitor() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
    {
      service: "API Server",
      status: "healthy",
      uptime: "99.9%",
      lastCheck: "2 minutes ago",
      details: "All endpoints responding normally",
    },
    {
      service: "Database",
      status: "healthy",
      uptime: "99.8%",
      lastCheck: "1 minute ago",
      details: "MongoDB cluster healthy",
    },
    {
      service: "Email Service",
      status: "warning",
      uptime: "98.5%",
      lastCheck: "5 minutes ago",
      details: "Slight delay in email delivery",
    },
    {
      service: "WebSocket",
      status: "healthy",
      uptime: "99.7%",
      lastCheck: "30 seconds ago",
      details: "Real-time messaging active",
    },
    {
      service: "File Storage",
      status: "healthy",
      uptime: "99.9%",
      lastCheck: "1 minute ago",
      details: "Upload/download services normal",
    },
  ])

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 23,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-green-500"
    if (value < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* System Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            System Services
          </CardTitle>
          <CardDescription>Real-time status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium">{service.service}</div>
                    <div className="text-sm text-gray-500">{service.details}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                  <div className="text-xs text-gray-500 mt-1">Uptime: {service.uptime}</div>
                  <div className="text-xs text-gray-400">{service.lastCheck}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className="text-sm font-bold">{metrics.cpu}%</span>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MemoryStick className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className="text-sm font-bold">{metrics.memory}%</span>
            </div>
            <Progress value={metrics.memory} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Disk Usage</span>
              </div>
              <span className="text-sm font-bold">{metrics.disk}%</span>
            </div>
            <Progress value={metrics.disk} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <span className="text-sm font-bold">{metrics.network}%</span>
            </div>
            <Progress value={metrics.network} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
