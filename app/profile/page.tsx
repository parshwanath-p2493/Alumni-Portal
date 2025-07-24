// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useAuth } from "@/contexts/auth-context"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { api } from "@/services/api"
// import { toast } from "@/hooks/use-toast"
// import { User, Mail, Building, MapPin, Calendar, Github, Linkedin, Save, Upload } from "lucide-react"

// export default function ProfilePage() {
//   const { user, loginWithToken } = useAuth()
//   const [isLoading, setIsLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     company: "",
//     position: "",
//     location: "",
//     graduation_year: "",
//     student_id: "",
//     experience: "",
//     skills: "",
//     github_url: "",
//     linkedin_url: "",
//     bio: "",
//   })

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || "",
//         email: user.email || "",
//         company: user.company || "",
//         position: user.position || "",
//         location: user.location || "",
//         graduation_year: user.graduation_year?.toString() || "",
//         student_id: user.student_id || "",
//         experience: user.experience || "",
//         skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
//         github_url: user.github_url || "",
//         linkedin_url: user.linkedin_url || "",
//         bio: user.bio || "",
//       })
//     }
//   }, [user])

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       const updateData = {
//         ...formData,
//         graduation_year: formData.graduation_year ? Number.parseInt(formData.graduation_year) : undefined,
//         skills: formData.skills
//           ? formData.skills
//               .split(",")
//               .map((s) => s.trim())
//               .filter((s) => s)
//           : [],
//       }

//       const response = await api.users.updateProfile(updateData)

//       if (response.user) {
//         // Update the user in auth context
//         loginWithToken(response.token || "", response.user)
//         toast({
//           title: "Profile updated",
//           description: "Your profile has been successfully updated.",
//         })
//       }
//     } catch (error) {
//       console.error("Failed to update profile:", error)
//       toast({
//         title: "Error",
//         description: "Failed to update profile. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     try {
//       setIsLoading(true)
//       await api.upload.avatar(file)
//       toast({
//         title: "Avatar updated",
//         description: "Your profile picture has been updated.",
//       })
//       // Refresh user data
//       window.location.reload()
//     } catch (error) {
//       console.error("Failed to upload avatar:", error)
//       toast({
//         title: "Error",
//         description: "Failed to upload avatar. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
//         <p className="text-gray-600">Manage your account information and preferences</p>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* Profile Summary */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Profile Picture</CardTitle>
//             <CardDescription>Update your profile picture</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex flex-col items-center space-y-4">
//               <Avatar className="w-24 h-24">
//                 <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
//                 <AvatarFallback className="text-lg">
//                   {user.name
//                     .split(" ")
//                     .map((n) => n[0])
//                     .join("")}
//                 </AvatarFallback>
//               </Avatar>

//               <div className="text-center">
//                 <h3 className="font-semibold">{user.name}</h3>
//                 <p className="text-sm text-gray-600">{user.email}</p>
//                 <Badge className="mt-2">{user.role}</Badge>
//               </div>

//               <div className="w-full">
//                 <Label htmlFor="avatar-upload" className="cursor-pointer">
//                   <Button variant="outline" className="w-full" asChild>
//                     <span>
//                       <Upload className="w-4 h-4 mr-2" />
//                       Upload New Picture
//                     </span>
//                   </Button>
//                 </Label>
//                 <Input
//                   id="avatar-upload"
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleAvatarUpload}
//                 />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Profile Form */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Personal Information</CardTitle>
//             <CardDescription>Update your personal details</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name">Full Name</Label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) => handleInputChange("name", e.target.value)}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => handleInputChange("email", e.target.value)}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {(user.role === "student" || user.role === "alumni") && (
//                   <>
//                     <div className="space-y-2">
//                       <Label htmlFor="student_id">Student ID</Label>
//                       <Input
//                         id="student_id"
//                         value={formData.student_id}
//                         onChange={(e) => handleInputChange("student_id", e.target.value)}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="graduation_year">Graduation Year</Label>
//                       <div className="relative">
//                         <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <Input
//                           id="graduation_year"
//                           type="number"
//                           value={formData.graduation_year}
//                           onChange={(e) => handleInputChange("graduation_year", e.target.value)}
//                           className="pl-10"
//                           min="1990"
//                           max="2030"
//                         />
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {user.role === "alumni" && (
//                   <>
//                     <div className="space-y-2">
//                       <Label htmlFor="company">Company</Label>
//                       <div className="relative">
//                         <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <Input
//                           id="company"
//                           value={formData.company}
//                           onChange={(e) => handleInputChange("company", e.target.value)}
//                           className="pl-10"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="position">Position</Label>
//                       <Input
//                         id="position"
//                         value={formData.position}
//                         onChange={(e) => handleInputChange("position", e.target.value)}
//                       />
//                     </div>
//                   </>
//                 )}

//                 <div className="space-y-2">
//                   <Label htmlFor="location">Location</Label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="location"
//                       value={formData.location}
//                       onChange={(e) => handleInputChange("location", e.target.value)}
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="skills">Skills</Label>
//                   <Input
//                     id="skills"
//                     value={formData.skills}
//                     onChange={(e) => handleInputChange("skills", e.target.value)}
//                     placeholder="JavaScript, React, Node.js (comma separated)"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="github_url">GitHub URL</Label>
//                   <div className="relative">
//                     <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="github_url"
//                       type="url"
//                       value={formData.github_url}
//                       onChange={(e) => handleInputChange("github_url", e.target.value)}
//                       className="pl-10"
//                       placeholder="https://github.com/username"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="linkedin_url">LinkedIn URL</Label>
//                   <div className="relative">
//                     <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="linkedin_url"
//                       type="url"
//                       value={formData.linkedin_url}
//                       onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
//                       className="pl-10"
//                       placeholder="https://linkedin.com/in/username"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="bio">Bio</Label>
//                 <Textarea
//                   id="bio"
//                   value={formData.bio}
//                   onChange={(e) => handleInputChange("bio", e.target.value)}
//                   placeholder="Tell us about yourself..."
//                   rows={4}
//                 />
//               </div>

//               <Button type="submit" disabled={isLoading} className="w-full">
//                 {isLoading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4 mr-2" />
//                     Save Changes
//                   </>
//                 )}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { api } from "@/services/api"
import { toast } from "@/hooks/use-toast"
import { User, Mail, Building, MapPin, Calendar, Github, Linkedin, Save, Upload } from "lucide-react"

export default function ProfilePage() {
  const { user, loginWithToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    position: "",
    location: "",
    graduation_year: "",
    student_id: "",
    experience: "",
    cgpa: "",
    skills: "",
    github_url: "",
    linkedin_url: "",
    bio: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        company: user.company || "",
        position: user.position || "",
        location: user.location || "",
        graduation_year: user.graduation_year?.toString() || "",
        student_id: user.student_id || "",
        experience: user.experience || "",
        cgpa: user.cgpa?.toString() || "",
        skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
        github_url: user.github_url || "",
        linkedin_url: user.linkedin_url || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updateData = {
        name: formData.name,
        company: formData.company,
        position: formData.position,
        location: formData.location,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : undefined,
        student_id: formData.student_id,
        experience: formData.experience,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        skills: formData.skills
          ? formData.skills.split(",").map((s) => s.trim()).filter((s) => s)
          : [],
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        bio: formData.bio,
      }

      const response = await api.users.updateProfile(updateData)

      if (response.user) {
        loginWithToken(response.token || "", response.user)
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      await api.upload.avatar(file)
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      })
      window.location.reload()
    } catch (error) {
      console.error("Failed to upload avatar:", error)
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600">Keep your profile up to date to get the best experience.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name?.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>

            <div className="text-center">
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-2">{user.role}</Badge>
            </div>

            <div className="w-full">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Picture
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                name="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputBlock icon={<User />} label="Full Name" value={formData.name} required onChange={(val: string) => handleInputChange("name", val)} />
                <InputBlock icon={<Mail />} label="Email" type="email" value={formData.email} readOnly />
                {(user.role === "student" || user.role === "alumni") && (
                  <>
                    <InputBlock label="Student ID" value={formData.student_id} onChange={(val: string) => handleInputChange("student_id", val)} />
                    <InputBlock icon={<Calendar />} label="Graduation Year" type="number" value={formData.graduation_year} min={1990} max={2030} onChange={(val: string) => handleInputChange("graduation_year", val)} />
                  </>
                )}
                {user.role === "alumni" && (
                  <>
                    <InputBlock icon={<Building />} label="Company" value={formData.company} onChange={(val: string) => handleInputChange("company", val)} />
                    <InputBlock label="Position" value={formData.position} onChange={(val: string) => handleInputChange("position", val)} />
                  </>
                )}
                <InputBlock icon={<MapPin />} label="Location" value={formData.location} onChange={(val: string) => handleInputChange("location", val)} />
                <InputBlock label="Experience" value={formData.experience} onChange={(val: string) => handleInputChange("experience", val)} />
                <InputBlock label="CGPA" type="number" value={formData.cgpa} step="0.01" min="0" max="10" onChange={(val: string) => handleInputChange("cgpa", val)} />
                <InputBlock label="Skills" placeholder="JavaScript, React, Go" value={formData.skills} onChange={(val: string) => handleInputChange("skills", val)} />
                <InputBlock icon={<Github />} label="GitHub URL" type="url" value={formData.github_url} onChange={(val: string) => handleInputChange("github_url", val)} />
                <InputBlock icon={<Linkedin />} label="LinkedIn URL" type="url" value={formData.linkedin_url} onChange={(val: string) => handleInputChange("linkedin_url", val)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us a bit about you..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ✅ Reusable InputBlock component
type InputBlockProps = {
  icon?: React.ReactNode
  label: string
  value: string
  onChange?: (val: string) => void
  [key: string]: any
}

function InputBlock({ icon, label, value, onChange, ...props }: InputBlockProps) {
  const id = label.toLowerCase().replace(/\s/g, "_")
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-3 text-gray-400">{icon}</span>}
        <Input
          id={id}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={icon ? "pl-10" : ""}
          {...props}
        />
      </div>
    </div>
  )
}
