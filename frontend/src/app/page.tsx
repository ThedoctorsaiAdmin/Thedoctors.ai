'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, isSuperAdmin } = useAuthStore()

  useEffect(() => {
    if (isSuperAdmin) router.push('/superadmin/dashboard')
    else if (isAuthenticated) router.push('/dashboard')
    else router.push('/login')
  }, [isAuthenticated, isSuperAdmin])

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4F7F9' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>
          The Doctors<span style={{ color:'#5CE1E6' }}>.Ai</span>
        </div>
        <div style={{ fontSize:13, color:'#94A3B8' }}>Loading...</div>
      </div>
    </div>
  )
}
