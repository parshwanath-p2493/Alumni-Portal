// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { useAuth } from "./useAuth"

// interface WSMessage {
//   type: string
//   from: string
//   to: string
//   content: string
//   subject?: string
//   timestamp: Date
//   message_id?: string
//   data?: any
// }

// interface UseWebSocketReturn {
//   isConnected: boolean
//   sendMessage: (message: Omit<WSMessage, "from" | "timestamp">) => void
//   lastMessage: WSMessage | null
//   connectionError: string | null
// }

// export function useWebSocket(): UseWebSocketReturn {
//   const { user, token } = useAuth()
//   const ws = useRef<WebSocket | null>(null)
//   const [isConnected, setIsConnected] = useState(false)
//   const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
//   const [connectionError, setConnectionError] = useState<string | null>(null)

//   const connect = useCallback(() => {
//     if (!user || !token) return

//     try {
//       const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"}/ws?userId=${user.id}`
//       ws.current = new WebSocket(wsUrl)

//       ws.current.onopen = () => {
//         console.log("WebSocket connected")
//         setIsConnected(true)
//         setConnectionError(null)
//       }

//       ws.current.onmessage = (event) => {
//         try {
//           const message: WSMessage = JSON.parse(event.data)
//           message.timestamp = new Date(message.timestamp)
//           setLastMessage(message)
//         } catch (error) {
//           console.error("Failed to parse WebSocket message:", error)
//         }
//       }

//       ws.current.onclose = () => {
//         console.log("WebSocket disconnected")
//         setIsConnected(false)
//         // Attempt to reconnect after 3 seconds
//         setTimeout(connect, 3000)
//       }

//       ws.current.onerror = (error) => {
//         console.error("WebSocket error:", error)
//         setConnectionError("Connection failed")
//         setIsConnected(false)
//       }
//     } catch (error) {
//       console.error("Failed to create WebSocket connection:", error)
//       setConnectionError("Failed to connect")
//     }
//   }, [user, token])

//   const sendMessage = useCallback(
//     (message: Omit<WSMessage, "from" | "timestamp">) => {
//       if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
//         console.error("WebSocket is not connected")
//         return
//       }

//       if (!user) {
//         console.error("User not authenticated")
//         return
//       }

//       const fullMessage: WSMessage = {
//         ...message,
//         from: user.id,
//         timestamp: new Date(),
//       }

//       try {
//         ws.current.send(JSON.stringify(fullMessage))
//       } catch (error) {
//         console.error("Failed to send WebSocket message:", error)
//       }
//     },
//     [user],
//   )

//   useEffect(() => {
//     connect()

//     return () => {
//       if (ws.current) {
//         ws.current.close()
//       }
//     }
//   }, [connect])

//   return {
//     isConnected,
//     sendMessage,
//     lastMessage,
//     connectionError,
//   }
// }
"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface WebSocketMessage {
  type: string
  from: string
  to: string
  content: string
  subject?: string
  message_id?: string
  timestamp: Date
}

export function useWebSocket() {
  const { user, token, isAuthenticated } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    if (!isAuthenticated || !token || !user) {
      console.log("WebSocket: Not authenticated, skipping connection")
      return
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket: Already connected or connecting")
      return
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"
      const fullWsUrl = `${wsUrl}/ws/chat?token=${token}`

      console.log("WebSocket: Connecting to", wsUrl)

      const ws = new WebSocket(fullWsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket: Connected successfully")
        setIsConnected(true)
        reconnectAttemptsRef.current = 0

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
          console.log("WebSocket: Received message", data)

          if (data.type === "new_message" || data.type === "message") {
            setLastMessage({
              type: data.type,
              from: data.sender_id || data.from,
              to: data.recipient_id || data.to,
              content: data.content,
              subject: data.subject,
              message_id: data.id || data.message_id,
              timestamp: new Date(data.timestamp || data.created_at || Date.now()),
            })
          }
        } catch (error) {
          console.error("WebSocket: Error parsing message:", error)
        }
      }

      ws.onclose = (event) => {
        console.log("WebSocket: Disconnected", { code: event.code, reason: event.reason })
        setIsConnected(false)
        wsRef.current = null

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
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket: Connection error", error)
        setIsConnected(false)
      }
    } catch (error) {
      console.error("WebSocket: Failed to create connection:", error)
      setIsConnected(false)
    }
  }

  const disconnect = () => {
    console.log("WebSocket: Disconnecting...")

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect")
      wsRef.current = null
    }

    setIsConnected(false)
    reconnectAttemptsRef.current = 0
  }

  const sendMessage = (message: any) => {
    if (wsRef.current && isConnected) {
      console.log("WebSocket: Sending message", message)
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket: Not connected, message not sent:", message)
    }
  }

  // Connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token && user) {
      const connectTimeout = setTimeout(() => {
        connect()
      }, 1000)

      return () => clearTimeout(connectTimeout)
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, token, user])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  }
}
