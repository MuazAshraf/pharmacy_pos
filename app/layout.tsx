'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AuthState } from '@/types'
import { useRouter, usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setAuth({
        isAuthenticated: true,
        user: JSON.parse(user)
      });
    }
    setIsAuthLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({
      isAuthenticated: false,
      user: null
    });
    router.push('/login');
  };

  // Protect routes
  useEffect(() => {
    if (isAuthLoading) return;
    
    const publicRoutes = ['/login', '/signup'];
    if (!auth.isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [auth.isAuthenticated, pathname, router, isAuthLoading]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {auth.isAuthenticated && (
                <>
                  <Link href="/" className="hover:text-blue-200">POS</Link>
                  <Link href="/inventory" className="hover:text-blue-200">Inventory</Link>
                  <Link href="/reports" className="hover:text-blue-200">Reports</Link>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {auth.isAuthenticated ? (
                <>
                  <span>Welcome, {auth.user?.username}!</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`hover:text-blue-200 ${pathname === '/login' ? 'font-bold' : ''}`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className={`hover:text-blue-200 ${pathname === '/signup' ? 'font-bold' : ''}`}
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}

