"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

interface WebSocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: any) => void
  connectionStatus: "disconnected" | "connecting" | "connected" | "error"
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, token, isLoading } = useAuth()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    "disconnected",
  )
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const connectionAttemptRef = useRef(false)

  const connect = () => {
    // Don't connect if already connecting or if auth is still loading
    if (connectionAttemptRef.current || isLoading || !isAuthenticated || !token || !user) {
      console.log("WebSocket: Skipping connection attempt", {
        alreadyConnecting: connectionAttemptRef.current,
        isLoading,
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user,
      })
      return
    }

    connectionAttemptRef.current = true
    setConnectionStatus("connecting")

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"
      const fullWsUrl = `${wsUrl}/ws/chat?token=${token}`

      console.log("WebSocket: Connection details:", {
        wsUrl,
        fullUrl: fullWsUrl.replace(token, "***"),
        tokenLength: token.length,
        userInfo: { id: user.id, email: user.email, role: user.role },
      })

      const ws = new WebSocket(fullWsUrl)

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        console.log("WebSocket: Connection timeout")
        ws.close()
        setConnectionStatus("error")
        connectionAttemptRef.current = false
      }, 5000)

      ws.onopen = () => {
        console.log("WebSocket: Connected successfully")
        clearTimeout(connectionTimeout)
        setIsConnected(true)
        setConnectionStatus("connected")
        reconnectAttemptsRef.current = 0
        connectionAttemptRef.current = false

        // Send initial connection message
        ws.send(
          JSON.stringify({
            type: "connect",
            user_id: user.id,
          }),
        )
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Handle different message types
          switch (data.type) {
            case "new_message":
              toast({
                title: "New Message",
                description: `${data.sender_name}: ${data.content}`,
              })
              break
            case "notification":
              toast({
                title: data.title || "Notification",
                description: data.message,
              })
              break
            case "system":
              console.log("WebSocket: System message:", data.message)
              break
            default:
              console.log("WebSocket: Unknown message type:", data)
          }
        } catch (error) {
          console.error("WebSocket: Error parsing message:", error)
        }
      }

      ws.onclose = (event) => {
        console.log("WebSocket: Disconnected", { code: event.code, reason: event.reason })
        clearTimeout(connectionTimeout)
        setIsConnected(false)
        setConnectionStatus("disconnected")
        connectionAttemptRef.current = false

        // Only attempt to reconnect if it wasn't a manual close and user is still authenticated
        if (event.code !== 1000 && isAuthenticated && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000 // Exponential backoff
          console.log(
            `WebSocket: Scheduling reconnect attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts} in ${timeout}ms`,
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, timeout)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log("WebSocket: Max reconnection attempts reached")
          setConnectionStatus("error")
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket: Detailed connection error", {
          error,
          readyState: ws.readyState,
          url: ws.url?.replace(token, "***"),
          timestamp: new Date().toISOString(),
        })
        clearTimeout(connectionTimeout)
        setConnectionStatus("error")
        connectionAttemptRef.current = false

        // In development, don't show error toasts for WebSocket failures
        if (process.env.NODE_ENV === "production") {
          toast({
            title: "Connection Error",
            description: "Unable to connect to real-time services",
            variant: "destructive",
          })
        } else {
          console.log("WebSocket: Skipping error toast in development mode")
        }
      }

      setSocket(ws)
    } catch (error) {
      console.error("WebSocket: Failed to create connection:", error)
      setConnectionStatus("error")
      connectionAttemptRef.current = false
    }
  }

  const disconnect = () => {
    console.log("WebSocket: Disconnecting...")

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socket) {
      socket.close(1000, "Manual disconnect")
      setSocket(null)
    }

    setIsConnected(false)
    setConnectionStatus("disconnected")
    reconnectAttemptsRef.current = 0
    connectionAttemptRef.current = false
  }

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket: Not connected, message not sent:", message)
    }
  }

  // Connect when user is authenticated and auth loading is complete
  useEffect(() => {
    console.log("WebSocket: Auth state changed", {
      isLoading,
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      connectionStatus,
    })

    if (!isLoading && isAuthenticated && token && user) {
      // Reduced delay for faster connection
      const connectTimeout = setTimeout(() => {
        // Only connect if we're not already in an error state from previous attempts
        if (connectionStatus !== "error" || reconnectAttemptsRef.current === 0) {
          connect()
        }
      }, 1000) // Changed from 2000 to 1000

      return () => clearTimeout(connectTimeout)
    } else {
      disconnect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [isLoading, isAuthenticated, token, user])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        connectionStatus,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
