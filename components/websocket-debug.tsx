"use client"

import { useWebSocket } from "@/contexts/websocket-context"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function WebSocketDebug() {
  const { isConnected, connectionStatus, sendMessage } = useWebSocket()
  const { user, isAuthenticated, token } = useAuth()

  const testMessage = () => {
    sendMessage({
      type: "test",
      message: "Test message from debug panel",
      timestamp: new Date().toISOString(),
    })
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">WebSocket Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>WebSocket State:</strong>
          <ul className="ml-4 list-disc">
            <li>Connected: {isConnected ? "Yes" : "No"}</li>
            <li>
              Status:{" "}
              <span
                className={
                  connectionStatus === "error"
                    ? "text-red-600"
                    : connectionStatus === "connected"
                      ? "text-green-600"
                      : "text-yellow-600"
                }
              >
                {connectionStatus}
              </span>
            </li>
            <li>Auth Ready: {isAuthenticated && token && user ? "Yes" : "No"}</li>
          </ul>
        </div>

        <div>
          <strong>Expected WebSocket URL:</strong>
          <p className="ml-4 text-xs break-all">
            {process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"}/ws/chat?token=***
          </p>
        </div>

        {connectionStatus === "error" && (
          <div className="bg-red-50 p-2 rounded text-red-800">
            <strong>Connection Failed:</strong>
            <p className="text-xs mt-1">
              WebSocket server is not running on your backend. This is normal if you haven't implemented WebSocket
              functionality yet.
            </p>
          </div>
        )}

        {isConnected && (
          <Button size="sm" variant="outline" onClick={testMessage}>
            Send Test Message
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
