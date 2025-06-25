"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, Download, Heart, Eye, Calendar, ImageIcon } from "lucide-react"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"

interface GalleryItem {
  id: string
  title: string
  description?: string
  image_url: string
  tags?: string[]
  uploaded_by: {
    id: string
    name: string
    avatar_url?: string
  }
  event_id?: string
  likes_count: number
  views_count: number
  is_liked: boolean
  created_at: string
}

export default function GalleryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTag, setFilterTag] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await api.gallery.getAll()
        setItems(response.data || [])
      } catch (error) {
        console.error("Failed to fetch gallery items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGalleryItems()
  }, [])

  const canUpload = user?.role === "faculty" || user?.role === "admin"

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))

    const matchesTag = filterTag === "all" || (item.tags && item.tags.includes(filterTag))

    return matchesSearch && matchesTag
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
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

  const allTags = Array.from(new Set(items.flatMap((item) => item.tags || [])))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600">Browse photos and memories from ETE events and activities</p>
        </div>
        {canUpload && (
          <Button asChild>
            <Link href="/gallery/upload">
              <Plus className="w-4 h-4 mr-2" />
              Upload Photo
            </Link>
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
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

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-600 mb-4">
              {canUpload ? "Be the first to upload a photo to the gallery!" : "Check back later for new photos."}
            </p>
            {canUpload && (
              <Button asChild>
                <Link href="/gallery/upload">Upload First Photo</Link>
              </Button>
            )}
          </div>
        ) : (
          sortedItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    {item.views_count}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Heart className={`w-3 h-3 mr-1 ${item.is_liked ? "fill-current text-red-500" : ""}`} />
                    {item.likes_count}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
                {item.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src={item.uploaded_by.avatar_url || "/placeholder.svg"}
                        alt={item.uploaded_by.name}
                      />
                      <AvatarFallback className="text-xs">
                        {item.uploaded_by.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{item.uploaded_by.name}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Button size="sm" variant="ghost" asChild>
                    <a href={item.image_url} download target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
