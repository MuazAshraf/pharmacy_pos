import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <ul className="flex space-x-4">
          <li><Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
          <li><Link href="/pos" className="text-blue-600 hover:text-blue-800">POS</Link></li>
          <li><Link href="/inventory" className="text-blue-600 hover:text-blue-800">Inventory</Link></li>
          <li><Link href="/reports" className="text-blue-600 hover:text-blue-800">Reports</Link></li>
        </ul>
      </nav>
    </header>
  )
}

