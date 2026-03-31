import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('thedoctors-auth')
    if (auth) {
      const { state } = JSON.parse(auth)
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`
      }
    }
  }
  return config
})

// Auto refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const auth = localStorage.getItem('thedoctors-auth')
        if (auth) {
          const { state } = JSON.parse(auth)
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken: state.refreshToken }
          )
          // Update store
          const parsed = JSON.parse(auth)
          parsed.state.accessToken = data.accessToken
          localStorage.setItem('thedoctors-auth', JSON.stringify(parsed))
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        }
      } catch {
        // Refresh failed — redirect to login
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── Typed API calls ──
export const authApi = {
  verifyClinic: (code: string) => api.post('/auth/verify-clinic', { code }),
  login: (clinicCode: string, email: string, password: string) =>
    api.post('/auth/login', { clinicCode, email, password }),
  superAdminLogin: (email: string, password: string) =>
    api.post('/auth/superadmin/login', { email, password }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
}

export const patientsApi = {
  list: (params?: any) => api.get('/patients', { params }),
  get: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
}

export const appointmentsApi = {
  list: (params?: any) => api.get('/appointments', { params }),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/appointments/${id}/status`, { status }),
}

export const consultationsApi = {
  list: (params?: any) => api.get('/consultations', { params }),
  create: (data: any) => api.post('/consultations', data),
  update: (id: string, data: any) => api.put(`/consultations/${id}`, data),
  verify: (id: string) => api.post(`/consultations/${id}/verify`),
  createPrescription: (id: string, data: any) =>
    api.post(`/consultations/${id}/prescription`, data),
}

export const usersApi = {
  list: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  updatePermissions: (id: string, permissions: any) =>
    api.put(`/users/${id}/permissions`, { permissions }),
  deactivate: (id: string, reason: string) =>
    api.post(`/users/${id}/deactivate`, { reason }),
  reactivate: (id: string) => api.post(`/users/${id}/reactivate`),
}

export const aiApi = {
  status: () => api.get('/ai/status'),
  transcribe: (audioBase64: string) => api.post('/ai/transcribe', { audioBase64 }),
  extract: (transcript: string) => api.post('/ai/extract', { transcript }),
}

export const ipdApi = {
  list: (params?: any) => api.get('/ipd', { params }),
  admit: (data: any) => api.post('/ipd/admit', data),
  addNote: (admissionId: string, data: any) =>
    api.post(`/ipd/${admissionId}/notes`, data),
  discharge: (admissionId: string, data: any) =>
    api.post(`/ipd/${admissionId}/discharge`, data),
}

export const labApi = {
  list: (params?: any) => api.get('/lab', { params }),
  create: (data: any) => api.post('/lab', data),
  updateStatus: (id: string, data: any) => api.put(`/lab/${id}`, data),
}

export const insuranceApi = {
  claims: (params?: any) => api.get('/insurance/claims', { params }),
  createClaim: (data: any) => api.post('/insurance/claims', data),
  updateClaim: (id: string, data: any) => api.put(`/insurance/claims/${id}`, data),
  companies: () => api.get('/insurance/companies'),
  addCompany: (data: any) => api.post('/insurance/companies', data),
}

export const accountsApi = {
  list: (params?: any) => api.get('/accounts', { params }),
  create: (data: any) => api.post('/accounts', data),
  invoices: (params?: any) => api.get('/accounts/invoices', { params }),
  createInvoice: (data: any) => api.post('/accounts/invoices', data),
}

export const reportsApi = {
  overview: (params?: any) => api.get('/reports/overview', { params }),
  doctors: (params?: any) => api.get('/reports/doctors', { params }),
  revenue: (params?: any) => api.get('/reports/revenue', { params }),
}

export const superAdminApi = {
  dashboard: () => api.get('/superadmin/dashboard'),
  clinics: () => api.get('/superadmin/clinics'),
  suspendClinic: (id: string) => api.post(`/superadmin/clinics/${id}/suspend`),
  activateClinic: (id: string) => api.post(`/superadmin/clinics/${id}/activate`),
  plans: () => api.get('/superadmin/plans'),
  aiUsage: () => api.get('/superadmin/ai-usage'),
}
