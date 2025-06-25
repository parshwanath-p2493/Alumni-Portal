// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Helper function to get auth token from cookies
const getToken = () => {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";")
    const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("access_token="))
    return tokenCookie ? tokenCookie.split("=")[1] : null
  }
  return null
}

// Generic fetch function with authentication and better error handling
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Handle token expiration
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        // Clear auth data
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        localStorage.removeItem("user")
        window.location.href = "/auth/login"
      }
      throw new Error("Authentication failed")
    }

    const data = await response.json()

    // Check if response has error field (matching your backend structure)
    if (data.error === true) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }

    if (!response.ok && !data.error === false) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the backend is running.")
    }
    throw error
  }
}

// API functions matching your Go Fiber backend routes
export const api = {
  // Auth endpoints
  auth: {
    register: (userData: {
      name: string
      email: string
      password: string
      role: string
      student_id?: string
      graduation_year?: number
      company?: string
      experience?: number
      github?: string
      linkedin?: string
      skills?: string[]
    }) =>
      fetchWithAuth("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    verifyOTP: (email: string, otp: string) =>
      fetchWithAuth("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }),

    login: (email: string, password: string) =>
      fetchWithAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    forgotPassword: (email: string) =>
      fetchWithAuth("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    resetPassword: (email: string, otp: string, password: string) =>
      fetchWithAuth("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, password }),
      }),

    refreshToken: () =>
      fetchWithAuth("/auth/refresh", {
        method: "POST",
      }),

    logout: () =>
      fetchWithAuth("/auth/logout", {
        method: "POST",
      }),
  },

  // User endpoints
  users: {
    getProfile: () => fetchWithAuth("/users/profile"),
    updateProfile: (data: any) =>
      fetchWithAuth("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    getAll: (params = {}) => fetchWithAuth("/users/getusers?" + new URLSearchParams(params as any).toString()),
    getDashboardStats: () => fetchWithAuth("/users/dashboard-stats"),
    getById: (id: string) => fetchWithAuth(`/users/${id}`),
  },

  // Project endpoints
  projects: {
    getAll: (params = {}) => fetchWithAuth("/projects/projectview?" + new URLSearchParams(params as any).toString()),
    create: (data: any) =>
      fetchWithAuth("/projects/addproject", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getById: (id: string) => fetchWithAuth(`/projects/${id}`),
    update: (id: string, data: any) =>
      fetchWithAuth(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/projects/${id}`, {
        method: "DELETE",
      }),
    like: (id: string) =>
      fetchWithAuth(`/projects/${id}/like`, {
        method: "POST",
      }),
    unlike: (id: string) =>
      fetchWithAuth(`/projects/${id}/like`, {
        method: "DELETE",
      }),
  },

  // Job endpoints
  jobs: {
    getAll: (params = {}) => fetchWithAuth("/jobs?" + new URLSearchParams(params as any).toString()),
    create: (data: any) =>
      fetchWithAuth("/jobs/add", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getById: (id: string) => fetchWithAuth(`/jobs/${id}`),
    update: (id: string, data: any) =>
      fetchWithAuth(`/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/jobs/${id}`, {
        method: "DELETE",
      }),
    showInterest: (id: string) =>
      fetchWithAuth(`/jobs/${id}/interest`, {
        method: "POST",
      }),
    removeInterest: (id: string) =>
      fetchWithAuth(`/jobs/${id}/interest`, {
        method: "DELETE",
      }),
    getInterestedUsers: (id: string) => fetchWithAuth(`/jobs/${id}/interested-users`),
  },

  // Event endpoints
  events: {
    getAll: (params = {}) => fetchWithAuth("/events?" + new URLSearchParams(params as any).toString()),
    create: (data: any) =>
      fetchWithAuth("/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getById: (id: string) => fetchWithAuth(`/events/${id}`),
    update: (id: string, data: any) =>
      fetchWithAuth(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/events/${id}`, {
        method: "DELETE",
      }),
    rsvp: (id: string, status: string) =>
      fetchWithAuth(`/events/${id}/rsvp`, {
        method: "POST",
        body: JSON.stringify({ status }),
      }),
    getAttendees: (id: string) => fetchWithAuth(`/events/${id}/attendees`),
  },

  // Message endpoints
  messages: {
    getConversations: () => fetchWithAuth("/messages/message"),
    sendMessage: (recipientId: string, content: string, subject?: string) =>
      fetchWithAuth("/messages/sendmessage", {
        method: "POST",
        body: JSON.stringify({ recipient_id: recipientId, content, subject }),
      }),
    getMessages: (id: string) => fetchWithAuth(`/messages/${id}`),
    markAsRead: (id: string) =>
      fetchWithAuth(`/messages/${id}/read`, {
        method: "PUT",
      }),
  },

  // Notification endpoints
  notifications: {
    getAll: (params = {}) => fetchWithAuth("/notifications/inbox?" + new URLSearchParams(params as any).toString()),
    markAsRead: (id: string) =>
      fetchWithAuth(`/notifications/${id}/read`, {
        method: "PUT",
      }),
    markAllAsRead: () =>
      fetchWithAuth("/notifications/read-all", {
        method: "PUT",
      }),
  },

  // Gallery endpoints
  gallery: {
    getAll: (params = {}) => fetchWithAuth("/gallery?" + new URLSearchParams(params as any).toString()),
    getById: (id: string) => fetchWithAuth(`/gallery/${id}`),
    upload: (data: FormData) =>
      fetchWithAuth("/gallery/upload", {
        method: "POST",
        body: data,
        headers: {}, // Let the browser set the content type for FormData
      }),
    delete: (id: string) =>
      fetchWithAuth(`/gallery/${id}`, {
        method: "DELETE",
      }),
  },

  // Upload endpoints
  upload: {
    avatar: (file: File) => {
      const formData = new FormData()
      formData.append("avatar", file)
      return fetchWithAuth("/upload/avatar", {
        method: "POST",
        body: formData,
        headers: {},
      })
    },
    galleryImage: (file: File, title: string, description?: string, tags?: string, eventId?: string) => {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("title", title)
      if (description) formData.append("description", description)
      if (tags) formData.append("tags", tags)
      if (eventId) formData.append("event_id", eventId)
      return fetchWithAuth("/upload/gallery", {
        method: "POST",
        body: formData,
        headers: {},
      })
    },
  },

  // Admin endpoints
  admin: {
    getAllUsers: () => fetchWithAuth("/admin/users"),
    updateUserStatus: (id: string, status: string) =>
      fetchWithAuth(`/admin/users/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    deleteUser: (id: string) =>
      fetchWithAuth(`/admin/users/${id}`, {
        method: "DELETE",
      }),
    getAnalytics: () => fetchWithAuth("/admin/analytics"),
    getDashboardAnalytics: () => fetchWithAuth("/admin/dashboard-analytics"),

    // Email settings
    emailSettings: {
      get: () => fetchWithAuth("/admin/email-settings"),
      update: (data: any) =>
        fetchWithAuth("/admin/email-settings", {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      test: () =>
        fetchWithAuth("/admin/email-settings/test", {
          method: "POST",
        }),
      getTemplates: () => fetchWithAuth("/admin/email-settings/templates"),
      createTemplate: (data: any) =>
        fetchWithAuth("/admin/email-settings/templates", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      getStats: () => fetchWithAuth("/admin/email-settings/stats"),
    },
  },
}

// Health check endpoint
export const healthCheck = () => fetch(`${API_BASE_URL}/health`).then((res) => res.ok)

export default api
