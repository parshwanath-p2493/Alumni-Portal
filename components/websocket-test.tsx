"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function WebSocketTest() {
  const { token, user, isAuthenticated } = useAuth()
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs((prev) => [...prev, logMessage])
    console.log(logMessage)
  }

  const testBackendConnectivity = async () => {
    setLogs([])
    addLog("🔄 Testing backend connectivity...")

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      addLog(`Testing: ${backendUrl}/health`)

      const response = await fetch(`${backendUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        addLog(`✅ Backend reachable: ${JSON.stringify(data)}`)
        return true
      } else {
        addLog(`❌ Backend returned: ${response.status} ${response.statusText}`)
        return false
      }
    } catch (error) {
      addLog(`❌ Backend connection failed: ${error}`)
      return false
    }
  }

  const testWebSocketConnection = async () => {
    if (!isAuthenticated || !token) {
      setTestResult("❌ Not authenticated")
      return
    }

    setIsLoading(true)
    setTestResult("🔄 Testing WebSocket connection...")
    setLogs([])

    // First test backend connectivity
    const backendReachable = await testBackendConnectivity()
    if (!backendReachable) {
      setTestResult("❌ Backend not reachable")
      setIsLoading(false)
      return
    }

    try {
      // Test WebSocket connection
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"
      const fullWsUrl = `${wsUrl}/ws/chat?token=${token}`

      addLog(`Testing WebSocket: ${fullWsUrl.replace(token, "***")}`)
      addLog(`Token length: ${token.length}`)
      addLog(`User: ${user?.name} (${user?.id})`)

      const ws = new WebSocket(fullWsUrl)

      const timeout = setTimeout(() => {
        addLog("❌ WebSocket connection timeout (10s)")
        ws.close()
        setTestResult("❌ WebSocket connection timeout")
        setIsLoading(false)
      }, 10000)

      ws.onopen = () => {
        clearTimeout(timeout)
        addLog("✅ WebSocket connection opened!")
        setTestResult("✅ WebSocket connection successful!")

        // Send test message
        const testMessage = {
          type: "connect",
          user_id: user?.id,
        }
        addLog(`Sending: ${JSON.stringify(testMessage)}`)
        ws.send(JSON.stringify(testMessage))

        // Close after successful test
        setTimeout(() => {
          addLog("Closing test connection...")
          ws.close()
          setIsLoading(false)
        }, 2000)
      }

      ws.onmessage = (event) => {
        addLog(`📨 Received: ${event.data}`)
      }

      ws.onerror = (error) => {
        clearTimeout(timeout)
        addLog(`❌ WebSocket error: ${JSON.stringify(error)}`)
        addLog(`WebSocket readyState: ${ws.readyState}`)
        addLog(`WebSocket URL: ${ws.url?.replace(token, "***")}`)
        setTestResult("❌ WebSocket connection failed - check logs")
        setIsLoading(false)
      }

      ws.onclose = (event) => {
        clearTimeout(timeout)
        addLog(`🔌 WebSocket closed: code=${event.code}, reason="${event.reason}", wasClean=${event.wasClean}`)
        if (event.code !== 1000 && !testResult.includes("successful")) {
          setTestResult(`❌ WebSocket closed unexpectedly: ${event.code}`)
          setIsLoading(false)
        }
      }
    } catch (error) {
      addLog(`❌ Test failed: ${error}`)
      setTestResult(`❌ Test failed: ${error}`)
      setIsLoading(false)
    }
  }

  const testTokenValidation = async () => {
    if (!token) {
      setTestResult("❌ No token available")
      return
    }

    setIsLoading(true)
    setLogs([])
    addLog("🔄 Testing token validation...")

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${backendUrl}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        addLog(`✅ Token valid: ${JSON.stringify(data.user || data)}`)
        setTestResult("✅ Token validation successful!")
      } else {
        addLog(`❌ Token validation failed: ${response.status}`)
        setTestResult("❌ Token validation failed")
      }
    } catch (error) {
      addLog(`❌ Token test failed: ${error}`)
      setTestResult(`❌ Token test failed: ${error}`)
    }

    setIsLoading(false)
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">WebSocket Connection Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs space-y-1">
          <p>
            <strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}
          </p>
          <p>
            <strong>WebSocket URL:</strong> {process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"}
          </p>
          <p>
            <strong>Auth Status:</strong> {isAuthenticated ? "✅ Authenticated" : "❌ Not authenticated"}
          </p>
          <p>
            <strong>Token:</strong> {token ? `✅ Present (${token.length} chars)` : "❌ Missing"}
          </p>
          <p>
            <strong>User:</strong> {user ? `✅ ${user.name} (${user.role})` : "❌ Missing"}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={testBackendConnectivity} disabled={isLoading} size="sm">
            Test Backend
          </Button>
          <Button onClick={testTokenValidation} disabled={isLoading || !token} size="sm">
            Test Token
          </Button>
          <Button onClick={testWebSocketConnection} disabled={isLoading || !isAuthenticated} size="sm">
            Test WebSocket
          </Button>
        </div>

        {testResult && (
          <Alert>
            <AlertDescription className="text-xs">{testResult}</AlertDescription>
          </Alert>
        )}

        {logs.length > 0 && (
          <div className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-y-auto">
            <strong>Debug Logs:</strong>
            {logs.map((log, index) => (
              <div key={index} className="font-mono">
                {log}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
