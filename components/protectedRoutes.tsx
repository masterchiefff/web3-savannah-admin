"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for auth token in localStorage
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
      router.push("/login")
    }
  }, [router])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>
  }

  // Render children if authenticated
  return isAuthenticated ? <>{children}</> : null
}