'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import api from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayPatients: 34, pendingQueue: 5, completedConsultations: 28,
    revenue: '₹13,600', appointments: 8, lowStock: 3
  })

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Today\'s OPD', value: stats.todayPatients, icon: '👤', color: '#5CE1E6', bg: '#F0FEFF' },
            { label: 'Queue Waiting', value: stats.pendingQueue, icon: '⏱', color: '#D97706', bg: '#FFFBEB' },
            { label: 'Completed', value: stats.completedConsultations, icon: '✅', color: '#059669', bg: '#ECFDF5' },
            { label: 'Revenue', value: stats.revenue, icon: '💰', color: '#059669', bg: '#ECFDF5' },
            { label: 'Appointments', value: stats.appointments, icon: '📅', color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Low Stock', value: stats.lowStock, icon: '⚠️', color: '#F54858', bg: '#FFF0F1' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                     style={{ background: s.bg }}>{s.icon}</div>
              </div>
              <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's Queue */}
          <div className="card lg:col-span-1">
            <div className="card-header">
              <div className="card-title">Live Queue</div>
              <span className="pill pill-primary text-xs">5 waiting</span>
            </div>
            <div className="divide-y" style={{ borderColor: '#E4EAF0' }}>
              {[
                { num: 1, name: 'Vibha Ak', time: '09:05', status: 'In Consultation', active: true },
                { num: 2, name: 'Nithya Kumar', time: '09:18', status: 'Waiting', active: false },
                { num: 3, name: 'Varun P', time: '09:30', status: 'Waiting', active: false },
                { num: 4, name: 'Priya R', time: '09:42', status: 'Waiting', active: false },
                { num: 5, name: 'Rajan S', time: '10:05', status: 'Waiting', active: false },
              ].map((p) => (
                <div key={p.num} className="flex items-center gap-3 px-4 py-3"
                     style={{ background: p.active ? '#F0FEFF' : undefined }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style={{ background: p.active ? '#5CE1E6' : '#E4EAF0', color: p.active ? '#fff' : '#94A3B8' }}>
                    {p.num}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs" style={{ color: '#94A3B8' }}>{p.time}</div>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: p.active ? '#2A9EA3' : '#94A3B8' }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="card lg:col-span-2">
            <div className="card-header">
              <div className="card-title">Today's Appointments</div>
              <a href="/appointments" className="text-xs font-semibold" style={{ color: '#5CE1E6' }}>View All →</a>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th><th>Time</th><th>Doctor</th><th>Type</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Vibha Ak', time: '09:05', doctor: 'Dr. James', type: 'Follow-up', status: 'In Progress', sc: '#5CE1E6' },
                    { name: 'Nithya Kumar', time: '09:18', doctor: 'Dr. Anil', type: 'New', status: 'Waiting', sc: '#D97706' },
                    { name: 'Varun P', time: '09:30', doctor: 'Dr. James', type: 'Follow-up', status: 'Waiting', sc: '#D97706' },
                    { name: 'Priya R', time: '10:00', doctor: 'Dr. Anil', type: 'Follow-up', status: 'Scheduled', sc: '#94A3B8' },
                    { name: 'Rajan S', time: '10:15', doctor: 'Dr. James', type: 'New', status: 'Scheduled', sc: '#94A3B8' },
                  ].map((a) => (
                    <tr key={a.name}>
                      <td><div className="font-semibold text-sm">{a.name}</div></td>
                      <td><span className="pill pill-primary text-xs">{a.time}</span></td>
                      <td className="text-sm" style={{ color: '#475569' }}>{a.doctor}</td>
                      <td><span className={a.type === 'New' ? 'opd-badge' : 'pill pill-gray text-xs'}>{a.type}</span></td>
                      <td><span className="text-xs font-semibold" style={{ color: a.sc }}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><div className="card-title">Quick Actions</div></div>
            <div className="card-body grid grid-cols-2 gap-2">
              {[
                { label: 'New Patient', href: '/patients', icon: '👤', color: '#5CE1E6' },
                { label: 'New Appointment', href: '/appointments', icon: '📅', color: '#2563EB' },
                { label: 'Admit IPD', href: '/ipd', icon: '🏥', color: '#7C3AED' },
                { label: 'Lab Order', href: '/lab', icon: '🔬', color: '#D97706' },
                { label: 'New Claim', href: '/insurance', icon: '🛡', color: '#059669' },
                { label: 'GST Invoice', href: '/gst', icon: '🧾', color: '#F54858' },
              ].map((a) => (
                <a key={a.label} href={a.href}
                   className="flex flex-col items-center gap-1 p-3 rounded-lg border text-center transition-all hover:shadow-sm"
                   style={{ borderColor: '#E4EAF0' }}>
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: '#475569' }}>{a.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Patients */}
          <div className="card lg:col-span-2">
            <div className="card-header">
              <div className="card-title">Recent Patients</div>
              <a href="/patients" className="text-xs font-semibold" style={{ color: '#5CE1E6' }}>All Patients →</a>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>ID</th><th>Conditions</th><th>Last Visit</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                <tbody>
                  {[
                    { name: 'Vibha Ak', id: '#2673487564', conditions: ['Hypertension', 'Diabetes'], last: '19 Mar 2025' },
                    { name: 'Nithya Kumar', id: '#4782640981', conditions: [], last: '11 Mar 2023' },
                    { name: 'Varun P', id: '#8834729102', conditions: ['Cardiac'], last: '17 Mar 2025' },
                    { name: 'Karthik S', id: '#9910283746', conditions: ['Heart Failure'], last: '13 Mar 2025' },
                  ].map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar avatar-sm text-white font-bold"
                               style={{ background: 'linear-gradient(135deg, #5CE1E6, #2A9EA3)' }}>
                            {p.name.split(' ').map(w => w[0]).join('')}
                          </div>
                          <div className="font-semibold text-sm">{p.name}</div>
                        </div>
                      </td>
                      <td className="text-xs" style={{ color: '#94A3B8' }}>{p.id}</td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {p.conditions.map(c => (
                            <span key={c} className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: '#F4F7F9', border: '1px solid #E4EAF0', color: '#475569' }}>{c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-xs" style={{ color: '#94A3B8' }}>{p.last}</td>
                      <td style={{ textAlign: 'right' }}>
                        <a href="/consultation" className="text-xs font-semibold px-2 py-1 rounded"
                           style={{ background: '#F0FEFF', color: '#2A9EA3' }}>Consult</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
