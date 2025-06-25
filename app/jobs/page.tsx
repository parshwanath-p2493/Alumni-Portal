// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Search, Filter, Plus, MapPin, Building, DollarSign, Clock, Users, Heart } from "lucide-react"

// // Mock jobs data
// const mockJobs = [
//   {
//     id: 1,
//     title: "Software Engineer - Frontend",
//     company: "TechCorp Solutions",
//     location: "Bangalore, Karnataka",
//     type: "Full-time",
//     experience: "0-2 years",
//     salary: "₹6-10 LPA",
//     description:
//       "We are looking for a passionate Frontend Developer to join our team. You will work on cutting-edge web applications using React, TypeScript, and modern development tools.",
//     requirements: ["React.js", "TypeScript", "HTML/CSS", "Git"],
//     postedBy: {
//       name: "Rajesh Kumar",
//       avatar: "/placeholder.svg?height=40&width=40",
//       company: "TechCorp Solutions",
//       graduationYear: "2018",
//     },
//     postedAt: "2024-02-15",
//     applicants: 23,
//     isInterested: false,
//   },
//   {
//     id: 2,
//     title: "Electronics Design Engineer",
//     company: "InnovateTech Pvt Ltd",
//     location: "Hyderabad, Telangana",
//     type: "Full-time",
//     experience: "1-3 years",
//     salary: "₹8-12 LPA",
//     description:
//       "Join our hardware team to design and develop next-generation electronic products. Work with PCB design, embedded systems, and IoT devices.",
//     requirements: ["PCB Design", "Embedded C", "MATLAB", "Circuit Analysis"],
//     postedBy: {
//       name: "Priya Nair",
//       avatar: "/placeholder.svg?height=40&width=40",
//       company: "InnovateTech Pvt Ltd",
//       graduationYear: "2016",
//     },
//     postedAt: "2024-02-12",
//     applicants: 15,
//     isInterested: true,
//   },
//   {
//     id: 3,
//     title: "Network Engineer - 5G",
//     company: "Telecom Giants",
//     location: "Mumbai, Maharashtra",
//     type: "Full-time",
//     experience: "2-4 years",
//     salary: "₹10-15 LPA",
//     description:
//       "Exciting opportunity to work on 5G network infrastructure. Design, implement, and optimize 5G networks for enterprise and consumer applications.",
//     requirements: ["5G Technology", "Network Protocols", "RF Engineering", "Python"],
//     postedBy: {
//       name: "Amit Patel",
//       avatar: "/placeholder.svg?height=40&width=40",
//       company: "Telecom Giants",
//       graduationYear: "2015",
//     },
//     postedAt: "2024-02-10",
//     applicants: 31,
//     isInterested: false,
//   },
//   {
//     id: 4,
//     title: "Data Scientist - ML/AI",
//     company: "DataTech Analytics",
//     location: "Pune, Maharashtra",
//     type: "Full-time",
//     experience: "1-3 years",
//     salary: "₹9-14 LPA",
//     description:
//       "Work on machine learning projects involving signal processing, computer vision, and predictive analytics. Great opportunity for ECE graduates.",
//     requirements: ["Python", "Machine Learning", "TensorFlow", "Signal Processing"],
//     postedBy: {
//       name: "Sneha Gupta",
//       avatar: "/placeholder.svg?height=40&width=40",
//       company: "DataTech Analytics",
//       graduationYear: "2017",
//     },
//     postedAt: "2024-02-08",
//     applicants: 42,
//     isInterested: false,
//   },
//   {
//     id: 5,
//     title: "Embedded Systems Intern",
//     company: "RoboTech Innovations",
//     location: "Chennai, Tamil Nadu",
//     type: "Internship",
//     experience: "0-1 years",
//     salary: "₹15,000-25,000/month",
//     description:
//       "6-month internship program focusing on embedded systems development for robotics applications. Hands-on experience with microcontrollers and sensors.",
//     requirements: ["C/C++", "Microcontrollers", "Arduino/Raspberry Pi", "Basic Electronics"],
//     postedBy: {
//       name: "Karthik Reddy",
//       avatar: "/placeholder.svg?height=40&width=40",
//       company: "RoboTech Innovations",
//       graduationYear: "2019",
//     },
//     postedAt: "2024-02-14",
//     applicants: 67,
//     isInterested: true,
//   },
// ]

