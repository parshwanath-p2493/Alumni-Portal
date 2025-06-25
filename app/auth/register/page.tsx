// "use client"

// import type React from "react"
// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { GraduationCap, User, Mail, Lock, Calendar, Building, Loader2 } from "lucide-react"
// import { useAuth } from "@/contexts/auth-context"

// export default function RegisterPage() {
//   const router = useRouter()
//   const { register, connectionStatus } = useAuth()

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "",
//     student_id: "",
//     graduation_year: "",
//     company: "",
//     experience: "",
//     github: "",
//     linkedin: "",
//     skills: "",
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")

//     // Validation
//     if (!formData.name.trim()) {
//       setError("Please enter your full name.")
//       setIsLoading(false)
//       return
//     }

//     if (!formData.email.trim()) {
//       setError("Please enter your email address.")
//       setIsLoading(false)
//       return
//     }

//     if (!formData.password || !formData.confirmPassword) {
//       setError("Please fill in both password fields.")
//       setIsLoading(false)
//       return
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match.")
//       setIsLoading(false)
//       return
//     }

//     if (formData.password.length < 6) {
//       setError("Password must be at least 6 characters long.")
//       setIsLoading(false)
//       return
//     }

//     if (!formData.role) {
//       setError("Please select your role.")
//       setIsLoading(false)
//       return
//     }

//     if (!formData.student_id.trim()) {
//       setError("Please enter your student/alumni ID.")
//       setIsLoading(false)
//       return
//     }

//     if (!formData.graduation_year) {
//       setError("Please enter your graduation year.")
//       setIsLoading(false)
//       return
//     }

//     // Construct payload matching backend expected format
//     const payload = {
//       name: formData.name.trim(),
//       email: formData.email.trim().toLowerCase(),
//       password: formData.password,
//       role: formData.role,
//       student_id: formData.student_id.trim(),
//       graduation_year: Number.parseInt(formData.graduation_year),
//       company: formData.company.trim() || undefined,
//       experience: formData.experience ? Number.parseInt(formData.experience) : undefined,
//       github: formData.github.trim() || undefined,
//       linkedin: formData.linkedin.trim() || undefined,
//       skills: formData.skills.trim() ? formData.skills.split(",").map((s) => s.trim()) : undefined,
//     }

//     try {
//       const result = await register(payload)

//       if (result.success) {
//         // Store email for OTP verification
//         localStorage.setItem("verificationEmail", formData.email.trim())
//         router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email.trim())}&type=registration`)
//       } else {
//         setError(result.message || "Registration failed. Please try again.")
//       }
//     } catch (err: any) {
//       console.error("Registration error:", err)
//       setError(err.message || "Registration failed. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
//               <GraduationCap className="w-10 h-10 text-white" />
//             </div>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Join ETE Alumni Portal</h1>
//           <p className="text-gray-600">Create your account to connect with the ETE community</p>
//         </div>

//         {/* Connection Status */}
//         {connectionStatus === "disconnected" && (
//           <Alert variant="destructive" className="mb-4">
//             <AlertDescription>
//               Cannot connect to server. Please check if your backend is running on localhost:8080
//             </AlertDescription>
//           </Alert>
//         )}

//         <Card>
//           <CardHeader>
//             <CardTitle>Create Account</CardTitle>
//             <CardDescription>Fill in your details to register for the portal</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               {/* Basic Information */}
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold">Basic Information</h3>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="name">Full Name *</Label>
//                     <div className="relative">
//                       <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <Input
//                         id="name"
//                         placeholder="John Doe"
//                         value={formData.name}
//                         onChange={(e) => handleInputChange("name", e.target.value)}
//                         className="pl-10"
//                         required
//                         disabled={isLoading || connectionStatus === "disconnected"}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email *</Label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <Input
//                         id="email"
//                         type="email"
//                         placeholder="john@example.com"
//                         value={formData.email}
//                         onChange={(e) => handleInputChange("email", e.target.value)}
//                         className="pl-10"
//                         required
//                         disabled={isLoading || connectionStatus === "disconnected"}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="password">Password *</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <Input
//                         id="password"
//                         type="password"
//                         placeholder="Create a strong password"
//                         value={formData.password}
//                         onChange={(e) => handleInputChange("password", e.target.value)}
//                         className="pl-10"
//                         required
//                         minLength={6}
//                         disabled={isLoading || connectionStatus === "disconnected"}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="confirmPassword">Confirm Password *</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <Input
//                         id="confirmPassword"
//                         type="password"
//                         placeholder="Confirm your password"
//                         value={formData.confirmPassword}
//                         onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
//                         className="pl-10"
//                         required
//                         minLength={6}
//                         disabled={isLoading || connectionStatus === "disconnected"}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Role and Academic Information */}
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold">Academic Information</h3>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="role">Role *</Label>
//                     <Select
//                       value={formData.role}
//                       onValueChange={(value) => handleInputChange("role", value)}
//                       disabled={isLoading || connectionStatus === "disconnected"}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select your role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="student">Student</SelectItem>
//                         <SelectItem value="alumni">Alumni</SelectItem>
//                         <SelectItem value="faculty">Faculty</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="student_id">Student/Alumni ID *</Label>
//                     <Input
//                       id="student_id"
//                       placeholder="e.g., 1DA21ET001"
//                       value={formData.student_id}
//                       onChange={(e) => handleInputChange("student_id", e.target.value)}
//                       required
//                       disabled={isLoading || connectionStatus === "disconnected"}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="graduation_year">Graduation Year *</Label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="graduation_year"
//                       type="number"
//                       placeholder="2024"
//                       min="1990"
//                       max="2030"
//                       value={formData.graduation_year}
//                       onChange={(e) => handleInputChange("graduation_year", e.target.value)}
//                       className="pl-10"
//                       required
//                       disabled={isLoading || connectionStatus === "disconnected"}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Professional Information (for Alumni) */}
//               {formData.role === "alumni" && (
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold">Professional Information</h3>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="company">Current Company</Label>
//                       <div className="relative">
//                         <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <Input
//                           id="company"
//                           placeholder="Company Name"
//                           value={formData.company}
//                           onChange={(e) => handleInputChange("company", e.target.value)}
//                           className="pl-10"
//                           disabled={isLoading || connectionStatus === "disconnected"}
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="experience">Years of Experience</Label>
//                       <Input
//                         id="experience"
//                         type="number"
//                         placeholder="5"
//                         min="0"
//                         value={formData.experience}
//                         onChange={(e) => handleInputChange("experience", e.target.value)}
//                         disabled={isLoading || connectionStatus === "disconnected"}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Social Links */}
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold">Social Links & Skills</h3>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="github">GitHub Profile</Label>
//                     <Input
//                       id="github"
//                       placeholder="https://github.com/username"
//                       value={formData.github}
//                       onChange={(e) => handleInputChange("github", e.target.value)}
//                       disabled={isLoading || connectionStatus === "disconnected"}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="linkedin">LinkedIn Profile</Label>
//                     <Input
//                       id="linkedin"
//                       placeholder="https://linkedin.com/in/username"
//                       value={formData.linkedin}
//                       onChange={(e) => handleInputChange("linkedin", e.target.value)}
//                       disabled={isLoading || connectionStatus === "disconnected"}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="skills">Skills (comma-separated)</Label>
//                   <Input
//                     id="skills"
//                     placeholder="JavaScript, React, Node.js, Python"
//                     value={formData.skills}
//                     onChange={(e) => handleInputChange("skills", e.target.value)}
//                     disabled={isLoading || connectionStatus === "disconnected"}
//                   />
//                 </div>
//               </div>

