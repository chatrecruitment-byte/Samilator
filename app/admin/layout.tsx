'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NAV = [
  { href: '/admin/users', label: '👥 מתלמדים' },
  { href: '/admin/skills', label: '🤖 סקילים' },
  { href: '/admin/reports', label: '📊 דוחות' },
  { href: '/admin/settings', label: '⚙️ הגדרות' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="bg-bg-secondary border-b border-bg-hover px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-text-primary font-bold ml-6">Samilator</span>
          {NAV.map(item => (
            <a key={item.href} href={item.href}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-accent-purple/20 text-accent-purple font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}>
              {item.label}
            </a>
          ))}
        </div>
        <button onClick={handleLogout} className="text-text-muted hover:text-text-secondary text-sm transition-colors">
          התנתק
        </button>
      </nav>
      {children}
    </div>
  )
}
