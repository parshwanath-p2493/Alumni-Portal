"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  MessageSquare,
  MapPin,
  Calendar,
  Building,
  Github,
  Linkedin,
  GraduationCap,
  Users,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  student_id?: string
  graduation_year?: string
  company?: string
  position?: string
  location?: string
  experience?: string
  skills?: string[]
  github_url?: string
  linkedin_url?: string
  cgpa?: string
  department?: string
  specialization?: string
}

export default function DirectoryPage() {
  const { isAuthenticated } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterGradYear, setFilterGradYear] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await api.users.getAll()
        setUsers(response.data)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [isAuthenticated])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.skills && user.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesGradYear = filterGradYear === "all" || user.graduation_year === filterGradYear

    return matchesSearch && matchesRole && matchesGradYear
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "graduation":
        return (b.graduation_year || "0").localeCompare(a.graduation_year || "0")
      case "experience":
        const aExp = Number.parseInt(a.experience?.split(" ")[0] || "0")
        const bExp = Number.parseInt(b.experience?.split(" ")[0] || "0")
        return bExp - aExp
      case "name":
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800"
      case "alumni":
        return "bg-green-100 text-green-800"
      case "faculty":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGraduationYears = () => {
    const years = users
      .map((user) => user.graduation_year)
      .filter((year): year is string => typeof year === 'string' && year.length > 0)
    return [...new Set(years)].sort().reverse()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ETE Directory</h1>
            <p className="text-gray-600 mt-1">Connect with students, alumni, and faculty from the ETE department</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, skills, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterGradYear} onValueChange={setFilterGradYear}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Graduation Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {getGraduationYears().map((year) => (
                  <SelectItem key={year} value={year}>
                    Class of {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="graduation">Graduation</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/messages?user=${user.id}`}>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Link>
                  </Button>
                </div>

                {/* Details based on role */}
                <div className="space-y-3">
                  {user.role === "student" && (
                    <>
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {user.student_id} • Class of {user.graduation_year}
                      </div>
                      {user.cgpa && (
                        <div className="text-sm text-gray-600">
                          <strong>CGPA:</strong> {user.cgpa}
                        </div>
                      )}
                    </>
                  )}

                  {user.role === "alumni" && (
                    <>
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {user.student_id} • Class of {user.graduation_year}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2" />
                        {user.position} at {user.company}
                      </div>
                      {user.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {user.location}
                        </div>
                      )}
                      {user.experience && (
                        <div className="text-sm text-gray-600">
                          <strong>Experience:</strong> {user.experience}
                        </div>
                      )}
                    </>
                  )}

                  {user.role === "faculty" && (
                    <>
                      <div className="text-sm text-gray-600">
                        <strong>{user.position}</strong>
                      </div>
                      <div className="text-sm text-gray-600">{user.department}</div>
                      {user.specialization && (
                        <div className="text-sm text-gray-600">
                          <strong>Specialization:</strong> {user.specialization}
                        </div>
                      )}
                      {user.experience && (
                        <div className="text-sm text-gray-600">
                          <strong>Experience:</strong> {user.experience}
                        </div>
                      )}
                    </>
                  )}

                  {/* Skills */}
                  {user.skills && user.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {user.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {user.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="flex space-x-2 pt-2">
                    {user.github_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                    {user.linkedin_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild className="ml-auto">
                      <Link href={`/users/${user.id}`}>See Full Profile</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setFilterRole("all")
                setFilterGradYear("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
