"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadFormProps {
  onUploadSuccess: () => void
  onCancel: () => void
}

export function GalleryUploadForm({ onUploadSuccess, onCancel }: UploadFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [eventId, setEventId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide a title and select an image",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("tags", tags.trim())
      if (eventId.trim()) {
        formData.append("event_id", eventId.trim())
      }

      const response = await fetch("/upload/gallery", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.message)
      }

      toast({
        title: "Upload successful",
        description: "Your image has been added to the gallery",
      })

      onUploadSuccess()
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Upload to Gallery
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="image">Image *</Label>
            <div className="mt-1">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="image" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                    <input id="image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter image description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div>
            <Label htmlFor="eventId">Event ID (optional)</Label>
            <Input
              id="eventId"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Enter event ID if this image is from an event"
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isUploading} className="flex-1">
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