// export default function JobsPage() {
//   const [jobs, setJobs] = useState(mockJobs)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filterType, setFilterType] = useState("all")
//   const [filterLocation, setFilterLocation] = useState("all")
//   const [sortBy, setSortBy] = useState("recent")

//   const handleInterest = (jobId: number) => {
//     setJobs((prevJobs) =>
//       prevJobs.map((job) =>
//         job.id === jobId
//           ? {
//               ...job,
//               isInterested: !job.isInterested,
//               applicants: job.isInterested ? job.applicants - 1 : job.applicants + 1,
//             }
//           : job,
//       ),
//     )
//   }

//   const filteredJobs = jobs.filter((job) => {
//     const matchesSearch =
//       job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.requirements.some((req) => req.toLowerCase().includes(searchTerm.toLowerCase()))

//     const matchesType = filterType === "all" || job.type.toLowerCase() === filterType.toLowerCase()
//     const matchesLocation =
//       filterLocation === "all" || job.location.toLowerCase().includes(filterLocation.toLowerCase())

//     return matchesSearch && matchesType && matchesLocation
//   })

//   const sortedJobs = [...filteredJobs].sort((a, b) => {
//     switch (sortBy) {
//       case "popular":
//         return b.applicants - a.applicants
//       case "salary":
//         // Simple salary comparison based on the first number in salary string
//         const aSalary = Number.parseInt(a.salary.match(/\d+/)?.[0] || "0")
//         const bSalary = Number.parseInt(b.salary.match(/\d+/)?.[0] || "0")
//         return bSalary - aSalary
//       case "recent":
//       default:
//         return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
//     }
//   })

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
//               <p className="text-gray-600 mt-1">Find your next career opportunity posted by ETE alumni</p>
//             </div>
//             <Button asChild>
//               <Link href="/jobs/new">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Post Job
//               </Link>
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         {/* Filters and Search */}
//         <div className="flex flex-col lg:flex-row gap-4 mb-8">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search jobs, companies, or skills..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           <div className="flex gap-2">
//             <Select value={filterType} onValueChange={setFilterType}>
//               <SelectTrigger className="w-32">
//                 <Filter className="w-4 h-4 mr-2" />
//                 <SelectValue placeholder="Job Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Types</SelectItem>
//                 <SelectItem value="full-time">Full-time</SelectItem>
//                 <SelectItem value="internship">Internship</SelectItem>
//                 <SelectItem value="part-time">Part-time</SelectItem>
//               </SelectContent>
//             </Select>

//             <Select value={filterLocation} onValueChange={setFilterLocation}>
//               <SelectTrigger className="w-40">
//                 <MapPin className="w-4 h-4 mr-2" />
//                 <SelectValue placeholder="Location" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Locations</SelectItem>
//                 <SelectItem value="bangalore">Bangalore</SelectItem>
//                 <SelectItem value="hyderabad">Hyderabad</SelectItem>
//                 <SelectItem value="mumbai">Mumbai</SelectItem>
//                 <SelectItem value="pune">Pune</SelectItem>
//                 <SelectItem value="chennai">Chennai</SelectItem>
//               </SelectContent>
//             </Select>

//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-32">
//                 <SelectValue placeholder="Sort by" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="recent">Recent</SelectItem>
//                 <SelectItem value="popular">Popular</SelectItem>
//                 <SelectItem value="salary">Salary</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Jobs List */}
//         <div className="space-y-6">
//           {sortedJobs.map((job) => (
//             <Card key={job.id} className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Badge
//                         variant={
//                           job.type === "Full-time" ? "default" : job.type === "Internship" ? "secondary" : "outline"
//                         }
//                       >
//                         {job.type}
//                       </Badge>
//                       <div className="flex items-center text-sm text-gray-500">
//                         <Clock className="w-3 h-3 mr-1" />
//                         {new Date(job.postedAt).toLocaleDateString()}
//                       </div>
//                     </div>
//                     <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
//                     <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
//                       <div className="flex items-center">
//                         <Building className="w-4 h-4 mr-1" />
//                         {job.company}
//                       </div>
//                       <div className="flex items-center">
//                         <MapPin className="w-4 h-4 mr-1" />
//                         {job.location}
//                       </div>
//                       <div className="flex items-center">
//                         <DollarSign className="w-4 h-4 mr-1" />
//                         {job.salary}
//                       </div>
//                     </div>
//                     <CardDescription className="text-base">{job.description}</CardDescription>
//                   </div>
//                   <Button
//                     variant={job.isInterested ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handleInterest(job.id)}
//                     className="ml-4"
//                   >
//                     <Heart className={`w-4 h-4 mr-1 ${job.isInterested ? "fill-current" : ""}`} />
//                     {job.isInterested ? "Interested" : "Show Interest"}
//                   </Button>
//                 </div>
//               </CardHeader>

