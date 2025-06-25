"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RotateCcw, Server } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function ServerStatusChecker() {
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const checkServerStatus = async () => {
    setIsChecking(true)
    setStatus("idle")
    setMessage("")

    try {
      // Try multiple endpoints to check server status
      const endpoints = ["/health", "/api/health", "/status", "/"]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET",
            signal: AbortSignal.timeout(5000),
          })

          if (response.ok) {
            setStatus("success")
            setMessage(`Server is running! Responded from ${endpoint}`)
            return
          }
        } catch (error) {
          console.log(`Failed to reach ${endpoint}:`, error)
        }
      }

      throw new Error("All endpoints failed")
    } catch (error: any) {
      setStatus("error")
      if (error.name === "TimeoutError") {
        setMessage("Server is not responding (timeout)")
      } else if (error.message === "Failed to fetch") {
        setMessage("Cannot connect to server. Is it running on localhost:8080?")
      } else {
        setMessage(`Error: ${error.message}`)
      }
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Server Status Checker
        </CardTitle>
        <CardDescription>Check if your backend server is running and accessible</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>
            <strong>Target URL:</strong> {API_BASE_URL}
          </p>
        </div>

        {status !== "idle" && (
          <Alert variant={status === "success" ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {status === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </div>
          </Alert>
        )}

        <Button onClick={checkServerStatus} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Server className="mr-2 h-4 w-4" />
              Check Server Status
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Troubleshooting:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure your backend server is running</li>
            <li>Check if it's listening on port 8080</li>
            <li>Verify CORS is configured for localhost:3000</li>
            <li>Check firewall/antivirus settings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
