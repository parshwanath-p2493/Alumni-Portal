"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"

export function AuthDebug() {
  const { user, token, isAuthenticated, isLoading } = useAuth()

  const checkCookies = () => {
    const cookieToken = Cookies.get("access_token")
    const localUser = sessionStorage.getItem("user")

    console.log("🍪 Cookie check:", {
      cookieToken: cookieToken ? cookieToken.substring(0, 20) + "..." : "None",
      localUser: localUser ? JSON.parse(localUser) : "None",
      contextToken: token ? token.substring(0, 20) + "..." : "None",
      contextUser: user,
      isAuthenticated,
      isLoading,
    })
  }

  const forceReload = () => {
    window.location.reload()
  }

  const clearAuth = () => {
    Cookies.remove("access_token")
    sessionStorage.removeItem("user")
    window.location.reload()
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>Context State:</strong>
          <ul className="ml-4 list-disc">
            <li>User: {user ? `${user.name} (${user.email})` : "None"}</li>
            <li>Token: {token ? "Present" : "None"}</li>
            <li>Is Authenticated: {isAuthenticated ? "Yes" : "No"}</li>
            <li>Is Loading: {isLoading ? "Yes" : "No"}</li>
          </ul>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={checkCookies}>
            Check Storage
          </Button>
          <Button size="sm" variant="outline" onClick={forceReload}>
            Force Reload
          </Button>
          <Button size="sm" variant="destructive" onClick={clearAuth}>
            Clear Auth
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
