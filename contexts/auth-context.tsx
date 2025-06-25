// "use client"

// import type React from "react"
// import { createContext, useContext, useEffect, useState } from "react"
// import Cookies from "js-cookie"

// interface User {
//   id: string
//   name: string
//   email: string
//   role: string
//   avatar_url?: string
//   student_id?: string
//   graduation_year?: number
//   company?: string
//   [key: string]: any
// }

// interface AuthContextType {
//   user: User | null
//   token: string | null
//   isLoading: boolean
//   isAuthenticated: boolean
//   connectionStatus: "connected" | "disconnected" | "checking"
//   login: (email: string, password: string) => Promise<{ success: boolean; requiresOTP?: boolean; message?: string }>
//   register: (userData: any) => Promise<{ success: boolean; message?: string }>
//   verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>
//   logout: () => void
//   loginWithToken: (token: string, user: User) => void
//   checkConnection: () => Promise<boolean>
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// // Configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [token, setToken] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking")

//   // Helper function to check if server is reachable
//   const checkConnection = async (): Promise<boolean> => {
//     try {
//       setConnectionStatus("checking")
//       const controller = new AbortController()
//       const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

//       const response = await fetch(`${API_BASE_URL}/health`, {
//         method: "GET",
//         signal: controller.signal,
//       })

//       clearTimeout(timeoutId)

//       if (response.ok) {
//         setConnectionStatus("connected")
//         return true
//       } else {
//         setConnectionStatus("disconnected")
//         return false
//       }
//     } catch (error) {
//       console.error("Connection check failed:", error)
//       setConnectionStatus("disconnected")
//       return false
//     }
//   }

//   // Helper function for API calls with better error handling
//   const apiCall = async (endpoint: string, options: RequestInit = {}) => {
//     try {
//       const controller = new AbortController()
//       const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

//       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         ...options,
//         signal: controller.signal,
//         headers: {
//           "Content-Type": "application/json",
//           ...options.headers,
//         },
//       })

//       clearTimeout(timeoutId)

//       const data = await response.json()
//       setConnectionStatus("connected")

//       // Handle backend error responses (matching your Go Fiber structure)
//       if (data.error === true) {
//         throw new Error(data.message || "Request failed")
//       }

//       // Check if the response is ok for non-error responses
//       if (!response.ok && data.error !== false) {
//         throw new Error(data.message || `HTTP error! status: ${response.status}`)
//       }

//       return { response, data }
//     } catch (error) {
//       console.error(`API call failed for ${endpoint}:`, error)
//       setConnectionStatus("disconnected")

//       // More specific error messages
//       if (error instanceof TypeError && error.message === "Failed to fetch") {
//         throw new Error("Unable to connect to server. Please check if the backend is running.")
//       }

//       if (error.name === "AbortError") {
//         throw new Error("Request timed out. The server might be slow or unreachable.")
//       }

//       throw error
//     }
//   }

//   // Check connection on mount
//   useEffect(() => {
//     checkConnection()
//   }, [])

//   // Load user from cookies on initial render
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const savedToken = Cookies.get("access_token")

//         if (savedToken) {
//           setToken(savedToken)

//           // Try to fetch user profile using token
//           try {
//             const { data: profileData } = await apiCall("/users/profile", {
//               headers: { Authorization: `Bearer ${savedToken}` },
//             })

//             if (profileData.user || profileData) {
//               const userData = profileData.user || profileData
//               setUser(userData)
//               localStorage.setItem("user", JSON.stringify(userData))
//             }
//           } catch (error) {
//             console.error("Failed to load user profile:", error)
//             // Don't clear token immediately, might be a temporary connection issue
//           }
//         }
//       } catch (error) {
//         console.error("Error loading user:", error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     loadUser()
//   }, [])

//   const login = async (email: string, password: string) => {
//     try {
//       console.log("🔐 Auth context login called with:", { email })

//       // Check connection first
//       const isConnected = await checkConnection()
//       if (!isConnected) {
//         return {
//           success: false,
//           message: "Cannot connect to server. Please check your internet connection and try again.",
//         }
//       }

//       console.log("🌐 Making login API call...")
//       const { data } = await apiCall("/auth/login", {
//         method: "POST",
//         body: JSON.stringify({ email, password }),
//       })

//       console.log("📥 Login API response:", data)

//       // Handle successful login with token
//       if (data.access_token && data.user) {
//         const token = data.access_token
//         const userData = data.user

//         console.log("✅ Setting auth data:", {
//           token: token.substring(0, 20) + "...",
//           userData: { name: userData.name, email: userData.email, role: userData.role },
//         })

