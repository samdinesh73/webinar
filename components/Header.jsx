'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Menu, X, CircleUser } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setMobileMenuOpen(false);
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {token && user ? (
              <>
                <div className="flex items-center gap-2">
                  <CircleUser className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {user.name}
                  </span>
                </div>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">
                    Dashboard
                  </Button>
                </Link>
                <Button size="sm" onClick={handleLogout} variant="destructive">
                  Logout
                </Button>
              </>
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
          <div className="md:hidden pt-4 pb-4 space-y-4 border-t border-border mt-4">
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
            <div className="pt-4 border-t border-border space-y-3">
              {token && user ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CircleUser className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {user.name}
                    </span>
                  </div>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button size="sm" onClick={handleLogout} variant="destructive" className="w-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
