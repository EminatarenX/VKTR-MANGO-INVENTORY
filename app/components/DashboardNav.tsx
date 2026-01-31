'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

interface DashboardNavProps {
  userEmail: string
}

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/movements', label: 'Movimientos' },
  { href: '/reports', label: 'Reportes' },
  { href: '/settings', label: 'Configuración' },
]

export default function DashboardNav({ userEmail }: DashboardNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4 min-w-0">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Hamburger - solo móvil */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link
                href="/"
                className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 hover:text-zinc-700 dark:hover:text-zinc-300 truncate"
              >
                Inventario de Mango
              </Link>

              {/* Nav desktop - oculto en móvil */}
              <nav className="hidden md:flex gap-4 shrink-0">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm whitespace-nowrap ${
                      pathname === link.href
                        ? 'text-zinc-900 dark:text-zinc-50 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[120px] sm:max-w-none">
                {userEmail}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Aside / Drawer - desliza de izquierda a derecha */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-50 transform transition-transform duration-300 ease-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú de navegación"
      >
        <div className="flex justify-between items-center h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">Menú</span>
          <button
            type="button"
            onClick={closeSidebar}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeSidebar}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate px-2" title={userEmail}>
            {userEmail}
          </p>
          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  )
}