//         // Set cookie with proper options
//         Cookies.set("access_token", token, {
//           expires: 7,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax",
//         })
//         localStorage.setItem("user", JSON.stringify(userData))

//         // Update state immediately
//         setToken(token)
//         setUser(userData)

//         console.log("🎯 Auth state updated - token:", !!token, "user:", !!userData)

//         return { success: true, message: data.message }
//       }
//       // Handle case where user needs OTP verification
//       else if (data.message && data.message.includes("verify")) {
//         console.log("📧 OTP verification required")
//         return { success: false, requiresOTP: true, message: data.message }
//       }
//       // Handle other cases
//       else {
//         console.log("❌ Login failed - unexpected response:", data)
//         return { success: false, message: data.message || "Login failed" }
//       }
//     } catch (error: any) {
//       console.error("💥 Login error:", error)
//       return { success: false, message: error.message || "Login failed" }
//     }
//   }

//   const register = async (userData: any) => {
//     try {
//       const isConnected = await checkConnection()
//       if (!isConnected) {
//         return {
//           success: false,
//           message: "Cannot connect to server. Please check your internet connection and try again.",
//         }
//       }

//       const { data } = await apiCall("/auth/register", {
//         method: "POST",
//         body: JSON.stringify(userData),
//       })

//       return {
//         success: data.error === false,
//         message: data.message || "Registration successful. Please check your email for OTP.",
//       }
//     } catch (error: any) {
//       console.error("Registration error:", error)
//       return { success: false, message: error.message || "Registration failed" }
//     }
//   }

//   const verifyOTP = async (email: string, otp: string) => {
//     try {
//       const isConnected = await checkConnection()
//       if (!isConnected) {
//         return {
//           success: false,
//           message: "Cannot connect to server. Please check your internet connection and try again.",
//         }
//       }

//       const { data } = await apiCall("/auth/verify-otp", {
//         method: "POST",
//         body: JSON.stringify({ email, otp }),
//       })

//       if (data.access_token && data.user) {
//         const token = data.access_token
//         const userData = data.user

//         Cookies.set("access_token", token, { expires: 7 })
//         localStorage.setItem("user", JSON.stringify(userData))

//         setToken(token)
//         setUser(userData)

//         return { success: true, message: data.message || "Email verified successfully!" }
//       } else {
//         return { success: false, message: data.message || "OTP verification failed" }
//       }
//     } catch (error: any) {
//       console.error("OTP verification error:", error)
//       return { success: false, message: error.message || "OTP verification failed" }
//     }
//   }

//   const loginWithToken = (token: string, userData: User) => {
//     Cookies.set("access_token", token, { expires: 7 })
//     localStorage.setItem("user", JSON.stringify(userData))
//     setToken(token)
//     setUser(userData)
//   }

//   const logout = () => {
//     Cookies.remove("access_token")
//     localStorage.removeItem("user")
//     setToken(null)
//     setUser(null)
//   }

//   const isAuthenticated = !!(user && token)

