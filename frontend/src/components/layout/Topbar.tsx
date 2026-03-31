'use client'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

const pageTitles: Record<string, { title: string; crumb: string }> = {
  '/dashboard':     { title: 'Dashboard',       crumb: 'Overview' },
  '/appointments':  { title: 'Appointments',    crumb: 'All appointments' },
  '/queue':         { title: 'Queue',            crumb: 'Live patient queue — today' },
  '/patients':      { title: 'Patients',         crumb: 'All registered patients' },
  '/consultation':  { title: 'Consultation',     crumb: 'AI-powered consultation' },
  '/pharmacy':      { title: 'Pharmacy',         crumb: 'Drug dispensing & orders' },
  '/stock':         { title: 'Stock & Vendors',  crumb: 'Inventory management' },
  '/reports':       { title: 'Reports',          crumb: 'Analytics & insights' },
  '/accounts':      { title: 'Accounts',         crumb: 'Financial overview' },
  '/insurance':     { title: 'Insurance',        crumb: 'Claims & pre-authorisation' },
  '/ipd':           { title: 'IPD',              crumb: 'In-Patient Department' },
  '/opd-register':  { title: 'OPD Register',    crumb: 'Daily out-patient register' },
  '/lab':           { title: 'Lab & Tests',      crumb: 'Investigation orders & results' },
  '/availability':  { title: 'Availability',    crumb: 'Doctor schedules' },
  '/notifications': { title: 'Notifications',   crumb: 'All alerts & messages' },
  '/chat':          { title: 'Team Chat',        crumb: 'Internal communication' },
  '/prescription':  { title: 'Prescription',    crumb: 'Print & send prescription' },
  '/ot':            { title: 'OT',               crumb: 'Operation Theatre' },
  '/gst':           { title: 'GST Invoice',      crumb: 'GST-compliant billing' },
  '/users':         { title: 'Users & Roles',    crumb: 'Access management' },
  '/settings':      { title: 'Settings',         crumb: 'Clinic configuration' },
}

export default function Topbar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const meta = pageTitles[pathname] || { title: 'TheDoctors.Ai', crumb: '' }

  return (
    <header className="topbar">
      <div className="flex-1">
        <div className="font-bold text-lg leading-tight">{meta.title}</div>
        {meta.crumb && (
          <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{meta.crumb}</div>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
           style={{ background: '#F4F7F9', border: '1px solid #E4EAF0', width: 200 }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="#94A3B8">
          <path d="M7 2a5 5 0 100 10A5 5 0 007 2zm7 11l-3.5-3.5"/>
        </svg>
        <input
          placeholder="Search patients…"
          className="bg-transparent outline-none text-sm flex-1"
          style={{ fontFamily: 'League Spartan, sans-serif', color: '#0F172A' }}
        />
      </div>

      {/* Notifications bell */}
      <a href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="#475569">
          <path d="M8 1a5 5 0 00-5 5v3l-1 2h12l-1-2V6a5 5 0 00-5-5zm-1 13h2a1 1 0 01-2 0z"/>
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#F54858', fontSize: '9px' }}>
          5
        </span>
      </a>

      {/* User avatar */}
      <div className="flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold leading-tight">{user?.name}</div>
          <div className="text-xs capitalize" style={{ color: '#94A3B8' }}>{user?.role}</div>
        </div>
        <div
          className="avatar avatar-sm text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #5CE1E6, #2A9EA3)' }}
        >
          {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
