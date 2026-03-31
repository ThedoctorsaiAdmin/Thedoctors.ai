'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'

const mockPatients = [
  { id: '1', code: 'TDA-0001', name: 'Vibha Ak',    age: 34, gender: 'Female', phone: '78 4985 7655', conditions: ['Hypertension', 'Diabetes'], insurance: 'Star Health', lastVisit: '19 Mar 2025', status: 'active' },
  { id: '2', code: 'TDA-0002', name: 'Nithya Kumar', age: 22, gender: 'Female', phone: '87 4563 5422', conditions: [], insurance: '—', lastVisit: '19 Mar 2025', status: 'active' },
  { id: '3', code: 'TDA-0003', name: 'Varun P',      age: 42, gender: 'Male',   phone: '94 8372 1045', conditions: ['Cardiac'], insurance: 'HDFC Ergo', lastVisit: '17 Mar 2025', status: 'ipd' },
  { id: '4', code: 'TDA-0004', name: 'Karthik S',    age: 55, gender: 'Male',   phone: '91 2345 6789', conditions: ['Heart Failure', 'Hypertension'], insurance: '—', lastVisit: '13 Mar 2025', status: 'ipd' },
  { id: '5', code: 'TDA-0005', name: 'Priya R',      age: 38, gender: 'Female', phone: '98 7654 3215', conditions: ['Diabetes'], insurance: 'Ayushman Bharat', lastVisit: '18 Mar 2025', status: 'active' },
  { id: '6', code: 'TDA-0006', name: 'Rajan S',      age: 47, gender: 'Male',   phone: '96 3421 0987', conditions: ['Hypertension'], insurance: '—', lastVisit: '18 Mar 2025', status: 'active' },
]

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = mockPatients.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) || p.code.includes(search.toUpperCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {['all', 'active', 'ipd'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                      className="chip capitalize" style={filter === f ? { background: '#5CE1E6', color: '#fff', borderColor: '#5CE1E6' } : {}}>
                {f === 'all' ? 'All Patients' : f === 'ipd' ? 'IPD' : 'OPD Active'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Search name, phone, ID…"
                   className="px-3 py-2 rounded-lg text-sm outline-none"
                   style={{ border: '1px solid #E4EAF0', width: 220, fontFamily: 'League Spartan, sans-serif' }} />
            <button onClick={() => setShowAdd(true)}
                    className="btn btn-primary">+ New Patient</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Patients', value: '1,248', color: '#5CE1E6' },
            { label: 'New This Month', value: '18',    color: '#059669' },
            { label: 'IPD Active',     value: '4',     color: '#F54858' },
            { label: 'Insured',        value: '342',   color: '#7C3AED' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th><th>Age / Gender</th><th>Phone</th>
                  <th>Conditions</th><th>Insurance</th><th>Last Visit</th>
                  <th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="avatar avatar-sm text-white font-bold text-xs"
                             style={{ background: 'linear-gradient(135deg,#5CE1E6,#2A9EA3)' }}>
                          {p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{p.name}</div>
                          <div className="text-xs" style={{ color: '#94A3B8' }}>{p.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{p.age}y / {p.gender}</td>
                    <td className="text-sm">{p.phone}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {p.conditions.length > 0
                          ? p.conditions.map(c => (
                              <span key={c} className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #E4EAF0' }}>
                                {c}
                              </span>
                            ))
                          : <span style={{ color: '#94A3B8', fontSize: 11 }}>—</span>
                        }
                      </div>
                    </td>
                    <td>
                      {p.insurance !== '—'
                        ? <span className="pill pill-blue text-xs">{p.insurance}</span>
                        : <span style={{ color: '#94A3B8', fontSize: 11 }}>—</span>
                      }
                    </td>
                    <td className="text-sm" style={{ color: '#475569' }}>{p.lastVisit}</td>
                    <td>
                      {p.status === 'ipd'
                        ? <span className="ipd-badge">IPD</span>
                        : <span className="pill pill-green text-xs">Active</span>
                      }
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <a href={`/patients/${p.id}`}
                           className="text-xs px-2 py-1 rounded-md font-semibold"
                           style={{ background: '#EFF6FF', color: '#1e40af' }}>View</a>
                        <a href="/consultation"
                           className="text-xs px-2 py-1 rounded-md font-semibold"
                           style={{ background: '#F0FEFF', color: '#2A9EA3' }}>Consult</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Patient Modal */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Add New Patient</div>
                <button onClick={() => setShowAdd(false)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
                        style={{ border: '1px solid #E4EAF0' }}>×</button>
              </div>
              <div className="modal-body grid grid-cols-2 gap-3">
                <div className="field"><label>Full Name *</label><input type="text" placeholder="Patient full name…"/></div>
                <div className="field"><label>Date of Birth</label><input type="date"/></div>
                <div className="field"><label>Gender *</label>
                  <select><option>Female</option><option>Male</option><option>Other</option></select>
                </div>
                <div className="field"><label>Blood Group</label>
                  <select><option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select>
                </div>
                <div className="field"><label>Phone (WhatsApp) *</label><input type="tel" placeholder="10-digit mobile…"/></div>
                <div className="field"><label>Email</label><input type="email" placeholder="patient@email.com"/></div>
                <div className="field col-span-2"><label>Known Medical Conditions</label>
                  <input type="text" placeholder="Hypertension, Diabetes… (comma separated)"/>
                </div>
                <div className="field"><label>Drug Allergies</label><input type="text" placeholder="Penicillin, Sulfa…"/></div>
                <div className="field"><label>Food Allergies</label><input type="text" placeholder="Peanuts, Shellfish…"/></div>
                <div className="field"><label>Insurance Provider</label>
                  <select>
                    <option value="">— None —</option>
                    <option>Star Health Insurance</option><option>HDFC Ergo</option>
                    <option>Ayushman Bharat (PMJAY)</option><option>CMCHIS (Tamil Nadu)</option>
                    <option>ICICI Lombard</option><option>New India Assurance</option>
                  </select>
                </div>
                <div className="field"><label>Policy Number</label><input type="text" placeholder="Policy / Member ID…"/></div>
                <div className="field col-span-2">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 400, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#5CE1E6', width: 14, height: 14 }}/>
                    Patient consents to receive medication reminders &amp; appointment confirmations via WhatsApp
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm">Cancel</button>
                <button onClick={() => setShowAdd(false)} className="btn btn-primary btn-sm">Add Patient</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
