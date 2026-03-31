'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function SuperAdminPage() {
  const { isAuthenticated, isSuperAdmin } = useAuthStore()
  const router = useRouter()
  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) router.push('/superadmin/login')
  }, [isAuthenticated, isSuperAdmin])

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <div className="p-8 text-white">
        <div className="text-2xl font-bold">Clinics</div>
        <div className="text-sm mt-1" style={{ color: '#475569' }}>Super Admin · Clinics</div>
      </div>
    </div>
  )
}
