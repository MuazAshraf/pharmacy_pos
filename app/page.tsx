import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center px-2 text-blue-600 hover:text-blue-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/pos" className="flex items-center px-2 text-blue-600 hover:text-blue-800">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-64 h-64 mx-auto mb-8">
            <Image
              src="/muaz_logo.png"
              alt="Medical POS Logo"
              fill
              className="object-contain opacity-80"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-8">Welcome to Medical POS</h1>
          <nav className="space-y-4">
            <div className="flex justify-center space-x-6">
              <Link 
                href="/pos" 
                className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                POS
              </Link>
              <Link 
                href="/inventory" 
                className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Inventory
              </Link>
              <Link 
                href="/reports" 
                className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Reports
              </Link>
            </div>
            <div className="flex justify-center space-x-6">
              <Link 
                href="/signup" 
                className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Sign Up
              </Link>
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      </main>

      <footer className="bg-white py-4">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 Medical POS by Muhammad Muaz Ashraf. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

