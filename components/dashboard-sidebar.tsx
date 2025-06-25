"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  MessageSquare,
  ImageIcon,
  Settings,
  Bell,
  User,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["student", "alumni", "faculty", "admin"] },
  { name: "Directory", href: "/users", icon: Users, roles: ["student", "alumni", "faculty", "admin"] },
  { name: "Projects", href: "/projects", icon: GraduationCap, roles: ["student", "alumni", "faculty", "admin"] },
  { name: "Jobs", href: "/jobs", icon: Briefcase, roles: ["student", "alumni", "faculty", "admin"] },
  { name: "Events", href: "/events", icon: Calendar, roles: ["student", "alumni", "faculty", "admin"] },
  { name: "Messages", href: "/messages", icon: MessageSquare, roles: ["student", "alumni", "faculty", "admin"] },
  { name: "Gallery", href: "/gallery", icon: ImageIcon, roles: ["student", "alumni", "faculty", "admin"] },
]

const accountNavigation = [
  { name: "Profile", href: "/profile", icon: User, roles: ["student", "alumni", "faculty", "admin"] },
  { name: "Notifications", href: "/notifications", icon: Bell, roles: ["student", "alumni", "faculty", "admin"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["student", "alumni", "faculty", "admin"] },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredNavigation = navigation.filter((item) => user?.role && item.roles.includes(user.role))

  const filteredAccountNavigation = accountNavigation.filter((item) => user?.role && item.roles.includes(user.role))

  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">ETE Portal</span>
        </div>
      </div>

      <nav className="px-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 px-4">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Account</h3>
        <nav className="mt-2 space-y-1">
          {filteredAccountNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </nav>
      </div>
    </div>
  )
}
