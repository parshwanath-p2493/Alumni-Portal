"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/services/api"
import { useWebSocket } from "@/hooks/useWebSocket"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    name: string
    avatar_url?: string
  }
}

interface Conversation {
  participant_id: string
  participant: {
    id: string
    name: string
    avatar_url?: string
    role: string
  }
  last_message: Message
  unread_count: number
  last_message_time: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const initialUserId = searchParams.get("user")

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(initialUserId)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [activeParticipant, setActiveParticipant] = useState<Conversation["participant"] | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isConnected, sendMessage, lastMessage } = useWebSocket()

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.messages.getConversations()
        setConversations(response.data)

        // If there's an initial user ID from query params but no active conversation yet
        if (initialUserId && !activeConversation) {
          setActiveConversation(initialUserId)

          // Find if this user is already in conversations
          const existingConversation = response.data.find((conv: Conversation) => conv.participant_id === initialUserId)

          if (existingConversation) {
            setActiveParticipant(existingConversation.participant)
          } else {
            // Fetch user details to start a new conversation
            try {
              const userResponse = await api.users.getById(initialUserId)
              setActiveParticipant(userResponse.data)
            } catch (error) {
              console.error("Failed to fetch user:", error)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [initialUserId, activeConversation])

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return

      try {
        const response = await api.messages.getMessages(activeConversation)
        setMessages(response.data)

        // Find the active participant
        const conversation = conversations.find((conv) => conv.participant_id === activeConversation)

        if (conversation) {
          setActiveParticipant(conversation.participant)

          // Mark messages as read
          if (conversation.unread_count > 0) {
            // This would typically call an API to mark messages as read
            // For now, we'll just update the local state
            setConversations((prevConversations) =>
              prevConversations.map((conv) =>
                conv.participant_id === activeConversation ? { ...conv, unread_count: 0 } : conv,
              ),
            )
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }

    fetchMessages()
  }, [activeConversation, conversations])

  // Handle new WebSocket messages
  useEffect(() => {
    if (!lastMessage || !user) return

    // If the message is for the current conversation, add it to the messages
    if (
      (lastMessage.from === activeConversation && lastMessage.to === user.id) ||
      (lastMessage.to === activeConversation && lastMessage.from === user.id)
    ) {
      const newMsg: Message = {
        id: lastMessage.message_id || `temp-${Date.now()}`,
        sender_id: lastMessage.from,
        recipient_id: lastMessage.to,
        content: lastMessage.content,
        subject: lastMessage.subject,
        is_read: lastMessage.from === user.id, // Messages sent by the user are automatically read
        created_at: lastMessage.timestamp.toISOString(),
      }

      setMessages((prevMessages) => [...prevMessages, newMsg])
    }

    // Update conversations list
    const otherUserId = lastMessage.from === user.id ? lastMessage.to : lastMessage.from

    setConversations((prevConversations) => {
      // Check if conversation exists
      const existingConvIndex = prevConversations.findIndex((conv) => conv.participant_id === otherUserId)

      if (existingConvIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...prevConversations]
        const conv = updatedConversations[existingConvIndex]

        updatedConversations[existingConvIndex] = {
          ...conv,
          last_message: {
            id: lastMessage.message_id || `temp-${Date.now()}`,
            sender_id: lastMessage.from,
            recipient_id: lastMessage.to,
            content: lastMessage.content,
            is_read: lastMessage.from === user.id,
            created_at: lastMessage.timestamp.toISOString(),
          },
          unread_count: lastMessage.from === user.id ? 0 : conv.unread_count + 1,
          last_message_time: lastMessage.timestamp.toISOString(),
        }

        return updatedConversations
      }

      // If it's a new conversation, we'd need to fetch the participant details
      // For now, we'll just return the current conversations
      return prevConversations
    })
  }, [lastMessage, user, activeConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return

    setIsSending(true)

    try {
      // Send via WebSocket for real-time delivery
      if (isConnected) {
        sendMessage({
          type: "message",
          to: activeConversation,
          content: newMessage,
        })
      }

      // Also send via API for persistence
      await api.messages.sendMessage(activeConversation, newMessage)

      // Clear input
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    // Otherwise show date
    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Chat with students, alumni, and faculty from the ETE department</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-sm text-gray-400">Start a new conversation from the directory</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.participant_id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          activeConversation === conversation.participant_id ? "bg-gray-50" : ""
                        }`}
                        onClick={() => setActiveConversation(conversation.participant_id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={conversation.participant.avatar_url || "/placeholder.svg"}
                              alt={conversation.participant.name}
                            />
                            <AvatarFallback>
                              {conversation.participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-900 truncate">{conversation.participant.name}</h4>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.last_message_time)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.last_message.sender_id === user?.id ? (
                                  <span className="text-gray-400">You: </span>
                                ) : null}
                                {conversation.last_message.content}
                              </p>
                              {conversation.unread_count > 0 && (
                                <Badge className="ml-2 bg-blue-500">{conversation.unread_count}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            {activeConversation && activeParticipant ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-row items-center space-y-0 pb-3">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={activeParticipant.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{activeParticipant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{activeParticipant.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <div key={message.id} className="mb-4">
                      <div className="flex items-center space-x-3">
                        {message.sender_id !== user?.id && (
                          <Avatar>
                            <AvatarImage src={message.sender?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{message.sender?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600">
                            {message.sender_id === user?.id ? <span className="text-gray-400">You: </span> : null}
                            {message.content}
                          </p>
                          <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                        </div>
                        {message.sender_id === user?.id && (
                          <Avatar>
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef}></div>
                </CardContent>
                <div className="p-4 border-t">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full"
                  />
                  <Button onClick={handleSendMessage} className="mt-2">
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
