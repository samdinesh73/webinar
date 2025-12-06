'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Menu, X, Settings, LogOut, LayoutDashboard, Video } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Header() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Centered on mobile */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-main.webp" alt="Logo" className="h-8" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="/#speakers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Speakers
            </Link>
            <Link href="/#schedule" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Schedule
            </Link>
            <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
          </div>

          {/* Desktop Auth - Avatar Dropdown or Login/Signup */}
          <div className="hidden md:flex items-center gap-4">
            {token && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition">
                    <Avatar>
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-4"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-4 border-t border-border mt-4">
            <div className="space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                <Link href="/#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition">
                  Features
                </Link>
                <Link href="/#speakers" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition">
                  Speakers
                </Link>
                <Link href="/#schedule" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition">
                  Schedule
                </Link>
                <Link href="/#pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition">
                  Pricing
                </Link>
              </div>

              <Separator />

              {/* User Section */}
              {token && user ? (
                <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  {/* User Profile Card */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Account Section */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">My Account</p>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start gap-2"
                          onClick={() => handleNavigation('/dashboard')}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start gap-2"
                          onClick={() => handleNavigation('/videos')}
                        >
                          <Video className="w-4 h-4" />
                          My Classes
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start gap-2"
                          onClick={() => handleNavigation('/dashboard')}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Button>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="w-full justify-start gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Get Started</p>
                    <Link href="/login" className="block">
                      <Button size="sm" variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" className="block">
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