//   console.log("🔍 Auth state check:", {
//     hasUser: !!user,
//     hasToken: !!token,
//     isAuthenticated,
//     userName: user?.name,
//   })

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         isLoading,
//         isAuthenticated, // Use the computed value
//         connectionStatus,
//         login,
//         register,
//         verifyOTP,
//         logout,
//         loginWithToken,
//         checkConnection,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  student_id?: string
  graduation_year?: number
  company?: string
  position?: string
  location?: string
  experience?: string
  skills?: string[]
  github_url?: string
  linkedin_url?: string
  is_verified?: boolean
  is_active?: boolean
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  connectionStatus: "connected" | "disconnected" | "checking"
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; requiresOTP?: boolean; message?: string; user?: User; token?: string }>
  register: (userData: any) => Promise<{ success: boolean; message?: string }>
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  loginWithToken: (token: string, user: User) => void
  checkConnection: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configuration - matching your backend structure
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking")

  // Helper function to check if server is reachable
  const checkConnection = async (): Promise<boolean> => {
    try {
      setConnectionStatus("checking")
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        setConnectionStatus("connected")
        return true
      } else {
        setConnectionStatus("disconnected")
        return false
      }
    } catch (error) {
      console.error("Connection check failed:", error)
      setConnectionStatus("disconnected")
      return false
    }
  }

  // Helper function for API calls matching your backend structure
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      const data = await response.json()
      setConnectionStatus("connected")

      // Handle backend error responses matching your Go Fiber structure
      if (data.error === true) {
        throw new Error(data.message || "Request failed")
      }

      return { response, data }
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error)
      setConnectionStatus("disconnected")

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("Unable to connect to server. Please check if the backend is running.")
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out. The server might be slow or unreachable.")
      }

      throw error
    }
  }

  // Check connection on mount
  useEffect(() => {
    checkConnection()
  }, [])

  // Load user from cookies on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = Cookies.get("access_token")
        const savedUser = localStorage.getItem("user")

        console.log("🔄 Loading saved auth data:", {
          hasToken: !!savedToken,
          hasUser: !!savedUser,
        })

        if (savedToken && savedUser) {
          try {
            const userData = JSON.parse(savedUser)
            console.log("✅ Restoring auth state:", {
              token: savedToken.substring(0, 20) + "...",
              user: { name: userData.name, email: userData.email, role: userData.role },
            })

            setToken(savedToken)
            setUser(userData)
          } catch (parseError) {
            console.error("Failed to parse saved user data:", parseError)
            Cookies.remove("access_token")
            localStorage.removeItem("user")
          }
        } else if (savedToken) {
          setToken(savedToken)

          try {
            const { data: profileData } = await apiCall("/users/profile", {
              headers: { Authorization: `Bearer ${savedToken}` },
            })

            if (profileData.user || profileData.data?.user) {
              const userData = profileData.user || profileData.data?.user
              setUser(userData)
              localStorage.setItem("user", JSON.stringify(userData))
            }
          } catch (error) {
            console.error("Failed to load user profile:", error)
            Cookies.remove("access_token")
            setToken(null)
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Auth context login called with:", { email })

      const isConnected = await checkConnection()
      if (!isConnected) {
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection and try again.",
        }
      }

      console.log("🌐 Making login API call...")
      const { data } = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      console.log("📥 Login API response:", data)

      // Handle successful login - matching your backend response structure
      if (data.error === false && data.data?.access_token && data.data?.user) {
        const token = data.data.access_token
        const userData = data.data.user

        console.log("✅ Setting auth data:", {
          token: token.substring(0, 20) + "...",
          userData: { name: userData.name, email: userData.email, role: userData.role },
        })

        // Set cookie with proper options
        Cookies.set("access_token", token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
        localStorage.setItem("user", JSON.stringify(userData))

        // Update state immediately and synchronously
        setToken(token)
        setUser(userData)

        // Force a longer delay to ensure state propagation
        await new Promise((resolve) => setTimeout(resolve, 200))

        console.log("🎯 Auth state updated - token:", !!token, "user:", !!userData)

        return { success: true, message: data.message, user: userData, token }
      }
      // Handle case where user needs OTP verification
      else if (data.message && data.message.includes("verify")) {
        console.log("📧 OTP verification required")
        return { success: false, requiresOTP: true, message: data.message }
      }
      // Handle other cases
      else {
        console.log("❌ Login failed - unexpected response:", data)
        return { success: false, message: data.message || "Login failed" }
      }
    } catch (error) {
      console.error("💥 Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      return { success: false, message: errorMessage }
    }
  }

  const register = async (userData: any) => {
    try {
      const isConnected = await checkConnection()
      if (!isConnected) {
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection and try again.",
        }
      }

      const { data } = await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      return {
        success: data.error === false,
        message: data.message || "Registration successful. Please check your email for OTP.",
      }
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      return { success: false, message: errorMessage }
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const isConnected = await checkConnection()
      if (!isConnected) {
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection and try again.",
        }
      }

      const { data } = await apiCall("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      })

      if (data.error === false && data.data?.access_token && data.data?.user) {
        const token = data.data.access_token
        const userData = data.data.user

        Cookies.set("access_token", token, { expires: 7 })
        localStorage.setItem("user", JSON.stringify(userData))

        setToken(token)
        setUser(userData)

        return { success: true, message: data.message || "Email verified successfully!" }
      } else {
        return { success: false, message: data.message || "OTP verification failed" }
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      const errorMessage = error instanceof Error ? error.message : "OTP verification failed"
      return { success: false, message: errorMessage }
    }
  }

  const loginWithToken = (token: string, userData: User) => {
    Cookies.set("access_token", token, { expires: 7 })
    localStorage.setItem("user", JSON.stringify(userData))
    setToken(token)
    setUser(userData)
  }

  const logout = () => {
    Cookies.remove("access_token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!(user && token)

  console.log("🔍 Auth state check:", {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated,
    userName: user?.name,
  })

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        connectionStatus,
        login,
        register,
        verifyOTP,
        logout,
        loginWithToken,
        checkConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
