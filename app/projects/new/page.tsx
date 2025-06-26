"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { api } from "@/services/api"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Plus, X, GraduationCap, Github, ExternalLink } from "lucide-react"

export default function NewProjectPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [techInput, setTechInput] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_type: "",
    technologies: [] as string[],
    github_url: "",
    demo_url: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }))
      setTechInput("")
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTechnology()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate required fields
    if (!formData.title || !formData.description || !formData.project_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (formData.technologies.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one technology.",
        variant: "destructive",
      })
      return
    }

    try {
      await api.projects.create(formData)

      toast({
        title: "Project posted successfully",
        description: "Your project is now visible to the community.",
      })

      router.push("/projects")
    } catch (error) {
      console.error("Failed to create project:", error)
      toast({
        title: "Error",
        description: "Failed to post project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user can post projects
  const canPostProjects = user?.role === "student"

  if (!canPostProjects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">Only students can post projects.</p>
          <Button onClick={() => router.push("/projects")}>Back to Projects</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post New Project</h1>
          <p className="text-gray-600">Share your project with the ETE community</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Tell us about your project</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., IoT-Based Smart Home Automation System"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project_type">Project Type *</Label>
                    <Select
                      value={formData.project_type}
                      onValueChange={(value) => handleInputChange("project_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mini">Mini Project</SelectItem>
                        <SelectItem value="major">Major Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your project, its purpose, and what it does..."
                      rows={6}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Technologies Used</h3>
                <div className="space-y-2">
                  <Label htmlFor="technologies">Add Technologies</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="technologies"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., React.js, Arduino, Python, etc."
                    />
                    <Button type="button" onClick={addTechnology} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeTechnology(tech)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github_url">GitHub Repository</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="github_url"
                        type="url"
                        value={formData.github_url}
                        onChange={(e) => handleInputChange("github_url", e.target.value)}
                        className="pl-10"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo_url">Live Demo URL</Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="demo_url"
                        type="url"
                        value={formData.demo_url}
                        onChange={(e) => handleInputChange("demo_url", e.target.value)}
                        className="pl-10"
                        placeholder="https://your-project-demo.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Project...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Post Project
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your project will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {formData.project_type && <Badge>{formData.project_type}</Badge>}
                </div>
                <h3 className="font-semibold text-lg">{formData.title || "Project Title"}</h3>
              </div>

              {formData.description && (
                <div>
                  <p className="text-sm text-gray-700 line-clamp-4">{formData.description}</p>
                </div>
              )}

              {formData.technologies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.technologies.slice(0, 4).map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {formData.technologies.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.technologies.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {formData.github_url && (
                  <Button size="sm" variant="outline" disabled>
                    <Github className="w-3 h-3 mr-1" />
                    Code
                  </Button>
                )}
                {formData.demo_url && (
                  <Button size="sm" variant="outline" disabled>
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Demo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
