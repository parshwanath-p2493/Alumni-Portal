import Cookies from "js-cookie"

export const login = async (email: string, password: string) => {
  // This is a placeholder. The actual implementation is in auth-context.tsx
  // This function should never be called directly, but rather accessed through the AuthContext.
  // This is to avoid circular dependencies.

  return new Promise<{ success: boolean; requiresOTP?: boolean; message?: string }>((resolve, reject) => {
    const savedToken = Cookies.get("access_token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      resolve({ success: true, message: "Login successful" })
    } else {
      resolve({ success: false, message: "Invalid credentials" })
    }
  })
}
