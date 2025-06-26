// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Search, Filter, Plus, Calendar, MapPin, Clock, Users, CheckCircle } from "lucide-react"
// import { api } from "@/services/api"
// import { useAuth } from "@/contexts/auth-context"

// interface Event {
//   id: string
//   title: string
//   description: string
//   event_type: string
//   start_date: string
//   end_date: string
//   location: string
//   max_attendees?: number
//   current_attendees: number
//   is_rsvp_required: boolean
//   user_rsvp_status?: string
//   organizer: {
//     id: string
//     name: string
//     avatar_url?: string
//   }
//   created_at: string
// }

// export default function EventsPage() {
//   const { user } = useAuth()
//   const [events, setEvents] = useState<Event[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filterType, setFilterType] = useState("all")
//   const [sortBy, setSortBy] = useState("upcoming")

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await api.events.getAll()
//         const eventsArray = Array.isArray(response.data) ? response.data : []
//         setEvents(eventsArray)
//       } catch (error) {
//         console.error("Failed to fetch events:", error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchEvents()
//   }, [])

//   const handleRSVP = async (eventId: string, status: string) => {
//     try {
//       await api.events.rsvp(eventId, status)
//       setEvents((prevEvents) =>
//         prevEvents.map((event) =>
//           event.id === eventId
//             ? {
//                 ...event,
//                 user_rsvp_status: status,
//                 current_attendees: status === "attending" ? event.current_attendees + 1 : event.current_attendees - 1,
//               }
//             : event,
//         ),
//       )
//     } catch (error) {
//       console.error("Failed to RSVP:", error)
//     }
//   }

//   const canCreateEvents = user?.role === "admin" || user?.role === "faculty"

//   const filteredEvents = events.filter((event) => {
//     const matchesSearch =
//       event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.location.toLowerCase().includes(searchTerm.toLowerCase())

//     const matchesType = filterType === "all" || event.event_type === filterType

//     return matchesSearch && matchesType
//   })

//   const sortedEvents = [...filteredEvents].sort((a, b) => {
//     switch (sortBy) {
//       case "popular":
//         return b.current_attendees - a.current_attendees
//       case "recent":
//         return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       case "upcoming":
//       default:
//         return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
//     }
//   })

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })
//   }

//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   const isEventPast = (endDate: string) => {
//     return new Date(endDate) < new Date()
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Events</h1>
//           <p className="text-gray-600">Discover and attend ETE department events</p>
//         </div>
//         {canCreateEvents && (
//           <Button asChild>
//             <Link href="/events/new">
//               <Plus className="w-4 h-4 mr-2" />
//               Create Event
//             </Link>
//           </Button>
//         )}
//       </div>

//       {/* Filters and Search */}
//       <div className="flex flex-col lg:flex-row gap-4">
//         <div className="flex-1">
//           <div className="relative">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search events..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <Select value={filterType} onValueChange={setFilterType}>
//             <SelectTrigger className="w-40">
//               <Filter className="w-4 h-4 mr-2" />
//               <SelectValue placeholder="Event Type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               <SelectItem value="workshop">Workshop</SelectItem>
//               <SelectItem value="seminar">Seminar</SelectItem>
//               <SelectItem value="conference">Conference</SelectItem>
//               <SelectItem value="networking">Networking</SelectItem>
//               <SelectItem value="social">Social</SelectItem>
//             </SelectContent>
//           </Select>

//           <Select value={sortBy} onValueChange={setSortBy}>
//             <SelectTrigger className="w-32">
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="upcoming">Upcoming</SelectItem>
//               <SelectItem value="popular">Popular</SelectItem>
//               <SelectItem value="recent">Recent</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Events List */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {sortedEvents.length === 0 ? (
//           <div className="col-span-full text-center py-12">
//             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Calendar className="w-12 h-12 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
//             <p className="text-gray-600 mb-4">
//               {canCreateEvents
//                 ? "Be the first to create an event for the community!"
//                 : "Check back later for upcoming events."}
//             </p>
//             {canCreateEvents && (
//               <Button asChild>
//                 <Link href="/events/new">Create First Event</Link>
//               </Button>
//             )}
//           </div>
//         ) : (
//           sortedEvents.map((event) => (
//             <Card key={event.id} className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Badge variant={isEventPast(event.end_date) ? "secondary" : "default"}>{event.event_type}</Badge>
//                       {event.user_rsvp_status === "attending" && (
//                         <Badge variant="outline" className="text-green-600">
//                           <CheckCircle className="w-3 h-3 mr-1" />
//                           Attending
//                         </Badge>
//                       )}
//                     </div>
//                     <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
//                     <CardDescription className="line-clamp-2">{event.description}</CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>

