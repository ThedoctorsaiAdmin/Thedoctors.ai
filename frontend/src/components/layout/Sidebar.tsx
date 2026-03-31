'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

const navItems = [
  { section: 'Overview' },
  { href: '/dashboard',     icon: '⊞', label: 'Dashboard' },
  { href: '/appointments',  icon: '📅', label: 'Appointments',  badge: 8,  badgeColor: 'accent' },
  { href: '/queue',         icon: '⏱', label: 'Queue',          badge: 5,  badgeColor: 'amber' },
  { href: '/patients',      icon: '👤', label: 'Patients' },
  { href: '/consultation',  icon: '💬', label: 'Consultation' },
  { section: 'Pharmacy' },
  { href: '/pharmacy',      icon: '💊', label: 'Pharmacy',       badge: 3,  badgeColor: 'accent' },
  { href: '/stock',         icon: '📦', label: 'Stock & Vendors' },
  { section: 'Finance' },
  { href: '/reports',       icon: '📊', label: 'Reports' },
  { href: '/accounts',      icon: '💰', label: 'Accounts' },
  { href: '/insurance',     icon: '🛡', label: 'Insurance',      badge: 3,  badgeColor: 'amber' },
  { section: 'Clinical' },
  { href: '/ipd',           icon: '🏥', label: 'IPD',            badge: 4,  badgeColor: 'primary' },
  { href: '/opd-register',  icon: '📋', label: 'OPD Register' },
  { href: '/lab',           icon: '🔬', label: 'Lab & Tests',    badge: 2,  badgeColor: 'accent' },
  { href: '/availability',  icon: '📆', label: 'Availability' },
  { href: '/notifications', icon: '🔔', label: 'Notifications',  badge: 5,  badgeColor: 'accent' },
  { href: '/chat',          icon: '💭', label: 'Team Chat',      badge: 3,  badgeColor: 'primary' },
  { href: '/prescription',  icon: '📄', label: 'Prescription' },
  { href: '/ot',            icon: '⏰', label: 'OT' },
  { href: '/gst',           icon: '🧾', label: 'GST Invoice' },
  { section: 'Admin' },
  { href: '/users',         icon: '👥', label: 'Users & Roles' },
  { href: '/settings',      icon: '⚙️', label: 'Settings' },
]

const badgeStyles: Record<string, React.CSSProperties> = {
  accent:  { background: '#F54858', color: '#fff' },
  primary: { background: '#5CE1E6', color: '#fff' },
  amber:   { background: '#D97706', color: '#fff' },
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const initials = user?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'DR'

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="px-4 py-3 flex items-center gap-2.5 border-b" style={{ borderColor: '#E4EAF0' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#5CE1E6' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">
            The Doctors<span style={{ color: '#5CE1E6' }}>.Ai</span>
          </div>
          <div className="text-xs" style={{ color: '#94A3B8', letterSpacing: '0.3px' }}>
            {user?.clinicCode || 'Clinic OS'}
          </div>
        </div>
      </div>

      {/* Doctor info */}
      <div className="px-3 py-2.5 flex items-center gap-2.5 border-b" style={{ borderColor: '#E4EAF0' }}>
        <div
          className="avatar avatar-md text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #5CE1E6, #2A9EA3)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{user?.name || 'Doctor'}</div>
          <div className="text-xs capitalize" style={{ color: '#94A3B8' }}>{user?.role}</div>
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0"
             style={{ background: '#22c55e', boxShadow: '0 0 0 2px #dcfce7' }} />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} className="nav-section">{item.section}</div>
            )
          }

          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-base w-4 text-center flex-shrink-0" style={{ opacity: isActive ? 1 : 0.6 }}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className="badge text-xs"
                  style={badgeStyles[item.badgeColor || 'accent']}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer — Logout */}
      <div className="p-2 border-t" style={{ borderColor: '#E4EAF0' }}>
        <button
          onClick={logout}
          className="nav-item w-full"
          style={{ color: '#F54858' }}
        >
          <span className="text-base">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}

