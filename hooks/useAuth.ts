"use client"
import {
  useAuth as useAuthFromContext,
 
} from "@/contexts/auth-context"

export const useAuth = useAuthFromContext
//export type { User, AuthContextType, RegisterData }
