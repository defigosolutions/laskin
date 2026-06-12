import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth'
import AdminLayout from './components/layout/AdminLayout'
import RoleGuard from './components/layout/RoleGuard'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Branches from './pages/Branches'
import Treatments from './pages/Treatments'
import Categories from './pages/Categories'
import Packages from './pages/Packages'
import Specialists from './pages/Specialists'
import BeforeAfterPage from './pages/BeforeAfter'
import Reviews from './pages/Reviews'
import Uploads from './pages/Uploads'
import Settings from './pages/Settings'
import AdminUsers from './pages/AdminUsers'
import AuditLogs from './pages/AuditLogs'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div id="admin-root">
        <AuthProvider>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              
              {/* Everyone has access to Dashboard and Bookings */}
              <Route element={<RoleGuard allowedRoles={['super_admin', 'clinic_manager', 'specialist', 'concierge']} />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="bookings" element={<Bookings />} />
              </Route>

              {/* Only super_admin and clinic_manager can access content and media */}
              <Route element={<RoleGuard allowedRoles={['super_admin', 'clinic_manager']} />}>
                <Route path="branches" element={<Branches />} />
                <Route path="treatments" element={<Treatments />} />
                <Route path="categories" element={<Categories />} />
                <Route path="packages" element={<Packages />} />
                <Route path="specialists" element={<Specialists />} />
                <Route path="before-after" element={<BeforeAfterPage />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="uploads" element={<Uploads />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Only super_admin can access system users and audit logs */}
              <Route element={<RoleGuard allowedRoles={['super_admin']} />}>
                <Route path="admin-users" element={<AdminUsers />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </div>
    </QueryClientProvider>
  )
}