//               <Button type="submit" className="w-full" disabled={isLoading || connectionStatus === "disconnected"}>
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating Account...
//                   </>
//                 ) : (
//                   "Create Account"
//                 )}
//               </Button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-600">
//                 Already have an account?{" "}
//                 <Link href="/auth/login" className="text-blue-600 hover:underline">
//                   Sign in here
//                 </Link>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
// // 

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, User, Mail, Lock, Loader2, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    student_id: "",
    graduation_year: "",
    company: "",
    position: "",
    location: "",
    experience: "",
    skills: "",
    github_url: "",
    linkedin_url: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("Please fill in all required fields.")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.")
      setIsLoading(false)
      return
    }

    try {
      // Prepare registration data
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        student_id: formData.student_id || undefined,
        graduation_year: formData.graduation_year ? Number.parseInt(formData.graduation_year) : undefined,
        company: formData.company.trim() || undefined,
        position: formData.position.trim() || undefined,
        location: formData.location.trim() || undefined,
        experience: formData.experience.trim() || undefined,
        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
        github_url: formData.github_url.trim() || undefined,
        linkedin_url: formData.linkedin_url.trim() || undefined,
      }

      console.log("🚀 Registration form submitted")
      const result = await register(registrationData)
      console.log("📋 Registration result:", result)

      if (result.success) {
        console.log("✅ Registration successful")
        setSuccess(true)
        setError("")

        // Store email for OTP verification
        localStorage.setItem("verificationEmail", formData.email)

        // Redirect to OTP verification
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&type=registration`)
        }, 1500)
      } else {
        console.log("❌ Registration failed:", result.message)
        setError(result.message || "Registration failed. Please try again.")
      }
    } catch (err: any) {
      console.error("💥 Registration form error:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join ETE Alumni Portal</h1>
          <p className="text-gray-600">Create your account to connect with the alumni network</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Fill in your details to register</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Registration successful! Redirecting to email verification...
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading || success}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading || success}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                      disabled={isLoading || success}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                      disabled={isLoading || success}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                    disabled={isLoading || success}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional fields based on role */}
                {(formData.role === "student" || formData.role === "alumni") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        type="text"
                        placeholder="Your student ID"
                        value={formData.student_id}
                        onChange={(e) => handleInputChange("student_id", e.target.value)}
                        disabled={isLoading || success}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduation_year">Graduation Year</Label>
                      <Input
                        id="graduation_year"
                        type="number"
                        placeholder="2024"
                        value={formData.graduation_year}
                        onChange={(e) => handleInputChange("graduation_year", e.target.value)}
                        min="1990"
                        max="2030"
                        disabled={isLoading || success}
                      />
                    </div>
                  </>
                )}

                {formData.role === "alumni" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Current company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        disabled={isLoading || success}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        type="text"
                        placeholder="Job title"
                        value={formData.position}
                        onChange={(e) => handleInputChange("position", e.target.value)}
                        disabled={isLoading || success}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    disabled={isLoading || success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    type="text"
                    placeholder="JavaScript, React, Node.js (comma separated)"
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                    disabled={isLoading || success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.github_url}
                    onChange={(e) => handleInputChange("github_url", e.target.value)}
                    disabled={isLoading || success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || success}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : success ? (
                  "Redirecting..."
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
