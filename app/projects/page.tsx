"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, ExternalLink, Github, Calendar } from "lucide-react"
import api from "@/services/api"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await api.projects.getAll({ limit: 50, search: searchTerm })
        setProjects(response.data?.projects || [])
      } catch (err) {
        console.error("Failed to load projects", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [searchTerm])

  const filteredProjects = projects.filter((project) => {
    const matchesFilter =
      filterType === "all" || project.project_type.toLowerCase().includes(filterType.toLowerCase())
    return matchesFilter
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes_count - a.likes_count
      case "views":
        return b.views_count - a.views_count
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
        {loading ? (
          <p className="text-center text-gray-500">Loading projects...</p>
        ) : sortedProjects.length === 0 ? (
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
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.map((project) => (
              <Card key={project._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant={project.project_type === "Major Project" ? "default" : "secondary"}>
                      {project.project_type}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <span>{project.views_count} views</span>
                      <span>•</span>
                      <span>{project.likes_count} likes</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{project.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Author Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={project.author?.avatar || "/placeholder.svg"} alt={project.author?.name} />
                      <AvatarFallback>
                        {project.author?.name?.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.author?.name}</p>
                      <p className="text-xs text-gray-500">{project.author?.student_id}</p>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies?.slice(0, 3).map((tech: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={project.github_url} target="_blank">
                          <Github className="w-3 h-3 mr-1" />
                          Code
                        </Link>
                      </Button>
                      {project.demo_url && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={project.demo_url} target="_blank">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Demo
                          </Link>
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
