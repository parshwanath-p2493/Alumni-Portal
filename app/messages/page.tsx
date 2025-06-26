"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, MessageSquare, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import api from "@/services/api"
import { useWebSocket } from "@/hooks/useWebSocket"
import { toast } from "@/hooks/use-toast"

interface UserResponse {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  department?: string
  graduation_year?: number
}

interface Message {
  _id: string
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
  is_read: boolean
  created_at: string
  sender?: UserResponse
  recipient?: UserResponse
}

interface Conversation {
  participant_id: string
  participant: UserResponse
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
  const [activeParticipant, setActiveParticipant] = useState<UserResponse | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isConnected, sendMessage: sendWebSocketMessage, lastMessage } = useWebSocket()

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.messages.getConversations()
        if (response.error === false && response.data) {
          setConversations(response.data)

          // If there's an initial user ID from query params
          if (initialUserId && !activeConversation) {
            setActiveConversation(initialUserId)

            // Find if this user is already in conversations
            const existingConversation = response.data.find(
              (conv: Conversation) => conv.participant_id === initialUserId,
            )

            if (existingConversation) {
              setActiveParticipant(existingConversation.participant)
            } else {
              // Fetch user details to start a new conversation
              try {
                const userResponse = await api.users.getById(initialUserId)
                if (userResponse.error === false) {
                  setActiveParticipant(userResponse.data)
                }
              } catch (error) {
                console.error("Failed to fetch user:", error)
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchConversations()
    }
  }, [user, initialUserId, activeConversation])

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return

      try {
        const response = await api.messages.getMessages(activeConversation)
        if (response.error === false && response.data) {
          // Messages are returned in descending order, reverse for chat display
          const sortedMessages = response.data.messages.reverse()
          setMessages(sortedMessages)

          // Find the active participant
          const conversation = conversations.find((conv) => conv.participant_id === activeConversation)
          if (conversation) {
            setActiveParticipant(conversation.participant)
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
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
        _id: lastMessage.message_id || `temp-${Date.now()}`,
        sender_id: lastMessage.from,
        recipient_id: lastMessage.to,
        content: lastMessage.content,
        subject: lastMessage.subject,
        is_read: lastMessage.from === user.id,
        created_at: lastMessage.timestamp.toISOString(),
      }

      setMessages((prevMessages) => [...prevMessages, newMsg])
    }

    // Update conversations list
    const otherUserId = lastMessage.from === user.id ? lastMessage.to : lastMessage.from
    setConversations((prevConversations) => {
      const existingConvIndex = prevConversations.findIndex((conv) => conv.participant_id === otherUserId)

      if (existingConvIndex >= 0) {
        const updatedConversations = [...prevConversations]
        const conv = updatedConversations[existingConvIndex]

        updatedConversations[existingConvIndex] = {
          ...conv,
          last_message: {
            _id: lastMessage.message_id || `temp-${Date.now()}`,
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

      return prevConversations
    })
  }, [lastMessage, user, activeConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return

    // Validate message length according to backend (1-5000 characters)
    if (newMessage.trim().length > 5000) {
      toast({
        title: "Message too long",
        description: "Message must be 5000 characters or less.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      // Send via API for persistence
      const response = await api.messages.sendMessage(activeConversation, newMessage.trim())

      if (response.error === false) {
        // Send via WebSocket for real-time delivery
        if (isConnected) {
          sendWebSocketMessage({
            type: "message",
            to: activeConversation,
            content: newMessage.trim(),
          })
        }

        // Add message to local state immediately
        const newMsg: Message = {
          _id: response.data._id || `temp-${Date.now()}`,
          sender_id: user.id,
          recipient_id: activeConversation,
          content: newMessage.trim(),
          is_read: true,
          created_at: new Date().toISOString(),
          sender: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
          },
        }

        setMessages((prev) => [...prev, newMsg])
        setNewMessage("")

        toast({
          title: "Message sent",
          description: "Your message has been delivered",
        })
      } else {
        throw new Error(response.message || "Failed to send message")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
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

  const handleConversationSelect = (participantId: string, participant: UserResponse) => {
    setActiveConversation(participantId)
    setActiveParticipant(participant)
    setShowMobileChat(true)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4">
        {showMobileChat && activeParticipant ? (
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setShowMobileChat(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={activeParticipant.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{activeParticipant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{activeParticipant.name}</h2>
              <p className="text-sm text-gray-500">{activeParticipant.role}</p>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-bold">Messages</h1>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Conversations List */}
        <div className={`w-full md:w-1/3 border-r bg-white ${showMobileChat ? "hidden md:block" : ""}`}>
          <div className="p-4 border-b">
            <div className="hidden md:block mb-4">
              <h1 className="text-xl font-bold">Messages</h1>
              <p className="text-sm text-gray-600">Chat with the ETE community</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400">Start chatting with the community!</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.participant_id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      activeConversation === conversation.participant_id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                    }`}
                    onClick={() => handleConversationSelect(conversation.participant_id, conversation.participant)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
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
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{conversation.participant.name}</h4>
                          <span className="text-xs text-gray-500">{formatTime(conversation.last_message_time)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.last_message.sender_id === user?.id && (
                              <span className="text-gray-400">You: </span>
                            )}
                            {conversation.last_message.content}
                          </p>
                          {conversation.unread_count > 0 && (
                            <Badge className="ml-2 bg-blue-500 text-white">{conversation.unread_count}</Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {conversation.participant.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col ${!showMobileChat ? "hidden md:flex" : ""}`}>
          {activeConversation && activeParticipant ? (
            <>
              {/* Chat Header - Desktop Only */}
              <div className="hidden md:flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeParticipant.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{activeParticipant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{activeParticipant.name}</h2>
                    <p className="text-sm text-gray-500">{activeParticipant.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}></div>
                  <span className="text-xs text-gray-500">{isConnected ? "Connected" : "Offline"}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id ? "bg-blue-500 text-white" : "bg-white text-gray-900 border"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === user?.id ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message... (max 5000 characters)"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={isSending}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {newMessage.length > 0 && (
                    <div className="text-xs text-gray-500 text-right">{newMessage.length}/5000 characters</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
