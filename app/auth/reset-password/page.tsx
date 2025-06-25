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
import { GraduationCap, Lock, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { api } from "@/services/api"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const otpParam = searchParams.get("otp")

    if (emailParam && otpParam) {
      setEmail(emailParam)
      setOtp(otpParam)
    } else {
      // Redirect back if missing parameters
      router.push("/auth/forgot-password")
    }
  }, [searchParams, router])

  const validatePassword = (password: string) => {
    // Based on your backend validation: at least 8 characters with uppercase, lowercase, number, and special character
    const minLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
      errors: {
        minLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecialChar,
      },
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in both password fields.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError("Password must be at least 8 characters with uppercase, lowercase, number, and special character.")
      setIsLoading(false)
      return
    }

    try {
      const response = await api.auth.resetPassword(email, otp, password)

      if (response.error === false) {
        setSuccess(true)

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } else {
        setError(response.message || "Failed to reset password. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Password Reset Successful</h1>
            <p className="text-gray-600">Your password has been successfully reset</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your password has been successfully reset. You can now sign in with your new password.
                </AlertDescription>
              </Alert>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-4">Redirecting to login page...</p>
                <Button onClick={() => router.push("/auth/login")} className="w-full">
                  Continue to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const passwordValidation = validatePassword(password)

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
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600">Enter your new password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>Enter a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-700">Password requirements:</p>
                <div className="grid grid-cols-1 gap-1">
                  <div
                    className={`flex items-center gap-2 ${passwordValidation.errors.minLength ? "text-green-600" : "text-gray-500"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${passwordValidation.errors.minLength ? "bg-green-600" : "bg-gray-300"}`}
                    />
                    <span>At least 8 characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordValidation.errors.hasUppercase ? "text-green-600" : "text-gray-500"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${passwordValidation.errors.hasUppercase ? "bg-green-600" : "bg-gray-300"}`}
                    />
                    <span>One uppercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordValidation.errors.hasLowercase ? "text-green-600" : "text-gray-500"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${passwordValidation.errors.hasLowercase ? "bg-green-600" : "bg-gray-300"}`}
                    />
                    <span>One lowercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordValidation.errors.hasNumber ? "text-green-600" : "text-gray-500"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${passwordValidation.errors.hasNumber ? "bg-green-600" : "bg-gray-300"}`}
                    />
                    <span>One number</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordValidation.errors.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${passwordValidation.errors.hasSpecialChar ? "bg-green-600" : "bg-gray-300"}`}
                    />
                    <span>One special character</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="inline-flex items-center text-sm text-blue-600 hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
