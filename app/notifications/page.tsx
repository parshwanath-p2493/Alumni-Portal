"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, CheckCheck } from "lucide-react"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface Notification {
  _id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  created_at: string
  sender_id?: string
  action_url?: string
  metadata?: Record<string, any>
}

interface NotificationResponse {
  error: boolean
  data: {
    notifications: Notification[]
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
  }
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return

      try {
        const response = (await api.notifications.getAll()) as NotificationResponse
        setNotifications(response.data?.notifications || [])
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [isAuthenticated])

  const markAsRead = async (notificationId: string) => {
    try {
      await api.notifications.markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, is_read: true } : notif)),
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead()
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })))
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated.",
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to update notifications.",
        variant: "destructive",
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓"
      case "warning":
        return "⚠"
      case "error":
        return "✕"
      default:
        return "ℹ"
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.is_read
    if (filter === "read") return notif.is_read
    return true
  })

  const unreadCount = notifications.filter((notif) => !notif.is_read).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with the latest activities
            {unreadCount > 0 && <Badge className="ml-2 bg-red-500">{unreadCount} unread</Badge>}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All ({notifications.length})
        </Button>
        <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
          Unread ({unreadCount})
        </Button>
        <Button variant={filter === "read" ? "default" : "outline"} size="sm" onClick={() => setFilter("read")}>
          Read ({notifications.length - unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === "unread" ? "No unread notifications" : "No notifications"}
              </h3>
              <p className="text-gray-600">
                {filter === "unread"
                  ? "You're all caught up! Check back later for new updates."
                  : "You don't have any notifications yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-all hover:shadow-md ${
                !notification.is_read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-gray-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                            {getTypeIcon(notification.type)} {notification.type}
                          </Badge>
                          {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification._id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {notification.action_url && (
                      <div className="mt-3">
                        <Button size="sm" variant="outline" asChild>
                          <a href={notification.action_url}>View Details</a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
