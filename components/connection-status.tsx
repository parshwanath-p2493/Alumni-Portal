"use client"

import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, RotateCcw } from "lucide-react"

export function ConnectionStatus() {
  const { connectionStatus, checkConnection } = useAuth()

  if (connectionStatus === "connected") {
    return null // Don't show anything when connected
  }

  return (
    <Alert variant={connectionStatus === "disconnected" ? "destructive" : "default"} className="mb-4">
      <div className="flex items-center gap-2">
        {connectionStatus === "checking" ? (
          <RotateCcw className="h-4 w-4 animate-spin" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription className="flex-1">
          {connectionStatus === "checking"
            ? "Checking server connection..."
            : "Cannot connect to server. Please check if your backend is running on localhost:8080"}
        </AlertDescription>
        {connectionStatus === "disconnected" && (
          <Button variant="outline" size="sm" onClick={checkConnection} className="ml-2">
            <RotateCcw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </Alert>
  )
}
