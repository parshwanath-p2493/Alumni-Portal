// "use client"

// import type React from "react"
// import Cookies from "js-cookie"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { GraduationCap, Mail, Lock } from "lucide-react"
// import { useAuth } from "@/contexts/auth-context"

// const token = Cookies.get("access_token")
// fetch("/api/auth", {
//   headers: { Authorization: `Bearer ${token}` }
// })

// export default function LoginPage() {
//   const router = useRouter()
//   const { login } = useAuth()

//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")

//     if (!email.trim() || !password.trim()) {
//       setError("Please fill in both email and password fields.")
//       setIsLoading(false)
//       return
//     }

//     try {
//       const result = await login(email.trim(), password)

//       if (result.success) {
//         // Login successful, redirect to dashboard
//         router.push("/dashboard")
//       } else if (result.requiresOTP) {
//         // User needs to verify email first
//         sessionStorage.setItem("verificationEmail", email)
//         router.push("/auth/verify-otp")
//       }
//     } catch (err: any) {
//       setError(err.message || "Login failed. Please check your credentials.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
//               <GraduationCap className="w-10 h-10 text-white" />
//             </div>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
//           <p className="text-gray-600">Sign in to your ETE Alumni Portal account</p>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Sign In</CardTitle>
//             <CardDescription>Enter your email and password to access your account</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="your.email@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="pl-10"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="password"
//                     type="password"
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="pl-10"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
//                   Forgot password?
//                 </Link>
//               </div>

//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? "Signing in..." : "Sign In"}
//               </Button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-600">
//                 {"Don't have an account? "}
//                 <Link href="/auth/register" className="text-blue-600 hover:underline">
//                   Register here
//                 </Link>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Mail, Lock, Loader2, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AuthDebug } from "@/components/auth-debug"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, connectionStatus } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    // Only redirect if already authenticated and not currently loading
    if (isAuthenticated && !isLoading) {
      console.log("🔄 Already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password fields.")
      setIsLoading(false)
      return
    }

    try {
      console.log("🚀 Login form submitted")
      const result = await login(email.trim(), password)
      console.log("📋 Login result:", result)

      if (result.success) {
        console.log("✅ Login successful, showing success message")
        setSuccess(true)
        setError("")

        // Role-based redirect
        const userRole = result.user?.role
        let redirectPath = "/dashboard"

        if (userRole === "admin") {
          redirectPath = "/admin"
        } else {
          redirectPath = "/dashboard"
        }

        console.log(`🎯 Redirecting ${userRole} to ${redirectPath}...`)

        // Use window.location for immediate redirect
        setTimeout(() => {
          window.location.href = redirectPath
        }, 500)
      } else if (result.requiresOTP) {
        console.log("📧 OTP verification required")
        sessionStorage.setItem("verificationEmail", email)
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&type=registration`)
      } else {
        console.log("❌ Login failed:", result.message)
        setError(result.message || "Login failed. Please check your credentials.")
      }
    } catch (err: any) {
      console.error("💥 Login form error:", err)
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your ETE Alumni Portal account</p>
        </div>

        {/* Connection Status */}
        {connectionStatus === "disconnected" && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Cannot connect to server. Please check if your backend is running on localhost:8080
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
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
                    Login successful! Redirecting to dashboard...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading || connectionStatus === "disconnected" || success}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading || connectionStatus === "disconnected" || success}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || connectionStatus === "disconnected" || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Redirecting...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {"Don't have an account? "}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}</p>
            <p>Connection Status: {connectionStatus}</p>
            <p>Is Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
          </div>
        )}
        <AuthDebug />
      </div>
    </div>
  )
}
