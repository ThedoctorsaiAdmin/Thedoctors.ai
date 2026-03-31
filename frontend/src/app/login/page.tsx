'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

type Step = 1 | 2 | 3

interface ClinicInfo {
  code: string
  name: string
  city: string
  state: string
  plan: { name: string }
}

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, setSuperAdmin } = useAuthStore()
  const [step, setStep] = useState<Step>(1)
  const [clinicCode, setClinicCode] = useState('TDA-2045')
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null)
  const [email, setEmail] = useState('dr.james@thedoctors.ai')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Verify clinic code
  const handleVerifyClinic = async () => {
    if (!clinicCode.trim()) return setError('Please enter your clinic code')
    setLoading(true)
    setError('')
    try {
      const { data } = await authApi.verifyClinic(clinicCode.trim())
      if (data.isSuperAdmin) {
        router.push('/superadmin/login')
        return
      }
      setClinicInfo(data.clinic)
      setStep(2)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Clinic code not found')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — Login
  const handleLogin = async () => {
    if (!email || !password) return setError('Please enter email and password')
    setLoading(true)
    setError('')
    setStep(3)
    try {
      const { data } = await authApi.login(clinicCode.trim().toUpperCase(), email, password)
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success(`Welcome, ${data.user.name}!`)
      router.push('/dashboard')
    } catch (err: any) {
      setStep(2)
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const initials = clinicInfo?.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F7F9' }}>
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex flex-1 flex-col items-center justify-center p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #2A9EA3 0%, #5CE1E6 50%, #7EEAEE 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute w-96 h-96 rounded-full opacity-5 bg-white -top-20 -right-20" />
        <div className="absolute w-72 h-72 rounded-full opacity-5 bg-white -bottom-16 -left-12" />

        <div className="relative z-10 max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-1">
              The Doctors<span style={{ color: '#0F172A' }}>.Ai</span>
            </h1>
            <p className="text-sm text-white/80 mt-3 leading-relaxed">
              AI-powered clinic management platform for modern healthcare providers.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              'AI consultation — any language to English',
              'OPD, IPD, Pharmacy, Lab in one platform',
              'WhatsApp reminders & follow-up automation',
              'Insurance claims & GST billing',
              'Multi-clinic, multi-doctor access control',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-white/90">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                    <path d="M1 6l3.5 3.5L11 2"/>
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>

          {/* Demo codes */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Demo Clinic Codes</div>
            <div className="space-y-2">
              {[
                { name: 'TheDoctors.Ai Cardiac', code: 'TDA-2045' },
                { name: 'Sunrise General Clinic', code: 'SGC-1001' },
                { name: 'Super Admin Portal', code: 'SADMIN', highlight: true },
              ].map((item) => (
                <div key={item.code} className="flex justify-between items-center text-sm">
                  <span className="text-white/80">{item.name}</span>
                  <code
                    className="font-bold tracking-widest px-2 py-0.5 rounded text-xs"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      color: item.highlight ? '#FFD700' : '#fff'
                    }}
                  >
                    {item.code}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-[460px] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Step indicators */}
          <div className="flex items-center gap-0 mb-8">
            {[
              { n: 1, label: 'Clinic Code' },
              { n: 2, label: 'Sign In' },
              { n: 3, label: 'Access' },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                    style={{
                      borderColor: step > s.n ? '#059669' : step === s.n ? '#5CE1E6' : '#E4EAF0',
                      background: step > s.n ? '#059669' : step === s.n ? '#F0FEFF' : '#fff',
                      color: step > s.n ? '#fff' : step === s.n ? '#2A9EA3' : '#94A3B8'
                    }}
                  >
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <span className="text-xs font-medium" style={{ color: step === s.n ? '#2A9EA3' : '#94A3B8' }}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="h-0.5 flex-1 mb-4 mx-1 transition-all"
                       style={{ background: step > s.n + 1 ? '#059669' : '#E4EAF0' }} />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FFF0F1', color: '#F54858', border: '1px solid #fca5a5' }}>
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Enter Clinic Code</h2>
              <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                Your unique code was assigned when your clinic was registered.
              </p>
              <div className="field">
                <label>Clinic Code</label>
                <input
                  type="text"
                  value={clinicCode}
                  onChange={(e) => setClinicCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyClinic()}
                  placeholder="e.g. TDA-2045"
                  className="text-center text-xl font-bold tracking-widest"
                  maxLength={10}
                  style={{ letterSpacing: '3px' }}
                />
              </div>
              <button
                onClick={handleVerifyClinic}
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all"
                style={{ background: loading ? '#A8F0F2' : '#5CE1E6' }}
              >
                {loading ? 'Verifying...' : 'Continue →'}
              </button>
              <p className="text-center text-xs mt-4" style={{ color: '#94A3B8' }}>
                Don't have a code?{' '}
                <a href="/register" className="font-semibold" style={{ color: '#5CE1E6' }}>
                  Register your clinic →
                </a>
              </p>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && clinicInfo && (
            <div>
              {/* Clinic verified card */}
              <div className="flex items-center gap-3 p-3 rounded-xl mb-6"
                   style={{ background: '#F0FEFF', border: '1px solid #A8F0F2' }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: '#5CE1E6' }}
                >
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: '#2A9EA3' }}>{clinicInfo.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#5CE1E6' }}>
                    {clinicInfo.city}, {clinicInfo.state} · {clinicInfo.plan?.name} Plan
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                    Code: <strong style={{ letterSpacing: '1px' }}>{clinicInfo.code}</strong>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#5CE1E6">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              <h2 className="text-xl font-bold mb-4">Sign In</h2>
              <div className="field">
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clinic.com" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Your password" />
              </div>
              <div className="flex justify-end mb-4">
                <button className="text-xs font-semibold" style={{ color: '#5CE1E6' }}>
                  Forgot password?
                </button>
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm mb-3 transition-all"
                style={{ background: '#5CE1E6' }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setStep(1); setError('') }}
                className="w-full text-center text-xs"
                style={{ color: '#94A3B8' }}
              >
                ← Use a different clinic code
              </button>
            </div>
          )}

          {/* STEP 3 - Loading */}
          {step === 3 && (
            <div className="text-center py-10">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#F0FEFF', border: '3px solid #5CE1E6', animation: 'pulseRing 1.4s ease-out infinite' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#5CE1E6">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
              <div className="text-lg font-bold mb-2">Signing you in...</div>
              <div className="text-sm" style={{ color: '#94A3B8' }}>Setting up your workspace</div>
            </div>
          )}

          <p className="text-center text-xs mt-8" style={{ color: '#94A3B8' }}>
            Platform by TheDoctors.Ai ·{' '}
            <a href="/superadmin/login" className="font-semibold" style={{ color: '#5CE1E6' }}>
              Super Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
