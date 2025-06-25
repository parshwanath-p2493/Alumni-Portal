"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, ExternalLink, Github, Calendar } from "lucide-react"

// Mock projects data
const mockProjects = [
  {
    id: 1,
    title: "IoT-Based Smart Home Automation System",
    description:
      "A comprehensive home automation system using ESP32, sensors, and mobile app control. Features include voice control, scheduling, and energy monitoring.",
    type: "Major Project",
    author: {
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=40&width=40",
      studentId: "1DA20ET015",
    },
    technologies: ["ESP32", "React Native", "Firebase", "IoT"],
    githubUrl: "https://github.com/priya/smart-home",
    demoUrl: "https://smart-home-demo.com",
    createdAt: "2024-01-15",
    likes: 24,
    views: 156,
  },
  {
    id: 2,
    title: "5G Network Performance Analysis Tool",
    description:
      "A tool for analyzing 5G network performance metrics including latency, throughput, and signal strength across different geographical locations.",
    type: "Mini Project",
    author: {
      name: "Rahul Kumar",
      avatar: "/placeholder.svg?height=40&width=40",
      studentId: "1DA20ET032",
    },
    technologies: ["Python", "Matplotlib", "Pandas", "5G"],
    githubUrl: "https://github.com/rahul/5g-analysis",
    createdAt: "2024-02-10",
    likes: 18,
    views: 89,
  },
  {
    id: 3,
    title: "RFID-Based Attendance Management System",
    description:
      "An automated attendance system using RFID technology with web dashboard for teachers and students to track attendance records.",
    type: "Major Project",
    author: {
      name: "Anita Reddy",
      avatar: "/placeholder.svg?height=40&width=40",
      studentId: "1DA20ET008",
    },
    technologies: ["Arduino", "RFID", "PHP", "MySQL", "Bootstrap"],
    githubUrl: "https://github.com/anita/rfid-attendance",
    demoUrl: "https://attendance-demo.com",
    createdAt: "2024-01-28",
    likes: 31,
    views: 203,
  },
  {
    id: 4,
    title: "Machine Learning Based ECG Arrhythmia Detection",
    description:
      "A deep learning model to detect cardiac arrhythmias from ECG signals with high accuracy using CNN and LSTM networks.",
    type: "Major Project",
    author: {
      name: "Vikram Singh",
      avatar: "/placeholder.svg?height=40&width=40",
      studentId: "1DA20ET045",
    },
    technologies: ["Python", "TensorFlow", "Keras", "Signal Processing"],
    githubUrl: "https://github.com/vikram/ecg-detection",
    createdAt: "2024-02-05",
    likes: 42,
    views: 287,
  },
]

export default function ProjectsPage() {
  const [projects] = useState(mockProjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = filterType === "all" || project.type.toLowerCase().includes(filterType.toLowerCase())

    return matchesSearch && matchesFilter
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes
      case "views":
        return b.views - a.views
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Projects</h1>
              <p className="text-gray-600 mt-1">Discover innovative projects by ETE students</p>
            </div>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Post Project
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects, technologies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="major">Major Projects</SelectItem>
                <SelectItem value="mini">Mini Projects</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant={project.type === "Major Project" ? "default" : "secondary"}>{project.type}</Badge>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <span>{project.views} views</span>
                    <span>•</span>
                    <span>{project.likes} likes</span>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                <CardDescription className="line-clamp-3">{project.description}</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Author Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={project.author.avatar || "/placeholder.svg"} alt={project.author.name} />
                    <AvatarFallback>
                      {project.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.author.name}</p>
                    <p className="text-xs text-gray-500">{project.author.studentId}</p>
                  </div>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.technologies.slice(0, 3).map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.technologies.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={project.githubUrl} target="_blank">
                        <Github className="w-3 h-3 mr-1" />
                        Code
                      </Link>
                    </Button>
                    {project.demoUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={project.demoUrl} target="_blank">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Demo
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setFilterType("all")
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
