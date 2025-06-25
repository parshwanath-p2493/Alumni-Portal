"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  ImageIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Settings,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

// Mock data - in real app, this would come from API
const mockAnalytics = {
  total_users: 1247,
  students_count: 856,
  alumni_count: 312,
  faculty_count: 79,
  total_projects: 234,
  major_projects: 89,
  mini_projects: 145,
  total_jobs: 67,
  active_jobs: 23,
  total_events: 45,
  upcoming_events: 8,
  total_messages: 3421,
  total_gallery_items: 156,
  recent_users: 34,
  recent_projects: 12,
  recent_jobs: 5,
}

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "student",
    student_id: "1DA20ET001",
    is_active: true,
    is_verified: true,
    created_at: "2024-01-15T10:30:00Z",
    last_login: "2024-01-20T14:22:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "alumni",
    student_id: "1DA18ET045",
    is_active: true,
    is_verified: false,
    created_at: "2024-01-10T09:15:00Z",
    last_login: "2024-01-19T16:45:00Z",
  },
  {
    id: "3",
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@ait.edu.in",
    role: "faculty",
    student_id: null,
    is_active: true,
    is_verified: true,
    created_at: "2023-12-05T11:20:00Z",
    last_login: "2024-01-20T08:30:00Z",
  },
]

const mockRecentActivity = [
  { type: "user_registered", message: "New student John Doe registered", time: "2 hours ago", severity: "info" },
  { type: "job_posted", message: "Alumni Jane Smith posted a new job", time: "4 hours ago", severity: "success" },
  { type: "project_uploaded", message: "Student uploaded IoT project", time: "6 hours ago", severity: "info" },
  { type: "user_reported", message: "User reported inappropriate content", time: "1 day ago", severity: "warning" },
  { type: "system_error", message: "Email service temporarily unavailable", time: "2 days ago", severity: "error" },
]

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(mockAnalytics)
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTab, setSelectedTab] = useState("overview")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.student_id && user.student_id.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active) ||
      (statusFilter === "verified" && user.is_verified) ||
      (statusFilter === "unverified" && !user.is_verified)

    return matchesSearch && matchesRole && matchesStatus
  })

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0
    return (((current - previous) / previous) * 100).toFixed(1)
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, description }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {trendValue}% from last month
              </div>
            )}
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const handleUserStatusToggle = (userId: string, field: "is_active" | "is_verified") => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, [field]: !user[field] } : user)))
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,Role,Student ID,Status,Verified,Created At\n" +
      users
        .map(
          (user) =>
            `${user.name},${user.email},${user.role},${user.student_id || ""},${user.is_active ? "Active" : "Inactive"},${user.is_verified ? "Yes" : "No"},${user.created_at}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "users_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">ETE Alumni Portal Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={analytics.total_users.toLocaleString()}
                icon={Users}
                trend="up"
                trendValue="12.5"
                description="All registered users"
              />
              <StatCard
                title="Active Projects"
                value={analytics.total_projects}
                icon={GraduationCap}
                trend="up"
                trendValue="8.2"
                description="Student projects"
              />
              <StatCard
                title="Job Postings"
                value={analytics.active_jobs}
                icon={Briefcase}
                trend="down"
                trendValue="3.1"
                description="Currently active"
              />
              <StatCard
                title="Upcoming Events"
                value={analytics.upcoming_events}
                icon={Calendar}
                trend="up"
                trendValue="25.0"
                description="Next 30 days"
              />
            </div>

            {/* User Distribution */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Students</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{analytics.students_count}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {((analytics.students_count / analytics.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Alumni</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{analytics.alumni_count}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {((analytics.alumni_count / analytics.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Faculty</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{analytics.faculty_count}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {((analytics.faculty_count / analytics.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Users</span>
                      <span className="text-sm font-bold text-green-600">+{analytics.recent_users}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Projects</span>
                      <span className="text-sm font-bold text-blue-600">+{analytics.recent_projects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Jobs</span>
                      <span className="text-sm font-bold text-purple-600">+{analytics.recent_jobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Messages</span>
                      <span className="text-sm font-bold text-gray-900">
                        {analytics.total_messages.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users by name, email, or student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`/avatars/${user.id}.jpg`} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "destructive"
                                : user.role === "faculty"
                                  ? "default"
                                  : user.role === "alumni"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.student_id || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserStatusToggle(user.id, "is_active")}
                            className={user.is_active ? "text-green-600" : "text-red-600"}
                          >
                            {user.is_active ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1" /> Inactive
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserStatusToggle(user.id, "is_verified")}
                            className={user.is_verified ? "text-green-600" : "text-yellow-600"}
                          >
                            {user.is_verified ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" /> Yes
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1" /> No
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.last_login).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Projects</span>
                      <span className="font-bold">{analytics.total_projects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Major Projects</span>
                      <span className="font-bold">{analytics.major_projects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Mini Projects</span>
                      <span className="font-bold">{analytics.mini_projects}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Manage Projects
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Jobs</span>
                      <span className="font-bold">{analytics.total_jobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Jobs</span>
                      <span className="font-bold">{analytics.active_jobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expired Jobs</span>
                      <span className="font-bold">{analytics.total_jobs - analytics.active_jobs}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Manage Jobs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Images</span>
                      <span className="font-bold">{analytics.total_gallery_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="font-bold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Storage Used</span>
                      <span className="font-bold">2.4 GB</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Manage Gallery
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>System events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.severity === "error"
                            ? "bg-red-500"
                            : activity.severity === "warning"
                              ? "bg-yellow-500"
                              : activity.severity === "success"
                                ? "bg-green-500"
                                : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <Badge
                        variant={
                          activity.severity === "error"
                            ? "destructive"
                            : activity.severity === "warning"
                              ? "secondary"
                              : activity.severity === "success"
                                ? "default"
                                : "outline"
                        }
                      >
                        {activity.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