//               <CardContent>
//                 {/* Event Details */}
//                 <div className="space-y-3 mb-4">
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Calendar className="w-4 h-4 mr-2" />
//                     {formatDate(event.start_date)}
//                     {event.start_date !== event.end_date && ` - ${formatDate(event.end_date)}`}
//                   </div>

//                   <div className="flex items-center text-sm text-gray-600">
//                     <Clock className="w-4 h-4 mr-2" />
//                     {formatTime(event.start_date)} - {formatTime(event.end_date)}
//                   </div>

//                   <div className="flex items-center text-sm text-gray-600">
//                     <MapPin className="w-4 h-4 mr-2" />
//                     {event.location}
//                   </div>

//                   <div className="flex items-center text-sm text-gray-600">
//                     <Users className="w-4 h-4 mr-2" />
//                     {event.current_attendees} attending
//                     {event.max_attendees && ` / ${event.max_attendees} max`}
//                   </div>
//                 </div>

//                 {/* Organizer */}
//                 <div className="flex items-center space-x-3 mb-4">
//                   <Avatar className="w-8 h-8">
//                     <AvatarImage src={event.organizer.avatar_url || "/placeholder.svg"} alt={event.organizer.name} />
//                     <AvatarFallback>
//                       {event.organizer.name
//                         .split(" ")
//                         .map((n) => n[0])
//                         .join("")}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">{event.organizer.name}</p>
//                     <p className="text-xs text-gray-500">Organizer</p>
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex items-center justify-between">
//                   <Button size="sm" variant="outline" asChild>
//                     <Link href={`/events/${event.id}`}>View Details</Link>
//                   </Button>

//                   {event.is_rsvp_required && !isEventPast(event.end_date) && (
//                     <div className="flex space-x-2">
//                       {event.user_rsvp_status === "attending" ? (
//                         <Button size="sm" variant="outline" onClick={() => handleRSVP(event.id, "not_attending")}>
//                           Cancel RSVP
//                         </Button>
//                       ) : (
//                         <Button size="sm" onClick={() => handleRSVP(event.id, "attending")}>
//                           RSVP
//                         </Button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users, Clock, Search, Plus } from "lucide-react"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  location?: string
  event_type?: string
  max_attendees?: number
  current_attendees: number
  created_by: string
  created_by_user?: {
    id: string
    name: string
    avatar_url?: string
  }
  is_active: boolean
  created_at: string
}

export default function EventsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params: any = {}
        if (timeFilter === "upcoming") {
          params.upcoming = "true"
        }
        if (typeFilter !== "all") {
          params.type = typeFilter
        }

        const response = await api.events.getAll(params)
        setEvents(response.data.events || [])
      } catch (error) {
        console.error("Failed to fetch events:", error)
        toast({
          title: "Error",
          description: "Failed to load events.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [typeFilter, timeFilter])

  const handleRSVP = async (eventId: string, status: "attending" | "not_attending" | "maybe") => {
    try {
      await api.events.rsvp(eventId, status)
      toast({
        title: "RSVP Updated",
        description: `You have marked yourself as ${status.replace("_", " ")} for this event.`,
      })

      // Refresh events to get updated attendee count
      const response = await api.events.getAll()
      setEvents(response.data.events || [])
    } catch (error) {
      console.error("Failed to update RSVP:", error)
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Discover and participate in ETE department events</p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={() => router.push("/events/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upcoming">Upcoming Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="seminar">Seminar</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms." : "No events are currently scheduled."}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className={`${isEventPast(event.event_date) ? "opacity-75" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {event.event_type && (
                      <Badge variant="secondary" className="mt-1">
                        {event.event_type}
                      </Badge>
                    )}
                  </div>
                  {isEventPast(event.event_date) && (
                    <Badge variant="outline" className="text-gray-500">
                      Past
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatTime(event.event_date)}
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {event.current_attendees} attending
                    {event.max_attendees && ` (${event.max_attendees} max)`}
                  </div>
                </div>

                {event.created_by_user && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={event.created_by_user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{event.created_by_user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">by {event.created_by_user.name}</span>
                  </div>
                )}

                {!isEventPast(event.event_date) && (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleRSVP(event.id, "attending")} className="flex-1">
                      Attending
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRSVP(event.id, "maybe")}
                      className="flex-1"
                    >
                      Maybe
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRSVP(event.id, "not_attending")}
                      className="flex-1"
                    >
                      Can't Go
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
