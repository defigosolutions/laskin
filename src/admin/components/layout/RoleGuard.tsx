import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface RoleGuardProps {
  allowedRoles: string[]
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/admin-laskin/login" replace />
  }
  
  if (!allowedRoles.includes(user.role)) {
    // If they don't have access, redirect to dashboard which everyone has access to
    return <Navigate to="/admin-laskin/dashboard" replace />
  }
  
  return <Outlet />
}
