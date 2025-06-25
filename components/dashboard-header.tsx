"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { api } from "@/services/api"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    name: string
    avatar_url?: string
  }
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

export function DashboardHeader() {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = (await api.notifications.getAll()) as NotificationResponse
        const notifs = response.data?.notifications || []
        setNotifications(notifs.slice(0, 5)) // Show only 5 recent
        setUnreadCount(notifs.filter((n: Notification) => !n.is_read).length)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest("[data-notification-dropdown]")) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showNotifications])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search..." className="pl-10 w-80" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" data-notification-dropdown>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/notifications">View All</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b hover:bg-gray-50 ${!notif.is_read ? "bg-blue-50" : ""}`}
                        >
                          <div className="flex items-start space-x-2">
                            {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notif.title}</h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
