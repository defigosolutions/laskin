import React from 'react'
import { Menu, Bell, Search, ExternalLink, LogOut, User, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Badge } from '../ui/badge'
import { useAuth } from '../../hooks/useAuth'
import { initials } from '../../lib/utils'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-admin-border bg-admin-surface/70 backdrop-blur-md px-4 lg:px-8">
      {/* Mobile menu */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <Input
          placeholder="Search anything..."
          icon={<Search className="h-3.5 w-3.5" />}
          className="h-8 text-xs bg-admin-card"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* View site */}
        <Button
          variant="ghost"
          size="icon"
          title="View public site"
          onClick={() => window.open('/', '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" title="Notifications">
          <Bell className="h-4 w-4" />
          <Badge
            variant="error"
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full"
          >
            3
          </Badge>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-admin-hover transition-colors focus:outline-none">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials(user?.fullName ?? 'Admin')}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs font-medium text-admin-text leading-none">{user?.fullName ?? 'Admin'}</span>
                <span className="text-[10px] text-admin-muted leading-none mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin-laskin/admin-users')}>
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin-laskin/settings')}>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
