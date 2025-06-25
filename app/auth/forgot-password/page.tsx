"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Mail, Loader2, ArrowLeft, Lock, Eye, EyeOff, CheckCircle, RotateCcw } from "lucide-react"
import { api } from "@/services/api"

type Step = "email" | "otp" | "password" | "success"

export default function ForgotPasswordPage() {
  const router = useRouter()

  // Form state
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const validatePassword = (password: string) => {
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

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.")
      setIsLoading(false)
      return
    }

    try {
      await api.auth.forgotPassword(email.trim())
      setCurrentStep("otp")
      setError("")
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 & 3: Verify OTP and Reset Password (combined)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate OTP
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

    // Validate passwords
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
      // Use the ResetPasswordRequest structure (email, otp, password)
      const response = await api.auth.resetPassword(email.trim(), otp.trim(), password)

      if (response.error === false) {
        setCurrentStep("success")
        setError("")

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

  // Resend OTP
  const handleResendOTP = async () => {
    setResendLoading(true)
    setError("")

    try {
      await api.auth.forgotPassword(email.trim())
      setError("")
      // You could show a success message here if needed
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  // Go back to previous step
  const handleGoBack = () => {
    setError("")
    if (currentStep === "otp") {
      setCurrentStep("email")
      setOtp("")
    } else if (currentStep === "password") {
      setCurrentStep("otp")
      setPassword("")
      setConfirmPassword("")
    }
  }

  // Step progression
  const handleContinueToPassword = () => {
    if (otp.length === 6) {
      setCurrentStep("password")
      setError("")
    } else {
      setError("Please enter a valid 6-digit verification code.")
    }
  }

  const passwordValidation = validatePassword(password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                currentStep === "success" ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {currentStep === "success" ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <GraduationCap className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentStep === "email" && "Forgot Password"}
            {currentStep === "otp" && "Verify Email"}
            {currentStep === "password" && "Reset Password"}
            {currentStep === "success" && "Password Reset Successful"}
          </h1>
          <p className="text-gray-600">
            {currentStep === "email" && "Enter your email to reset your password"}
            {currentStep === "otp" && "Enter the verification code sent to your email"}
            {currentStep === "password" && "Enter your new password"}
            {currentStep === "success" && "Your password has been successfully reset"}
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep !== "success" && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === "email" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
                }`}
              >
                1
              </div>
              <div className={`w-8 h-1 ${currentStep === "email" ? "bg-gray-300" : "bg-green-600"}`} />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === "email"
                    ? "bg-gray-300 text-gray-600"
                    : currentStep === "otp"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                }`}
              >
                2
              </div>
              <div className={`w-8 h-1 ${currentStep === "password" ? "bg-green-600" : "bg-gray-300"}`} />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === "password" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === "email" && "Send Reset Code"}
              {currentStep === "otp" && "Enter Verification Code"}
              {currentStep === "password" && "Create New Password"}
              {currentStep === "success" && "Success!"}
            </CardTitle>
            <CardDescription>
              {currentStep === "email" && "We'll send you a verification code to reset your password"}
              {currentStep === "otp" && `We've sent a 6-digit code to ${email}`}
              {currentStep === "password" && "Enter a strong password for your account"}
              {currentStep === "success" && "You can now sign in with your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Email Input */}
            {currentStep === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: OTP Input */}
            {currentStep === "otp" && (
              <div className="space-y-4">
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

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoBack}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleContinueToPassword}
                    className="flex-1"
                    disabled={otp.length !== 6 || isLoading}
                  >
                    Continue
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{" "}
                    <button
                      onClick={handleResendOTP}
                      className="text-blue-600 hover:underline"
                      disabled={resendLoading}
                    >
                      {resendLoading ? (
                        <>
                          <RotateCcw className="inline w-3 h-3 animate-spin mr-1" />
                          Sending...
                        </>
                      ) : (
                        "Resend Code"
                      )}
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Password Reset */}
            {currentStep === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
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

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoBack}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Success */}
            {currentStep === "success" && (
              <div className="text-center space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your password has been successfully reset. You can now sign in with your new password.
                  </AlertDescription>
                </Alert>

                <div>
                  <p className="text-sm text-gray-600 mb-4">Redirecting to login page...</p>
                  <Button onClick={() => router.push("/auth/login")} className="w-full">
                    Continue to Login
                  </Button>
                </div>
              </div>
            )}

            {/* Back to Login Link */}
            {currentStep === "email" && (
              <div className="mt-6 text-center">
                <Link href="/auth/login" className="inline-flex items-center text-sm text-blue-600 hover:underline">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
