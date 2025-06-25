// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Mail } from "lucide-react"
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/auth-context"

// export default function VerifyOTPPage() {
//   const [otp, setOtp] = useState("")
//   const [email, setEmail] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [isResending, setIsResending] = useState(false)
//   const router = useRouter();
//   const { loginWithToken } = useAuth()

//   useEffect(() => {
//     // Retrieve email from localStorage
//     const storedEmail = localStorage.getItem("verificationEmail")
//     if (!storedEmail) {
//       setError("Email not found. Please register again.")
//       return
//     }
//     setEmail(storedEmail)
//   }, [])


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     if (!email) {
//       setError("Email not found. Please register again.");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const name = localStorage.getItem("registrationName")
//       const password = localStorage.getItem("registrationPassword")
//       const role = localStorage.getItem("registrationRole")

//       if (!name || !password || !role) {
//         throw new Error("Missing registration details. Please register again.")
//       }
//       const response = await fetch("http://localhost:8080/auth/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ otp, email }),
//       });

//       const data = await response.json();

//       if (!response.ok) throw new Error(data.message || "OTP verification failed");

//       // Accept token and user from backend
//       const token = data.token || data.access_token || data.data?.access_token
//       const user = data.user || data.data?.user
//       if (token && user) {
//         loginWithToken(token, user)
//         localStorage.removeItem("verificationEmail")
//         router.push("/dashboard")
//       } else {
//         throw new Error("No token or user received from server.")
//       }
//     } catch (err: any) {
//       setError(err.message || "Invalid OTP. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault()
//   //   setIsLoading(true)
//   //   setError("")

//   //   if (!email) {
//   //     setError("Email not found. Please register again.")
//   //     setIsLoading(false)
//   //     return
//   //   }

//   //   try {
//   //     const response = await fetch("http://localhost:8080/auth/verify-otp", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({ 
//   //         otp,
//   //         email 
//   //       }),
//   //     })

//   //     const data = await response.json()

//   //     if (!response.ok) {
//   //       throw new Error(data.message || "OTP verification failed")
//   //     }

//   //     // If backend returns a token:
//   //     if (data.data?.access_token) {
//   //       localStorage.setItem("token", data.data.access_token)
//   //       // Clear the verification email from localStorage
//   //       localStorage.removeItem("verificationEmail")
//   //     }

//   //     // Redirect to dashboard
//   //     window.location.href = "/dashboard"
//   //   } catch (err: any) {
//   //     setError(err.message || "Invalid OTP. Please try again.")
//   //   } finally {
//   //     setIsLoading(false)
//   //   }
//   // }

//   const handleResendOTP = async () => {
//     setIsResending(true)
//     setError("")

//     if (!email) {
//       setError("Email not found. Please register again.")
//       setIsResending(false)
//       return
//     }

//     try {
//       const response = await fetch("http://localhost:8080/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email,
//           resend: true
//         }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to resend OTP")
//       }

//       console.log("OTP resent successfully")
//     } catch (err: any) {
//       setError(err.message || "Failed to resend OTP. Please try again.")
//     } finally {
//       setIsResending(false)
//     }
//   }

//   if (!email) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
//         <Card>
//           <CardContent className="pt-6">
//             <Alert variant="destructive">
//               <AlertDescription>Email not found. Please register again.</AlertDescription>
//             </Alert>
//             <div className="mt-4 text-center">
//               <Link href="/auth/register" className="text-sm text-blue-600 hover:underline">
//                 Back to Registration
//               </Link>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
//               <Mail className="w-10 h-10 text-white" />
//             </div>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
//           <p className="text-gray-600">We've sent a verification code to {email}</p>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Enter Verification Code</CardTitle>
//             <CardDescription>Please enter the 6-digit code sent to your email address</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}
//               <div className="space-y-2">
//                 <Label htmlFor="otp">Verification Code</Label>
//                 <Input
//                   id="otp"
//                   type="text"
//                   placeholder="Enter 6-digit code"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   maxLength={6}
//                   className="text-center text-2xl tracking-widest"
//                   required
//                 />
//               </div>

//               <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
//                 {isLoading ? "Verifying..." : "Verify Email"}
//               </Button>
//             </form>

//             <div className="mt-6 text-center space-y-2">
//               <p className="text-sm text-gray-600">{"Didn't receive the code?"}</p>
//               <Button variant="link" onClick={handleResendOTP} disabled={isResending} className="p-0 h-auto">
//                 {isResending ? "Resending..." : "Resend Code"}
//               </Button>
//             </div>

//             <div className="mt-4 text-center">
//               <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
//                 Back to Login
//               </Link>
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
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/services/api"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyOTP } = useAuth()

  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [verificationType, setVerificationType] = useState<"registration" | "password-reset">("registration")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const typeParam = searchParams.get("type") as "registration" | "password-reset"

    if (emailParam) {
      setEmail(emailParam)
    } else {
      // Fallback to localStorage for registration flow
      const storedEmail = localStorage.getItem("verificationEmail")
      if (storedEmail) {
        setEmail(storedEmail)
      }
    }

    if (typeParam) {
      setVerificationType(typeParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!otp.trim()) {
      setError("Please enter the verification code.")
      setIsLoading(false)
      return
    }

    if (otp.length !== 6) {
      setError("Verification code must be 6 digits.")
      setIsLoading(false)
      return
    }

    if (!email) {
      setError("Email not found. Please go back and try again.")
      setIsLoading(false)
      return
    }

    try {
      if (verificationType === "registration") {
        // Registration OTP verification
        const result = await verifyOTP(email, otp.trim())

        if (result.success) {
          localStorage.removeItem("verificationEmail")
          router.push("/dashboard")
        } else {
          setError(result.message || "Invalid verification code. Please try again.")
        }
      } else {
        // Password reset OTP verification - just verify the OTP is correct
        const response = await api.auth.verifyOTP(email, otp.trim())

        // If successful (no error thrown), redirect to reset password page
        if (response.error === false) {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
        } else {
          setError(response.message || "Invalid verification code. Please try again.")
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setResendMessage("")
    setError("")

    try {
      if (verificationType === "password-reset") {
        const response = await api.auth.forgotPassword(email)
        setResendMessage(response.message || "A new verification code has been sent to your email.")
      } else {
        // For registration, you might need a separate resend endpoint
        // For now, we'll show a message
        setResendMessage("Please contact support to resend registration OTP.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.")
    } finally {
      setResendLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600">
            {verificationType === "registration"
              ? "Enter the verification code sent to your email"
              : "Enter the code to reset your password"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {resendMessage && (
                <Alert>
                  <AlertDescription>{resendMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 text-center">{otp.length}/6 digits entered</p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendOTP}
                  className="text-blue-600 hover:underline"
                  disabled={isLoading || resendLoading}
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              </p>

              <Link
                href={verificationType === "registration" ? "/auth/register" : "/auth/forgot-password"}
                className="inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
