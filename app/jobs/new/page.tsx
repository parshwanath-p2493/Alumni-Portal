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
import { ArrowLeft, Plus, X, Briefcase } from "lucide-react"
import api from "@/services/api"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

const JOB_TYPES = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
]

export default function NewJobPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [requirementInput, setRequirementInput] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "",
    experience_required: "",
    salary_range: "",
    description: "",
    requirements: [] as string[],
    expires_at: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addRequirement = () => {
    if (requirementInput.trim() && !formData.requirements.includes(requirementInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()],
      }))
      setRequirementInput("")
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

    // Validate according to backend validation rules
    const errors: string[] = []

    if (!formData.title || formData.title.length < 5 || formData.title.length > 200) {
      errors.push("Title must be between 5 and 200 characters")
    }

    if (!formData.company || formData.company.length < 2 || formData.company.length > 100) {
      errors.push("Company must be between 2 and 100 characters")
    }

    if (!formData.location || formData.location.length < 2 || formData.location.length > 100) {
      errors.push("Location must be between 2 and 100 characters")
    }

    if (!formData.job_type || !["full-time", "part-time", "internship", "contract"].includes(formData.job_type)) {
      errors.push("Please select a valid job type")
    }

    if (!formData.description || formData.description.length < 50 || formData.description.length > 3000) {
      errors.push("Description must be between 50 and 3000 characters")
    }

    if (formData.requirements.length === 0) {
      errors.push("At least one requirement is needed")
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(". "),
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        job_type: formData.job_type,
        experience_required: formData.experience_required,
        salary_range: formData.salary_range,
        description: formData.description,
        requirements: formData.requirements,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined,
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
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user can post jobs (only alumni)
  const canPostJobs = user?.role === "alumni"

  if (!canPostJobs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">Only alumni can post job opportunities.</p>
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
          <p className="text-gray-600">Share job opportunities with ETE students</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide comprehensive information about the position</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Software Engineer"
                      required
                    />
                    <p className="text-xs text-gray-500">5-200 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="e.g., Tech Corp"
                      required
                    />
                    <p className="text-xs text-gray-500">2-100 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g., Bangalore, India"
                      required
                    />
                    <p className="text-xs text-gray-500">2-100 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select value={formData.job_type} onValueChange={(value) => handleInputChange("job_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_required">Experience Required</Label>
                    <Input
                      id="experience_required"
                      value={formData.experience_required}
                      onChange={(e) => handleInputChange("experience_required", e.target.value)}
                      placeholder="e.g., 2-3 years"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={formData.salary_range}
                      onChange={(e) => handleInputChange("salary_range", e.target.value)}
                      placeholder="e.g., ₹8-12 LPA"
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
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>50-3000 characters required</span>
                    <span>{formData.description.length}/3000</span>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Add Requirements *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="requirements"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., Bachelor's in Computer Science"
                    />
                    <Button type="button" onClick={addRequirement} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {req}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeRequirement(req)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">At least one requirement is needed</p>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleInputChange("expires_at", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Leave empty for no expiry</p>
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
                <p className="text-sm text-gray-500">{formData.location || "Location"}</p>
              </div>

              {formData.job_type && (
                <Badge variant="outline">{JOB_TYPES.find((t) => t.value === formData.job_type)?.label}</Badge>
              )}

              {formData.salary_range && (
                <div>
                  <h4 className="font-medium">Salary</h4>
                  <p className="text-sm text-gray-700">{formData.salary_range}</p>
                </div>
              )}

              {formData.experience_required && (
                <div>
                  <h4 className="font-medium">Experience</h4>
                  <p className="text-sm text-gray-700">{formData.experience_required}</p>
                </div>
              )}

              {formData.description && (
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-gray-700 line-clamp-3">{formData.description}</p>
                </div>
              )}

              {formData.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {formData.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {req}
                      </li>
                    ))}
                    {formData.requirements.length > 3 && (
                      <li className="text-gray-500">+{formData.requirements.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
