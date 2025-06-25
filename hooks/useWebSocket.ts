"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useAuth } from "./useAuth"

interface WSMessage {
  type: string
  from: string
  to: string
  content: string
  subject?: string
  timestamp: Date
  message_id?: string
  data?: any
}

interface UseWebSocketReturn {
  isConnected: boolean
  sendMessage: (message: Omit<WSMessage, "from" | "timestamp">) => void
  lastMessage: WSMessage | null
  connectionError: string | null
}

export function useWebSocket(): UseWebSocketReturn {
  const { user, token } = useAuth()
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const connect = useCallback(() => {
    if (!user || !token) return

    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"}/ws?userId=${user.id}`
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        setConnectionError(null)
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          message.timestamp = new Date(message.timestamp)
          setLastMessage(message)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      ws.current.onclose = () => {
        console.log("WebSocket disconnected")
        setIsConnected(false)
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000)
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionError("Connection failed")
        setIsConnected(false)
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      setConnectionError("Failed to connect")
    }
  }, [user, token])

  const sendMessage = useCallback(
    (message: Omit<WSMessage, "from" | "timestamp">) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected")
        return
      }

      if (!user) {
        console.error("User not authenticated")
        return
      }

      const fullMessage: WSMessage = {
        ...message,
        from: user.id,
        timestamp: new Date(),
      }

      try {
        ws.current.send(JSON.stringify(fullMessage))
      } catch (error) {
        console.error("Failed to send WebSocket message:", error)
      }
    },
    [user],
  )

  useEffect(() => {
    connect()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connectionError,
  }
}
