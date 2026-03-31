'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const { setSuperAdmin } = useAuthStore()
  const [email, setEmail] = useState('admin@thedoctors.ai')
  const [password, setPassword] = useState('superadmin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await authApi.superAdminLogin(email, password)
      setSuperAdmin(data.accessToken)
      router.push('/superadmin/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">Super Admin Portal</div>
          <div className="text-sm mt-1" style={{ color: '#475569' }}>TheDoctors.Ai Platform Control</div>
        </div>
        <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid #1e293b' }}>
          {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FFF0F1', color: '#F54858' }}>{error}</div>}
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width:'100%', background:'#0f172a', border:'1px solid #1e293b', borderRadius:8, padding:'10px 13px', color:'#e2e8f0', fontFamily:'League Spartan,sans-serif', fontSize:13, outline:'none', boxSizing:'border-box' as any }} />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleLogin()}
              style={{ width:'100%', background:'#0f172a', border:'1px solid #1e293b', borderRadius:8, padding:'10px 13px', color:'#e2e8f0', fontFamily:'League Spartan,sans-serif', fontSize:13, outline:'none', boxSizing:'border-box' as any }} />
          </div>
          <button onClick={handleLogin} disabled={loading}
            style={{ width:'100%', padding:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:8, fontFamily:'League Spartan,sans-serif', fontSize:14, fontWeight:600, cursor:'pointer' }}>
            {loading ? 'Signing in...' : 'Enter Super Admin'}
          </button>
        </div>
        <p className="text-center text-xs mt-4" style={{ color: '#334155' }}>
          <a href="/login" style={{ color: '#5CE1E6' }}>← Back to Clinic Login</a>
        </p>
      </div>
    </div>
  )
}