//               <CardContent>
//                 {/* Requirements */}
//                 <div className="mb-4">
//                   <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Skills:</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {job.requirements.map((req, index) => (
//                       <Badge key={index} variant="outline" className="text-xs">
//                         {req}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Posted by and Stats */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <Avatar className="w-8 h-8">
//                       <AvatarImage src={job.postedBy.avatar || "/placeholder.svg"} alt={job.postedBy.name} />
//                       <AvatarFallback>
//                         {job.postedBy.name
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="text-sm font-medium text-gray-900">{job.postedBy.name}</p>
//                       <p className="text-xs text-gray-500">
//                         {job.postedBy.company} • Class of {job.postedBy.graduationYear}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-4 text-sm text-gray-500">
//                     <div className="flex items-center">
//                       <Users className="w-4 h-4 mr-1" />
//                       {job.applicants} interested
//                     </div>
//                     <Button size="sm" variant="outline">
//                       View Details
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Empty State */}
//         {sortedJobs.length === 0 && (
//           <div className="text-center py-12">
//             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Search className="w-12 h-12 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
//             <p className="text-gray-600 mb-4">
//               Try adjusting your search terms or filters to find what you're looking for.
//             </p>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setSearchTerm("")
//                 setFilterType("all")
//                 setFilterLocation("all")
//               }}
//             >
//               Clear Filters
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, MapPin, Building, DollarSign, Clock, Users, Heart, Briefcase } from "lucide-react"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  experience: string
  salary: string
  description: string
  requirements: string[]
  postedBy: {
    name: string
    avatar: string
    company: string
    graduationYear: string
  }
  postedAt: string
  applicants: number
  isInterested: boolean
}

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterLocation, setFilterLocation] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.jobs.getAll()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleInterest = async (jobId: string) => {
    try {
      const job = jobs.find((j) => j.id === jobId)
      if (job?.isInterested) {
        await api.jobs.removeInterest(jobId)
      } else {
        await api.jobs.showInterest(jobId)
      }

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                isInterested: !job.isInterested,
                applicants: job.isInterested ? job.applicants - 1 : job.applicants + 1,
              }
            : job,
        ),
      )
    } catch (error) {
      console.error("Failed to update interest:", error)
    }
  }

  const canPostJobs = user?.role === "alumni" || user?.role === "faculty"

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
          <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
          <p className="text-gray-600">Find your next career opportunity posted by ETE alumni</p>
        </div>
        {canPostJobs && (
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="w-4 h-4 mr-2" />
              Post Job
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
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {canPostJobs
                ? "Be the first to post a job opportunity for students!"
                : "Check back later for new job opportunities."}
            </p>
            {canPostJobs && (
              <Button asChild>
                <Link href="/jobs/new">Post First Job</Link>
              </Button>
            )}
          </div>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={job.type === "Full-time" ? "default" : "secondary"}>{job.type}</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(job.postedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {job.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary}
                      </div>
                    </div>
                    <CardDescription className="text-base">{job.description}</CardDescription>
                  </div>
                  {user?.role === "student" && (
                    <Button
                      variant={job.isInterested ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInterest(job.id)}
                      className="ml-4"
                    >
                      <Heart className={`w-4 h-4 mr-1 ${job.isInterested ? "fill-current" : ""}`} />
                      {job.isInterested ? "Interested" : "Show Interest"}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={job.postedBy.avatar || "/placeholder.svg"} alt={job.postedBy.name} />
                      <AvatarFallback>
                        {job.postedBy.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.postedBy.name}</p>
                      <p className="text-xs text-gray-500">
                        {job.postedBy.company} • Class of {job.postedBy.graduationYear}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {job.applicants} interested
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
