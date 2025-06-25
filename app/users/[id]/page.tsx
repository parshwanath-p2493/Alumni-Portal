"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  MapPin,
  Calendar,
  Github,
  Linkedin,
  GraduationCap,
  Mail,
  ArrowLeft,
  Phone,
  Globe,
  BookOpen,
  Award,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"

interface UserDetail {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  student_id?: string
  graduation_year?: number
  cgpa?: number
  company?: string
  position?: string
  location?: string
  experience?: string
  skills?: string[]
  github_url?: string
  linkedin_url?: string
  department?: string
  specialization?: string
  bio?: string
  phone?: string
  website?: string
  education?: {
    degree: string
    institution: string
    year: string
  }[]
  projects?: {
    title: string
    description: string
  }[]
  publications?: {
    title: string
    journal: string
    year: string
  }[]
}

export default function UserDetailPage() {
  const { isAuthenticated } = useAuth()
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [user, setUser] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated || !userId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await api.users.getById(userId)
        setUser(response.data)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError("Failed to load user profile. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId, isAuthenticated])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
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
          <Button variant="outline" onClick={() => router.push("/directory")}>
            Back to Directory
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-gray-400">?</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline" onClick={() => router.push("/directory")}>
            Back to Directory
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.push("/directory")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600 mt-1">View detailed information about this user</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <Badge className={`mt-2 ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>

                  {user.position && (
                    <p className="text-gray-600 mt-2">
                      {user.position}
                      {user.company && ` at ${user.company}`}
                    </p>
                  )}

                  <Button className="mt-4 w-full" asChild>
                    <Link href={`/messages?user=${user.id}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 space-y-4">
                  {user.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-sm font-medium">{user.location}</p>
                      </div>
                    </div>
                  )}

                  {(user.role === "student" || user.role === "alumni") && user.graduation_year && (
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Graduation Year</p>
                        <p className="text-sm font-medium">{user.graduation_year}</p>
                      </div>
                    </div>
                  )}

                  {(user.role === "student" || user.role === "alumni") && user.student_id && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Student ID</p>
                        <p className="text-sm font-medium">{user.student_id}</p>
                      </div>
                    </div>
                  )}

                  {user.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {user.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="mt-6 flex space-x-2">
                  {user.github_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {user.linkedin_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills Card */}
            {user.skills && user.skills.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            {user.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{user.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {user.education && user.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.education.map((edu: any, index: number) => (
                      <div key={index} className="flex items-start">
                        <BookOpen className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500">{edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {user.projects && user.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.projects.map((project: any, index: number) => (
                      <div key={index}>
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Publications (for faculty) */}
            {user.publications && user.publications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Publications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.publications.map((pub: any, index: number) => (
                      <div key={index} className="flex items-start">
                        <Award className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">{pub.title}</h4>
                          <p className="text-sm text-gray-600">{pub.journal}</p>
                          <p className="text-sm text-gray-500">{pub.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Floating Message Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button size="lg" className="rounded-full w-14 h-14 shadow-lg p-0" asChild>
          <Link href={`/messages?user=${user.id}`}>
            <MessageSquare className="w-6 h-6" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
