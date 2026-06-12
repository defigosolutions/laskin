import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, GitBranch, Sparkles, Tag,
  Package, UserCheck, Images, Star, Settings, Users, ScrollText,
  Upload, X, ChevronRight,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Separator } from '../ui/separator'
import { useAuth } from '../../hooks/useAuth'

const BASE = '/admin-laskin'

const navSections = [
  {
    label: 'Main',
    items: [
      { to: `${BASE}/dashboard`,  icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'clinic_manager', 'specialist', 'concierge'] },
      { to: `${BASE}/bookings`,   icon: CalendarDays,    label: 'Bookings', roles: ['super_admin', 'clinic_manager', 'specialist', 'concierge'] },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: `${BASE}/branches`,      icon: GitBranch,  label: 'Branches', roles: ['super_admin', 'clinic_manager'] },
      { to: `${BASE}/treatments`,    icon: Sparkles,   label: 'Treatments', roles: ['super_admin', 'clinic_manager'] },
      { to: `${BASE}/categories`,    icon: Tag,        label: 'Categories', roles: ['super_admin', 'clinic_manager'] },
      { to: `${BASE}/packages`,      icon: Package,    label: 'Packages', roles: ['super_admin', 'clinic_manager'] },
      { to: `${BASE}/specialists`,   icon: UserCheck,  label: 'Specialists', roles: ['super_admin', 'clinic_manager'] },
      { to: `${BASE}/before-after`,  icon: Images,     label: 'Before & After', roles: ['super_admin', 'clinic_manager'] },
      { to: `${BASE}/reviews`,       icon: Star,       label: 'Reviews', roles: ['super_admin', 'clinic_manager'] },
    ],
  },
  {
    label: 'Media',
    items: [
      { to: `${BASE}/uploads`, icon: Upload, label: 'Uploads', roles: ['super_admin', 'clinic_manager'] },
    ],
  },
  {
    label: 'System',
    items: [
      { to: `${BASE}/settings`,    icon: Settings,    label: 'Site Settings', roles: ['super_admin', 'clinic_manager'] },
      { to: `${BASE}/admin-users`, icon: Users,       label: 'Admin Users', roles: ['super_admin'] },
      { to: `${BASE}/audit-logs`,  icon: ScrollText,  label: 'Audit Logs', roles: ['super_admin'] },
    ],
  },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()
  
  const userRole = user?.role || ''

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 flex flex-col border-r border-admin-border bg-admin-surface transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-admin-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-gold-light to-gold flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-admin-bg" />
            </div>
            <div>
              <span className="text-sm font-semibold text-admin-text tracking-wide">LA Skin</span>
              <span className="block text-[10px] text-admin-muted leading-none tracking-widest uppercase mt-0.5">Admin</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1.5 text-admin-muted hover:text-admin-text hover:bg-admin-card transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(item => item.roles.includes(userRole))
            if (visibleItems.length === 0) return null

            return (
              <div key={section.label}>
                <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-admin-subtle">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          onClick={onClose}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] tracking-wide transition-all duration-300',
                            active
                              ? 'bg-gradient-to-r from-gold/10 to-transparent text-gold font-medium'
                              : 'text-admin-muted hover:text-admin-text hover:bg-admin-hover/50'
                          )}
                        >
                          <item.icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', active ? 'text-gold' : 'text-admin-subtle group-hover:text-admin-muted')} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {active && <ChevronRight className="h-3.5 w-3.5 text-gold/60" />}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
                <Separator className="mt-4" />
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-admin-border shrink-0">
          <p className="text-[10px] text-admin-subtle text-center">
            LA Skin Admin v1.0
          </p>
        </div>
      </aside>
    </>
  )
}
