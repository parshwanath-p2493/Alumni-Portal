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
import { ArrowLeft, Plus, X, Briefcase, Building, MapPin, DollarSign, Clock } from "lucide-react"

export default function NewJobPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "",
    experience_level: "",
    salary_range: "",
    description: "",
    requirements: [] as string[],
    application_url: "",
    application_email: "",
    deadline: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addRequirement = () => {
    if (skillInput.trim() && !formData.requirements.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, skillInput.trim()],
      }))
      setSkillInput("")
    }
  }

  const removeRequirement = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req !== requirement),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addRequirement()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const jobData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      }

      await api.jobs.create(jobData)

      toast({
        title: "Job posted successfully",
        description: "Your job posting is now live and visible to students.",
      })

      router.push("/jobs")
    } catch (error) {
      console.error("Failed to create job:", error)
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user can post jobs
  const canPostJobs = user?.role === "alumni" || user?.role === "faculty"

  if (!canPostJobs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">Only alumni and faculty members can post job opportunities.</p>
          <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/jobs")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
          <p className="text-gray-600">Create a job opportunity for ETE students</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Fill in the information about the job opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="pl-10"
                        placeholder="e.g., Software Engineer"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="pl-10"
                        placeholder="e.g., TechCorp Solutions"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="pl-10"
                        placeholder="e.g., Bangalore, Karnataka"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="salary_range"
                        value={formData.salary_range}
                        onChange={(e) => handleInputChange("salary_range", e.target.value)}
                        className="pl-10"
                        placeholder="e.g., ₹6-10 LPA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select value={formData.job_type} onValueChange={(value) => handleInputChange("job_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_level">Experience Level *</Label>
                    <Select
                      value={formData.experience_level}
                      onValueChange={(value) => handleInputChange("experience_level", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
                        <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange("deadline", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Description</h3>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows={6}
                    required
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements & Skills</h3>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Add Requirements</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="requirements"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., React.js, Python, etc."
                    />
                    <Button type="button" onClick={addRequirement} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.requirements.map((requirement, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {requirement}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeRequirement(requirement)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="application_email">Application Email</Label>
                    <Input
                      id="application_email"
                      type="email"
                      value={formData.application_email}
                      onChange={(e) => handleInputChange("application_email", e.target.value)}
                      placeholder="hr@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="application_url">Application URL</Label>
                    <Input
                      id="application_url"
                      type="url"
                      value={formData.application_url}
                      onChange={(e) => handleInputChange("application_url", e.target.value)}
                      placeholder="https://company.com/careers/apply"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Job...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post Job
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
            <CardDescription>How your job posting will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{formData.title || "Job Title"}</h3>
                <p className="text-gray-600">{formData.company || "Company Name"}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.job_type && <Badge>{formData.job_type}</Badge>}
                {formData.experience_level && <Badge variant="outline">{formData.experience_level}</Badge>}
              </div>

              <div className="space-y-2 text-sm">
                {formData.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    {formData.location}
                  </div>
                )}
                {formData.salary_range && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                    {formData.salary_range}
                  </div>
                )}
                {formData.deadline && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    Apply by {new Date(formData.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              {formData.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-700 line-clamp-4">{formData.description}</p>
                </div>
              )}

              {formData.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.requirements.slice(0, 3).map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {formData.requirements.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.requirements.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
