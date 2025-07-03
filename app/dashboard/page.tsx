"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { WebSocketDebug } from "@/components/websocket-debug"
import { AuthDebug } from "@/components/auth-debug"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GraduationCap,
  Briefcase,
  Calendar,
  MessageSquare,
  Users,
  ImageIcon,
  Bell,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  ChevronDown,
  Activity,
  Github,
  Linkedin,
  Building,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/services/api"


interface DashboardStats {
  projectsPosted?: number
  jobApplications?: number
  messages?: number
  eventsAttended?: number
  jobsPosted?: number
  studentConnections?: number
  profileViews?: number
  studentsMentored?: number
  galleryUploads?: number
  eventsOrganized?: number
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log("Dashboard Debug:", {
    user: user ? { name: user.name, email: user.email, role: user.role } : null,
    isAuthenticated,
    authLoading,
  })
  // Redirect admin users to admin panel
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.push("/admin")
    }
  }, [isAuthenticated, user, router])

  // FIXED: Proper authentication check
  useEffect(() => {
    console.log("Dashboard auth check:", { authLoading, isAuthenticated })

    // Only redirect if auth loading is complete AND user is not authenticated
    if (!authLoading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      router.push("/auth/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
     if (!user || user.role === "admin") return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch dashboard stats if endpoint exists
        try {
          const statsData = await api.users.getDashboardStats()
          setStats(statsData || {})
        } catch (err) {
          // If stats endpoint doesn't exist, use default values
          console.log("Dashboard stats endpoint not available, using defaults")
          setStats({})
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/login")
    } catch (err) {
      console.error("Error logging out:", err)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getRoleSpecificStats = () => {
    if (!user) return []

    switch (user.role) {
      case "student":
        return [
          {
            label: "Projects Posted",
            value: stats.projectsPosted?.toString() || "0",
            icon: GraduationCap,
            color: "bg-blue-500",
          },
          {
            label: "Job Applications",
            value: stats.jobApplications?.toString() || "0",
            icon: Briefcase,
            color: "bg-green-500",
          },
          { label: "Messages", value: stats.messages?.toString() || "0", icon: MessageSquare, color: "bg-purple-500" },
          {
            label: "Events Attended",
            value: stats.eventsAttended?.toString() || "0",
            icon: Calendar,
            color: "bg-orange-500",
          },
        ]
      case "alumni":
        return [
          { label: "Jobs Posted", value: stats.jobsPosted?.toString() || "0", icon: Briefcase, color: "bg-green-500" },
          {
            label: "Student Connections",
            value: stats.studentConnections?.toString() || "0",
            icon: Users,
            color: "bg-blue-500",
          },
          { label: "Messages", value: stats.messages?.toString() || "0", icon: MessageSquare, color: "bg-purple-500" },
          {
            label: "Profile Views",
            value: stats.profileViews?.toString() || "0",
            icon: TrendingUp,
            color: "bg-orange-500",
          },
        ]
      case "faculty":
        return [
          {
            label: "Students Mentored",
            value: stats.studentsMentored?.toString() || "0",
            icon: Users,
            color: "bg-blue-500",
          },
          {
            label: "Gallery Uploads",
            value: stats.galleryUploads?.toString() || "0",
            icon: ImageIcon,
            color: "bg-green-500",
          },
          { label: "Messages", value: stats.messages?.toString() || "0", icon: MessageSquare, color: "bg-purple-500" },
          {
            label: "Events Organized",
            value: stats.eventsOrganized?.toString() || "0",
            icon: Calendar,
            color: "bg-orange-500",
          },
        ]
      default:
        return []
    }
  }

  const getQuickActions = () => {
    if (!user) return []

    switch (user.role) {
      case "student":
        return [
          { label: "Post Project", href: "/projects/new", icon: Plus, color: "bg-green-500" },
          { label: "Browse Jobs", href: "/jobs", icon: Briefcase, color: "bg-blue-500" },
          { label: "Find Alumni", href: "/directory", icon: Users, color: "bg-purple-500" },
          { label: "View Gallery", href: "/gallery", icon: ImageIcon, color: "bg-teal-500" },
          { label: "Messages", href: "/messages", icon: MessageSquare, color: "bg-orange-500" },
          { label: "View Events", href: "/events", icon: Calendar, color: "bg-orange-500" },
        ]
      case "alumni":
        return [
          // { label: "Post Job", href: "/jobs/add", icon: Plus, color: "bg-green-500" },
          // { label: "View Students", href: "/users", icon: Users, color: "bg-blue-500" },
          // { label: "Browse Projects", href: "/projects/projectview", icon: GraduationCap, color: "bg-purple-500" },
          // { label: "View Gallery", href: "/gallery", icon: ImageIcon, color: "bg-teal-500" },

          { label: "Post Job", href: "/jobs/new", icon: Plus, color: "bg-green-500" },
          { label: "View Students", href: "/directory", icon: Users, color: "bg-blue-500" },
          { label: "Browse Projects", href: "/projects", icon: GraduationCap, color: "bg-purple-500" },
          { label: "Messages", href: "/messages", icon: MessageSquare, color: "bg-orange-500" },
          { label: "View Events", href: "/events", icon: Calendar, color: "bg-orange-500" },
          { label: "View Gallery", href: "/gallery", icon: ImageIcon, color: "bg-teal-500" },
        ]
      case "faculty":
        return [
          { label: "Upload Photos", href: "/gallery/upload", icon: Plus, color: "bg-green-500" },
          { label: "View Students", href: "/directory", icon: Users, color: "bg-blue-500" },
          { label: "Browse Projects", href: "/projects", icon: GraduationCap, color: "bg-purple-500" },
          // { label: "Messages", href: "/messages", icon: MessageSquare, color: "bg-orange-500" },
          { label: "View Events", href: "/events", icon: Calendar, color: "bg-orange-500" },
          { label: "View Gallery", href: "/gallery", icon: ImageIcon, color: "bg-teal-500" },
        ]
      default:
        return []
    }
  }

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Show loading while dashboard data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-4xl">!</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ETE Alumni Portal</h1>
                <p className="text-xs text-gray-500">Electronics & Telecommunication Engineering</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:block">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/users/updateprofile">
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notifications/inbox">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user.name}!
          </h1>
          <p className="text-gray-600 mb-4">Welcome to your dashboard. Here's what's happening in the ETE community.</p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="bg-blue-600">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
            {user.student_id && <Badge variant="outline">{user.student_id}</Badge>}
            {user.graduation_year && <Badge variant="outline">Class of {user.graduation_year}</Badge>}
            {user.company && <Badge variant="secondary">{user.company}</Badge>}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getRoleSpecificStats().map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {user.company && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span>{user.company}</span>
                    </div>
                  )}
                  {user.graduation_year && (
                    <div className="flex items-center space-x-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <span>Graduated in {user.graduation_year}</span>
                    </div>
                  )}
                  {user.github && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Github className="w-4 h-4 text-gray-500" />
                      <a
                        href={user.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  {user.linkedin && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Linkedin className="w-4 h-4 text-gray-500" />
                      <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/users/updateprofile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for your role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {getQuickActions().map((action, index) => (
                  <Button key={index} variant="ghost" className="w-full justify-start" asChild>
                    <Link href={action.href}>
                      <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      {action.label}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Navigation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from the ETE community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity to show</p>
                    <p className="text-sm">Start engaging with the community to see updates here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <Link href="/projects" className="block">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Projects</h3>
                        <p className="text-sm text-gray-600">Browse and showcase student projects</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <Link href="/jobs" className="block">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Briefcase className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Jobs</h3>
                        <p className="text-sm text-gray-600">Find career opportunities</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <Link href="/directory" className="block">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Directory</h3>
                        <p className="text-sm text-gray-600">Connect with alumni and students</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <Link href="/events" className="block">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <Calendar className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Events</h3>
                        <p className="text-sm text-gray-600">Upcoming alumni events</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p>User: {user ? `${user.name} (${user.email})` : "None"}</p>
            <p>Is Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
            <p>Auth Loading: {authLoading ? "Yes" : "No"}</p>
            <p>Role: {user?.role || "None"}</p>
          </div>
        )}
      </div>
    </div>
  )
}





// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   GraduationCap,
//   Briefcase,
//   Calendar,
//   MessageSquare,
//   Users,
//   ImageIcon,
//   Bell,
//   Settings,
//   LogOut,
//   Plus,
//   TrendingUp,
// } from "lucide-react"
// import { useAuth } from "@/contexts/auth-context"
// import { api } from "@/services/api"
// import { useRouter } from "next/navigation"
// import Cookies from "js-cookie"

// interface User {
//   id: string
//   name: string
//   email: string
//   role: string
//   avatar_url?: string
//   student_id?: string
//   graduation_year?: string
//   company?: string
//   position?: string
//   location?: string
//   experience?: string
//   skills?: string[]
//   github_url?: string
//   linkedin_url?: string
//   cgpa?: string
//   department?: string
//   specialization?: string
// }

// interface DashboardStats {
//   projectsPosted?: number
//   jobApplications?: number
//   messages?: number
//   eventsAttended?: number
//   jobsPosted?: number
//   studentConnections?: number
//   profileViews?: number
//   studentsMentored?: number
//   galleryUploads?: number
//   eventsOrganized?: number
// }

// export default function DashboardPage() {
//   const { user: authUser, logout } = useAuth()
//   const router = useRouter()
//   const [user, setUser] = useState<User | null>(null)
//   const [stats, setStats] = useState<DashboardStats>({})
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const token = Cookies.get("access_token")
//     if (!token) {
//       router.push("/auth/login")
//     }
//   }, [router])

//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (!authUser) {
//         router.push('/auth/login')
//         return
//       }

//       try {
//         setIsLoading(true)
//         setError(null)

//         // Fetch user profile
//         const token = Cookies.get("access_token")
//         const userResponse = await fetch("http://localhost:8080/auth/me", {
//           headers: { Authorization: `Bearer ${token}` }
//         })
//         const userData = await userResponse.json()
//         setUser(userData.user || userData.data?.user)

//         // Fetch dashboard stats
//         const statsResponse = await fetch("http://localhost:8080/dashboard/stats", {
//           headers: { Authorization: `Bearer ${token}` }
//         })
//         const statsData = await statsResponse.json()
//         setStats(statsData || statsData.data)
//       } catch (err) {
//         console.error('Error fetching dashboard data:', err)
//         setError('Failed to load dashboard data. Please try again.')
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchUserData()
//   }, [authUser, router])

//   const handleLogout = async () => {
//     try {
//       await logout()
//       router.push('/auth/login')
//     } catch (err) {
//       console.error('Error logging out:', err)
//     }
//   }

//   const getGreeting = () => {
//     const hour = new Date().getHours()
//     if (hour < 12) return "Good morning"
//     if (hour < 18) return "Good afternoon"
//     return "Good evening"
//   }

//   const getRoleSpecificStats = () => {
//     if (!user) return []

//     switch (user.role) {
//       case "student":
//         return [
//           { label: "Projects Posted", value: stats.projectsPosted?.toString() || "0", icon: GraduationCap },
//           { label: "Job Applications", value: stats.jobApplications?.toString() || "0", icon: Briefcase },
//           { label: "Messages", value: stats.messages?.toString() || "0", icon: MessageSquare },
//           { label: "Events Attended", value: stats.eventsAttended?.toString() || "0", icon: Calendar },
//         ]
//       case "alumni":
//         return [
//           { label: "Jobs Posted", value: stats.jobsPosted?.toString() || "0", icon: Briefcase },
//           { label: "Student Connections", value: stats.studentConnections?.toString() || "0", icon: Users },
//           { label: "Messages", value: stats.messages?.toString() || "0", icon: MessageSquare },
//           { label: "Profile Views", value: stats.profileViews?.toString() || "0", icon: TrendingUp },
//         ]
//       case "faculty":
//         return [
//           { label: "Students Mentored", value: stats.studentsMentored?.toString() || "0", icon: Users },
//           { label: "Gallery Uploads", value: stats.galleryUploads?.toString() || "0", icon: ImageIcon },
//           { label: "Messages", value: stats.messages?.toString() || "0", icon: MessageSquare },
//           { label: "Events Organized", value: stats.eventsOrganized?.toString() || "0", icon: Calendar },
//         ]
//       default:
//         return []
//     }
//   }

//   const getQuickActions = () => {
//     if (!user) return []

//     switch (user.role) {
//       case "student":
//         return [
//           { label: "Post Project", href: "http://localhost:8080/projects/addproject", icon: Plus },
//           { label: "Browse Jobs", href: "http://localhost:8080/jobs", icon: Briefcase },
//           { label: "Find Alumni", href: "http://localhost:8080/users", icon: Users },
//           { label: "View Events", href: "http://localhost:8080/events", icon: Calendar },
//         ]
//       case "alumni":
//         return [
//           { label: "Post Job", href: "/jobs/add", icon: Plus },
//           { label: "View Students", href: "/users", icon: Users },
//           { label: "Browse Projects", href: "/projects/projectview", icon: GraduationCap },
//           { label: "Messages", href: "/messages/message", icon: MessageSquare },
//         ]
//       case "faculty":
//         return [
//           { label: "Upload Photos", href: "/gallery/upload", icon: Plus },
//           { label: "View Students", href: "/directory", icon: Users },
//           { label: "Browse Projects", href: "/projects/projectview", icon: GraduationCap },
//           { label: "Messages", href: "/messages", icon: MessageSquare },
//         ]
//       default:
//         return []
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-red-500 text-4xl">!</span>
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <Button onClick={() => window.location.reload()}>Try Again</Button>
//         </div>
//       </div>
//     )
//   }

//   if (!user) {
//     return null
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
//                 <GraduationCap className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-lg font-semibold text-gray-900">ETE Alumni Portal</h1>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <Button variant="ghost" size="sm">
//                 <Bell className="w-4 h-4" />
//               </Button>
//               <Button variant="ghost" size="sm" asChild>
//                 <Link href="/settings">
//                   <Settings className="w-4 h-4" />
//                 </Link>
//               </Button>
//               <div className="flex items-center space-x-2">
//                 <Avatar className="w-8 h-8">
//                   <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
//                   <AvatarFallback>
//                     {user.name
//                       .split(" ")
//                       .map((n) => n[0])
//                       .join("")}
//                   </AvatarFallback>
//                 </Avatar>
//                 <span className="text-sm font-medium">{user.name}</span>
//               </div>
//               <Button variant="ghost" size="sm" onClick={handleLogout}>
//                 <LogOut className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8">
//         {/* Welcome Section */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             {getGreeting()}, {user.name}!
//           </h1>
//           <p className="text-gray-600">Welcome to your dashboard. Here's what's happening in the ETE community.</p>
//           <div className="flex items-center space-x-2 mt-2">
//             <Badge variant="secondary">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
//             {user.student_id && <Badge variant="outline">{user.student_id}</Badge>}
//             {user.graduation_year && <Badge variant="outline">Class of {user.graduation_year}</Badge>}
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {getRoleSpecificStats().map((stat, index) => (
//             <Card key={index}>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">{stat.label}</p>
//                     <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//                   </div>
//                   <stat.icon className="w-8 h-8 text-blue-600" />
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Quick Actions */}
//           <div className="lg:col-span-1">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Quick Actions</CardTitle>
//                 <CardDescription>Common tasks for your role</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 {getQuickActions().map((action, index) => (
//                   <Button key={index} variant="ghost" className="w-full justify-start" asChild>
//                     <Link href={action.href}>
//                       <action.icon className="w-4 h-4 mr-2" />
//                       {action.label}
//                     </Link>
//                   </Button>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Recent Activity */}
//           <div className="lg:col-span-2">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Recent Activity</CardTitle>
//                 <CardDescription>Latest updates from the ETE community</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {/* We'll implement real activity data later */}
//                   <div className="text-center py-4 text-gray-500">
//                     No recent activity to show
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <Button variant="outline" className="w-full" asChild>
//                     <Link href="/activity">View All Activity</Link>
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Navigation Cards */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
//           <Card className="hover:shadow-lg transition-shadow cursor-pointer">
//             <CardContent className="p-6">
//               <Link href="/projects" className="block">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <GraduationCap className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900">Projects</h3>
//                     <p className="text-sm text-gray-600">Browse student projects</p>
//                   </div>
//                 </div>
//               </Link>
//             </CardContent>
//           </Card>

//           <Card className="hover:shadow-lg transition-shadow cursor-pointer">
//             <CardContent className="p-6">
//               <Link href="/jobs" className="block">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                     <Briefcase className="w-6 h-6 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900">Jobs</h3>
//                     <p className="text-sm text-gray-600">Find opportunities</p>
//                   </div>
//                 </div>
//               </Link>
//             </CardContent>
//           </Card>

//           <Card className="hover:shadow-lg transition-shadow cursor-pointer">
//             <CardContent className="p-6">
//               <Link href="/directory" className="block">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                     <Users className="w-6 h-6 text-purple-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900">Directory</h3>
//                     <p className="text-sm text-gray-600">Connect with people</p>
//                   </div>
//                 </div>
//               </Link>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
